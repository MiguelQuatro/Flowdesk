// Conexão com o banco de dados MySQL usando o pacote mysql2/promise
require("dotenv").config();

const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

module.exports = db;

//ESTÁ CERTO PORÉM ESTÁ DANDO ERRO
