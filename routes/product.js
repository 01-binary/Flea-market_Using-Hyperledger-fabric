module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var mysqlDB = require('../config/db');

	router.get('/', function (req, res) {
		res.status(200);
		
		var query = 'SELECT * FROM newbabodb.Product WHERE Product_id = '+ req.query.pid+';';
		mysqlDB.query(query, function(err, rows, fields ){
			if(err){
				console.log('query error :'+err);
			}
			res.render('product', {
				login: req.session.login,
				userid: req.session.userID,
				username: req.session.username,
				authority: req.session.authority,
				page: 'product',
				items: rows,
				availability: 'yes',
				//buyrequest: buyrequest()
			});
		})
	});



	return router;
}