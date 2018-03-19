var mongoose = require('mongoose');

var libs = process.cwd() + '/libs/';

var log = require(libs + 'controllers/log')(module);
var config = require(libs + 'controllers/config');

mongoose.connect(config.get('mongoose:uri'));

var db = mongoose.connection;

db.on('error', function (err) {
	log.error('Connection error:', err.message);
});

db.once('open', function callback () {
	log.info("Connected to DB!");
});

module.exports = mongoose;