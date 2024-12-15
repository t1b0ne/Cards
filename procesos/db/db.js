// procesos/db/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'usuario',        // Tu usuario de base de datos
  host: 'localhost',      // Dirección de la base de datos
  database: 'cards_against_humanity',  // Nombre de la base de datos
  password: 'contraseña', // Tu contraseña de base de datos
  port: 5432,             // Puerto por defecto de PostgreSQL

  connectionString: process.env.DATABASE_URL, // URL proporcionada por Heroku
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool; // Exportar la conexión para usarla en el servidor