const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gestion_taller'
        });

        console.log('--- Database Status Check ---');
        const [tablesRows] = await connection.query('SHOW TABLES');
        const actualTables = tablesRows.map(t => Object.values(t)[0]);
        console.log('Actual Tables:', actualTables);

        const requiredTables = [
            'administrador', 'cita', 'cliente', 'iteminventario',
            'lineapedido', 'mecanico', 'notificacion', 'pedido',
            'resenas', 'usuario', 'vehiculo', 'ticketsoporte', 'chat_mensaje'
        ];

        console.log('\n--- Missing Tables Check ---');
        const missing = requiredTables.filter(t => !actualTables.includes(t));
        if (missing.length > 0) {
            console.log('MISSING TABLES:', missing);
            console.log('You should import the SQL file or run the scripts.');
        } else {
            console.log('ALL REQUIRED TABLES ARE PRESENT.');
        }

        await connection.end();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

checkDatabase();
