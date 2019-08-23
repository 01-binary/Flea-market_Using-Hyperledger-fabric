var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'example',
    user: 'example',
    password: 'example',
    database: 'rna',
    port: example
});

module.exports = connection;