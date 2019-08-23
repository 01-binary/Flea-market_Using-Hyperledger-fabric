module.exports = function (app) {

	var express = require('express');
	var router = express.Router();
	var crypto = require('crypto');
	var Database = require("../config/db2");

	router.get('/', function (req, res) {
		res.status(200);

		res.render('index', {
			login: req.session.login,
			userid: req.session.userID,
			username: req.session.username,
			authority: req.session.authority,
			page: 'main'
		});
	});

	router.post('/join', function (req, res) {
		res.status(200);

		var queryString = 'select id from Member';
		var queryString2 = 'insert into Member (id,pw,phone_number,Email,admin,Member_name,RRN_hash) VALUES (?,?,?,?,?,?,?)';
		var flag = true;

		// newid: new_userID,
		// newpw: new_userPW,
		// newpw_c: new_userPW_confirm,
		// newusername: new_userName,
		// newuserPN: new_userPN,
		// newuserEmail: new_userEmail
		//console.log(req.body.newuserRRN);
		var converted = String(req.body.newuserRRN);
		var RRNhash = crypto.createHash('sha256').update(converted).digest('base64');
		// console.log(RRNhash);
		// console.log(RRNhash.length);

		if (req.body.newpw != req.body.newpw_c) {
			res.send({ msg: "비밀번호가 서로 같지 않습니다!" });
		}
		else {
			Database.query(queryString, function (err, result) {
				if (err) {
					//console.log(err);
				}
				else {
					result.forEach(function (item) {
						if (item.id == req.body.newid) {
							//중복아뒤 존재
							flag = false;
						}
					});

					if (!flag) {
						res.send({ msg: "이미 존재하는 아이디입니다!" });
					}
					else {
						var params = [req.body.newid, req.body.newpw, req.body.newuserPN, req.body.newuserEmail, 0, req.body.newusername,RRNhash];
						Database.query(queryString2, params, function (err) {
							if (err) {
								//console.log(err);
							}
							else {
								res.send({ msg: "회원가입에 성공하셨습니다!" });
							}
						})
					}
				}
			})
		}
	});

	router.post('/login', function (req, res) {

		res.status(200);

		var queryString = 'select * from Member';
		var flag = false;
		Database.query(queryString, function (err, result) {
			if (err) {
				 console.log(err);
			 }
			else {
				result.forEach(function (item) {
					if (item.id == req.body.id && item.pw == req.body.pw) {

						req.session.userID = item.id;
						req.session.username = item.Member_name;
						req.session.authority = item.admin;
						req.session.login = 'login';
						flag = true;
						req.session.save(() => {
							res.redirect('/');
						});
					}
				})
				if (!flag) res.send({ msg: "아이디 또는 비밀번호를 확인해주세요!" });
			}
		})
	});

	router.get('/logout', function (req, res) {
		res.status(200);

		req.session.destroy(function (err) {
			if (err) {
				console.log("Session destroy Error");
			} else {
				res.redirect('/');
			}
		})
	});

	return router;
}
