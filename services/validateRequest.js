var redis = require("redis"),
    redis_client = redis.createClient();

module.exports = function(req, res, next) {  
	if (req.url == "/login" || req.url == "/redmine/login/user") {
		next();
	} else {
		var api_key = req.session.current_api_key;
		redis_client.get(api_key, function (err, data) {
        	if(data || api_key) {
        		next();
        	} else {
            console.log('===================INVALID REQUEST===================');
            res.redirect(config.redmine_host);
        	}
    	});
	}
}