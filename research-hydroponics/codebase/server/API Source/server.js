#!/usr/bin/node
// server.js
// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express({name:'IoT Server'});
var port     = process.env.PORT || 80;
var vhost= require('vhost');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');


// configuration ===============================================================


// set up our express application
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var session      = require('express-session');
var mongoManager= require("./app/mongooseManager.js");
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://local.humandroid.us');
	res.header('Access-Control-Allow-Methods', req.headers['access-control-request-headers']||'GET, POST');
	res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']|| '*');
	res.header('X-Powered-By','IoT Hydrophonics');
	next();
});
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', __dirname + '/views');
//app.set('static', __dirname + '/static');
app.use('/static',express.static(__dirname + '/static'));
app.use(session({ secret: 'iloveprogramminginiot',cookie: { domain: '.humandroid.us', maxAge: 1000*60*24*300 } })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
// routes ======================================================================
require('./app/apiroutes.js')(app,mongoManager,mongoose, passport); // load our routes and pass in our app and fully configured
//---------------------------------------------------------


if (!module.parent) {
	app.listen(port);
	console.log('The magic happens on port ' + port);
}

