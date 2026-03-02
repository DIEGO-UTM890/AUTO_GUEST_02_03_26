const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Acceso no autorizado' });
    }
};

// @route   POST /api/resenas
// @desc    Crear una nueva reseña para un taller
// @access  Private
router.post('/', isAuthenticated, async (req, res) => {
    const idCliente = req.session.userId;
    const { idTaller, calificacion, comentario } = req.body;

    // Validación
    if (!idTaller || !calificacion) {
        return res.status(400).json({ error: 'El taller y la calificación son obligatorios' });
    }

    if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }

    try {
        // Insertar reseña (idResena es auto-increment en la BD)
        await db.query(
            'INSERT INTO resenas (idTaller, idUsuario, calificacion, comentario) VALUES (?, ?, ?, ?)',
            [idTaller, idCliente, calificacion, comentario || '']
        );

        res.status(201).json({
            success: true,
            mensaje: '¡Gracias por tu reseña!'
        });

    } catch (error) {
        console.error('Error al guardar reseña:', error);
        res.status(500).json({ error: 'Error al guardar la reseña' });
    }
});

// @route   GET /api/resenas/:idTaller
// @desc    Obtener todas las reseñas de un taller
// @access  Public
router.get('/:idTaller', async (req, res) => {
    const { idTaller } = req.params;

    try {
        const [resenas] = await db.query(`
            SELECT r.idResena, r.calificacion, r.comentario, r.fecha,
                   u.nombre as clienteNombre
            FROM resenas r
            JOIN usuario u ON r.idUsuario = u.idUsuario
            WHERE r.idTaller = ?
            ORDER BY r.fecha DESC
        `, [idTaller]);

        res.json(resenas);

    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({ error: 'Error al obtener las reseñas' });
    }
});

module.exports = router;
