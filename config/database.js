const mysql = require('mysql2/promise');

// Crear un "pool" de conexiones a la base de datos
// Un pool es más eficiente que crear una conexión por cada consulta
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // Corregido para que coincida con .env
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar la conexión
pool.getConnection()
    .then(connection => {
        console.log('Conexión a la base de datos establecida con éxito.');
        connection.release(); // Devolver la conexión al pool
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Verifica que el usuario y la contraseña de la base de datos en tu archivo .env son correctos.');
        }
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            console.error('No se pudo conectar al host de la base de datos. Verifica que la dirección del host y el puerto son correctos y que el servidor de la base de datos está en ejecución.');
        }
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error(`La base de datos "${process.env.DB_DATABASE}" no existe. Asegúrate de crearla.`);
        }
    });

module.exports = pool;
