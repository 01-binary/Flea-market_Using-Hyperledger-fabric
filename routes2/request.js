module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var query = require('../blockchain/query.js');
	var rna = require('../config/rna');
	var readDB = require('./readDB');
	var myinvoke = require('./invoke')

	var peer = rna.peer;
	var channelName = rna.channelName;
	var chaincodeName = rna.chaincodeName;
	var username = rna.username;
	var orgname = rna.orgname;

	function date_descending(a, b) {
        var dateA = new Date(a.timestamp).getTime();
        var dateB = new Date(b.timestamp).getTime();
        return dateA < dateB ? 1 : -1;
    };

	router.get('/history/:args', async function (req, res) {
        res.status(200);

        var _type = req.query.type;
        var _results_json = new Array();
        var queryString = "SELECT RRN_hash FROM Member WHERE id = " + "'" + req.params.args + "'";
		
		var rows = await readDB(queryString);
		var args = [rows[0].RRN_hash];
		var fcn = 'queryBySeller';
		var _result = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
		if (_result == '');
		else {
			var _results = _result.split('&&');
			for (var i = 0; i < _results.length; i++) {
				_results_json.push(JSON.parse(_results[i]));
			}
			// sorting
			if(_results.length>1){
				_results_json.sort(date_descending);
			}

		}
		res.render('history', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'null',
			result: _results_json,
			sellerID: req.params.args,
			type: _type
		});
                
    });
	

	router.get('/match', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'insert into rna.Order (invoice_number, Member_id, Product_id, Product_status,status_read) values(?,?,?,?,?)';
		var query3 = 'UPDATE rna.Product SET status=1 WHERE Product_id = ' + req.query.pid + ';';

		await readDB(query3);
		await readDB(query2, [0, req.session.userID, req.query.pid, 1, 0]);
		var rows = await readDB(query);
		await myinvoke(rows, 'match');
		res.redirect('/product?pid=' + req.query.pid);
	});
	
	router.post('/shipping', async function (req, res) {
		var invoice = req.body['invoice'];
		var number = req.body['number'];
		var pid = req.body['pd_id'];
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Order where Product_id = ' + pid + ') and Product.Product_id = ' + pid + ' and Order.Product_id = ' + pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Product where Product_id = ' + pid + ') and Product.Product_id = ' + pid + ' and Order.Product_id = ' + pid;
		var invoicequery = 'UPDATE rna.Order SET invoice_number='+'\''+invoice+'\'\
							WHERE Number='+'\''+number+'\';';
		var changestatusquery = 'UPDATE rna.Product SET status=2 WHERE Product_id = ' + pid + ';';

		var rows = await readDB(query);
		await readDB(invoicequery);
		await readDB(changestatusquery);
		await myinvoke(rows, 'shipping');
		
		res.redirect('/user/items');
	});

	router.get('/finish', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'DELETE * rna.Order WHERE Number = ';
		var query3 = 'UPDATE rna.Product SET status=3 WHERE Product_id = ' + req.query.pid + ';';

		await readDB(query3);
		var rows = await readDB(query);
		await myinvoke(rows,'finish');
		await readDB(query2+rows[1].Number);
		res.redirect('/user/requests');
	});

	router.get('/cancel', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'DELETE FROM rna.Order WHERE Product_id='+'\''+req.query.pid+'\'';
		var query3 = 'UPDATE rna.Product SET status=0 WHERE Product_id = ' + req.query.pid + ';';

		await readDB(query3);
		var rows = await readDB(query);
		await myinvoke(rows,'cancel');
		await readDB(query2);
		res.redirect('back');
	});
	
	router.get('/report', async function (req, res) {
		var query = 'select id,Member_name,RRN_hash,Product_name,Product_price,Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Order where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid + '\
					union\
					select id,Member_name,RRN_hash,Product_name,Product_price, Number\
					from rna.Member, rna.Product, rna.Order\
					where id =(select Member_id from rna.Product where Product_id = ' + req.query.pid + ') and Product.Product_id = ' + req.query.pid + ' and Order.Product_id = ' + req.query.pid;
		var query2 = 'DELETE * rna.Order WHERE Number = ';
		var query3 = 'UPDATE rna.Product SET status=4 WHERE Product_id = ' + req.query.pid + ';';
		await readDB(query3);
		var rows = await readDB(query);
		await myinvoke(rows,'report');
		await readDB(query2+rows[1].Number);
		res.redirect('/user/requests');
	});

	return router;
}