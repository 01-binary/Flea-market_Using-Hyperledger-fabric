/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.test
 */
'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var session = require('express-session');
var expressLayouts = require('express-ejs-layouts');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');

require('./config.js');
var hfc = require('fabric-client');

var mysqlDB = require('./config/db2');
mysqlDB.connect();

var helper = require('./blockchain/helper.js');
var invoke = require('./blockchain/invoke-transaction.js');
var query = require('./blockchain/query.js');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || hfc.getConfigSetting('port');
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
app.set('views', './views2');
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('./public'));
app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));

// ------- Create Session -------
var createSession = function createSession() {
	return function (req, res, next) {
		if (!req.session.login) {
			req.session.login = 'logout';
		}
		next();
	};
};
app.use(session({
	secret: '1234DSFs@adf1234!@#$asd',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 600000 },
}));
app.use(createSession());

// ------- Set Routers -------
var mainRouter = require('./routes2/index.js')(app);
var itemsRouter = require('./routes2/items.js')(app);
var userRouter = require('./routes2/user.js')(app);
var productRouter = require('./routes2/product.js')(app);
var requestRouter = require('./routes2/request.js')(app);


app.use('/', mainRouter);
app.use('/items', itemsRouter);
app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/request', requestRouter);


///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(3001, function() {});

logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************',host,3001);
server.timeout = 240000;

