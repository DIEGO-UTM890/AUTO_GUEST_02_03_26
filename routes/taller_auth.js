const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../config/database');
const router = express.Router();

// LOGIN TALLER (MEJORADO PARA TRAER NOMBRE DEL TALLER)
router.post('/login-taller', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuario
        const [users] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);

        if (users.length === 0) return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
        const user = users[0];

        // 2. Verificar contraseña con Bcrypt
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch && password === user.password) {
            // Fallback para contraseñas en texto plano (migración)
            isMatch = true;
        }

        if (!isMatch) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
        }

        // 3. Buscar si es Admin y OBTENER EL NOMBRE DEL TALLER
        // Hacemos un JOIN para traer el nombre del taller en la misma consulta
        const [admins] = await db.query(`
            SELECT a.idTaller, t.nombre as nombreTaller 
            FROM administrador a
            JOIN taller t ON a.idTaller = t.idTaller
            WHERE a.idUsuario = ?
        `, [user.idUsuario]);

        if (admins.length === 0) {
            return res.status(403).json({ mensaje: 'No eres administrador de taller.' });
        }

        const datosTaller = admins[0];

        // Guardar en sesión
        req.session.userId = user.idUsuario;
        req.session.tallerId = datosTaller.idTaller;
        req.session.role = 'taller';

        // 4. Responder con TODO (Usuario + Nombre del Taller)
        res.status(200).json({
            success: true,
            mensaje: 'Bienvenido al Portal del Taller.',
            userName: user.nombre,          // Nombre de la persona (ej: Juan Pérez)
            tallerName: datosTaller.nombreTaller, // Nombre del negocio (ej: AutoSur) <--- NUEVO
            tallerId: datosTaller.idTaller,
            redirectTo: 'portal_taller.html'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error del servidor.' });
    }
});

// REGISTRO TALLER (Mantenemos lo que ya funcionaba)
router.post('/taller', async (req, res) => {
    const { nombreAdmin, nombreTaller, direccion, email, password, telefono } = req.body;

    // --- VALIDACIONES ---
    if (!nombreAdmin || !nombreTaller || !email || !password || !telefono) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // Nombre Admin: Solo letras y espacios
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(nombreAdmin)) {
        return res.status(400).json({ mensaje: 'El nombre del administrador no es válido (solo letras y espacios).' });
    }

    // Teléfono: 10 dígitos numéricos
    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({ mensaje: 'El teléfono debe tener exactamente 10 dígitos.' });
    }

    // Email: Estructura válida
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ mensaje: 'El formato del correo electrónico no es válido.' });
    }
    // --------------------

    try {
        const idTaller = 'T' + nanoid(5);
        const idAdmin = 'UA' + nanoid(5);

        // --- ENCRIPTAR CONTRASEÑA ---
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Guardamos Taller (OBLIGATORIO: incluir idUsuarioAdmin en Aiven)
        await db.query('INSERT INTO taller (idTaller, nombre, direccion, idUsuarioAdmin, telefono, email) VALUES (?, ?, ?, ?, ?, ?)',
            [idTaller, nombreTaller, direccion, idAdmin, telefono, email]);

        // 2. Guardamos Usuario (Usamos la clave encriptada)
        await db.query('INSERT INTO usuario (idUsuario, nombre, email, password, telefono) VALUES (?, ?, ?, ?, ?)',
            [idAdmin, nombreAdmin, email, hashedPassword, telefono]);

        // 3. Vincular en la tabla administrador
        await db.query('INSERT INTO administrador (idUsuario, idTaller) VALUES (?, ?)', [idAdmin, idTaller]);

        res.status(201).json({ mensaje: 'Taller registrado con éxito.' });
    } catch (e) {
        console.error('Error en registro:', e);
        res.status(500).json({ mensaje: 'Error al registrar el taller en la base de datos.' });
    }
});

module.exports = router;