// config/database.js
require('dotenv').config()

module.exports = {
  connection: {
    connectionLimit: 20,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'xmas'
  },
  database: 'xmas',
  users_table: 'users'
}
