module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var query = require('../blockchain/query.js');
	var dna = require('../config/dna');
	var readDB = require('./readDB');

	var peer = dna.peer;
	var channelName = dna.channelName;
	var chaincodeName = dna.chaincodeName;
	var username = dna.username;
	var orgname = dna.orgname;

	function date_descending(a, b) {
		var dateA = new Date(a.timestamp).getTime();
		var dateB = new Date(b.timestamp).getTime();
		return dateA > dateB ? 1 : -1;
	};

	router.get('/items', async function (req, res) {
		res.status(200);

		var sellitemquery = 'SELECT * FROM newbabodb.Product AS Pd\
							LEFT OUTER JOIN newbabodb.Order AS Od ON Pd.Product_id = Od.Product_id WHERE Pd.Member_id =\
							\''+ req.session.userID + '\';';
		var my_list = await readDB(sellitemquery);
		res.render('user_items', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'cart',
			my_items: my_list,
		});
	});

	router.get('/requests', async function (req, res) {
		res.status(200);

		var buyitemquery = "select * from newbabodb.Product where Product_id in\
                            (select Product_id from newbabodb.Order where Member_id ='"+ req.session.userID + "')";
		var my_list = await readDB(buyitemquery);
		res.render('user_requests', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'cart',
			my_request: my_list,
		});
	});

	router.get('/history/:args', async function (req, res) {
		res.status(200);

		var _results_json = new Array();
		var queryString = "SELECT RRN_hash FROM Member WHERE id = " + "'" + req.params.args + "'";

		var rows = await readDB(queryString);
		var args = [rows[0].RRN_hash];
		var fcn = 'queryBySeller';
		
		if (req.query.flag == 'buy') fcn = 'queryByBuyer';
		var _result = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);

		if (_result == '');
		else {
			var _results = _result.split('&&');
			for (var i = 0; i < _results.length; i++) {
				_results_json.push(JSON.parse(_results[i]));
			}
			// sorting
			if (_results.length > 1) {
				_results_json.sort(date_descending);
			}
		}

		res.render('user_history', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'null',
			result: _results_json,
			flag: req.query.flag,
			type: req.query.type
		});

	});

	return router;
}