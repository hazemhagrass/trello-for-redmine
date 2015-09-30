
var Redmine = require('promised-redmine');

exports.init = function () {
	console.log('Connecting to Redmine');
	redmine = new Redmine({
		host: config.redmine_host,
		apiKey: 'dummy'
	});
}