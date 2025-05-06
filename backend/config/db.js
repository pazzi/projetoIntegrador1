const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'tpw100',
  database: process.env.DB_NAME || 'padaria_nutri'
});

module.exports = db;