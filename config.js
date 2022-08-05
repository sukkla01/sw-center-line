const mysql = require('mysql')

const db = new mysql.createConnection({
    host: '192.168.0.32',
    user: 'ict009',
    password: 'Ss0810432245',
    database: 'ssw_center',
    port: '3306'
});


module.exports = db;