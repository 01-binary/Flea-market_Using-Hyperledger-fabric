var mysqlDB = require('../config/db');

var readDB = function(){
    if(arguments.length == 1){
        query = arguments[0];
        return new Promise(function(resolve, reject){
            mysqlDB.query(query,  function(err, rows, fields ){
                if(err){
                    console.log(query+": "+err);
                }
                resolve(rows);
            });
        })
    }else if(arguments.length == 2){
        query = arguments[0];
        params = arguments[1];
        return new Promise(function(resolve, reject){
            mysqlDB.query(query, params, function(err, rows, fields ){
                if(err){
                    console.log(query+": "+err);
                }
                resolve(rows);
            });
        })
    }
     
}

module.exports = readDB;