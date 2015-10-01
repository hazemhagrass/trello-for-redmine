
var Redmine = require('promised-redmine');

exports.init = function () {
	console.log('Connecting to Redmine');
	redmine = new Redmine({
		host: 'redmine.badrit.com',
		apiKey: 'dummy'
	});
}