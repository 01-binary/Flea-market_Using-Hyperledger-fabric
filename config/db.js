var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'example',
    user: 'example',
    password: 'example',
    database: 'newbabodb',
    port: example
});

module.exports = connection;