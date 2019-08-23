module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var multer = require('multer')
	var dateFormat = require('dateformat');
	var timeStamp = Date.now();
	var mysqlDB = require('../config/db');
	var readDB = require('./readDB');
	var _storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, 'public/product_img/')
		},
		filename: function (req, file, cb) {
			cb(null, Date.now() + '.jpg');
		}
	});
    var upload = multer({ storage: _storage });

	router.get('/', async function (req, res) {
		res.status(200);
		var rows = await readDB('SELECT * FROM newbabodb.Product;');
		res.render('items', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'categories',
			items: rows
		});
		/*
		mysqlDB.query('SELECT * FROM newbabodb.Product;', function(err, rows, fields ){
			if(err){
				console.log('query error :'+err);
			}
			res.render('items', {
				login: req.session.login,
				userid: req.session.userID,
				username: req.session.username,
				authority: req.session.authority,
				page: 'categories',
				items: rows
			});
		})
		*/
		
	});

	router.get('/registration', function (req, res) {
		res.status(200);

		res.render('item_registration', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'categories'
		});
	});
	
	router.post('/registration', upload.single('img1'),  async function (req, res) {
		var pd_name = req.body['product_name'];
		var pd_price = req.body['price'];
		var pd_content = req.body['content'];
		var seller = req.session.userID;
		var time=dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
		var pd_img = '/product_img/'+req.file.filename;
		var queryString = 'insert into newbabodb.Product (img_path, Member_id, Product_price, Product_name, Product_content, date, status) values(?,?,?,?,?,?,?)';
		readDB(queryString,[pd_img,seller,pd_price,pd_name,pd_content,time,0]);
		res.redirect('/items');
	});

	return router;
}