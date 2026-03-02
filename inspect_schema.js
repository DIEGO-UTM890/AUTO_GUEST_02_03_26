const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from .env file

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gestion_taller'
});

(async () => {
    try {
        console.log('--- TABLE: taller ---');
        const [tallerCols] = await db.query('SHOW COLUMNS FROM taller');
        console.log(tallerCols.map(c => c.Field).join(', '));

        console.log('\n--- TABLE: mecanico ---');
        const [mecCols] = await db.query('SHOW COLUMNS FROM mecanico');
        console.log(mecCols.map(c => c.Field).join(', '));

        console.log('\n--- TABLE: cita ---');
        const [citaCols] = await db.query('SHOW COLUMNS FROM cita');
        console.log(citaCols.map(c => c.Field).join(', '));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
