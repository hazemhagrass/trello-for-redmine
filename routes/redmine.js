var express = require('express'),
	_ = require('underscore-node'),
	request = require('request'),
	router = express.Router(),
	redis = require("redis"),
    redis_client = redis.createClient(),
    http = require('http'),
    fs = require('fs'),
    querystring = require('querystring'),
    async = require('async');

var redmine_host = config.redmine_host + '/';
var trello_host = config.trello_host + '/';
// list all trackers in redmine
router.get('/trackers', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('trackers', 'json').success(function (data) {
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

router.get('/issue_statuses', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('/issue_statuses', 'json').success(function (data) {
		var result = _.map(_.sortBy(data.issue_statuses, function (object){
			return object.id;
		}), function (object){
			return {title: object.name, cards: [], sizeX: 1, sizeY: 2, status_id: object.id, allowed: false};
		});
		res.json(result);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);		
	});
});

router.get('/users/current', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('/users/current', 'json').success(function (data) {
		res.json(data.user);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get user info
router.get('/users/:user_id', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('/users/' + req.params.user_id, 'json').success(function (data) {
		res.json(data.user);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get issues of user in a specific project
router.get('/users/:user_id/projects/:project_id/issues', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('issues', {
		project_id: req.params.project_id,
		assigned_to_id: req.params.user_id
	}).success(function (data) {
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get projects of specific user + members of this project IF user is authorized
router.get('/users/:user_id/projects', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('users/' + req.params.user_id, {
		include: 'memberships'
	}).success(function (data) {

		async.each(data.user.memberships, function(membership, callback) {

			var api_key = req.session.current_api_key;
			var url = redmine_host + "projects/" + membership.project.id + "/memberships.json";

			request.get({
				headers: {'X-Redmine-API-Key': api_key},
				url:     url
			}, function(error, response, body){
				if(error) { callback(error, null); }
				membership.project.members = [];
				if(response.statusCode == 200) {
					var project_members = JSON.parse(body).memberships;
					project_members.forEach( function(member) {
						membership.project.members.push(member.user);
					});
				}
				callback(null);
			});

		}, function(error) {

			if(error) {
				res.status(404).json(error);
			} else {
				res.json(data);
			}
		});

		// res.json(data);
	}).error(function (err) {
		res.status(404).json(err);
	});
});

// get issues assigned to specific user
router.get('/users/:user_id/issues', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('issues' , {
		assigned_to_id: req.params.user_id
	}).success(function (data) {
		res.json(data.user.memberships);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get all issues in a specific project
router.get('/projects/:project_id/issues', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('issues', {
		project_id: req.params.project_id,
		status_id: '*'
	}).success(function (data) {
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get all issues in a specific project
router.get('/projects/:project_id/issues/:parent_id', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.get('issues', {
		parent_id: req.params.parent_id,
		status_id: '*'
	}).success(function (data) {
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get all issues in a specific project
router.get('/projects/:project_id/userstories', function (req, res, next) {
	var api_key = req.session.current_api_key;

	setApiKey(req.session.current_api_key);

	redmine.get('issues', {
		project_id: req.params.project_id,
		tracker_id: '5',
		status_id: req.query.status_id || '*',
		offset: req.query.offset || 0,
		limit: 40
	}).success(function (data) {

		async.map(data.issues, function(issue, callback) {

			var url = redmine_host + "trello_issues/issues.json?issue_id=" + issue.id + "&include=children";
			request.get({
				headers: {'X-Redmine-API-Key': api_key},
				url:     url
			}, function(error, response, body){
				//console.log(body);
				//console.log(issue);
				if(error) { callback(error, null); }
				var issue_with_children = JSON.parse(body).issue;
				issue_with_children.children = issue_with_children.children || [];
				callback(null, issue_with_children);
			})

		}, function(error, result_with_children) {

			if(error) {
				res.status(404).json(error);
			} else {
				var result_with_children = _.groupBy(result_with_children, function(obj) {
					return obj.status.id;
				});
				res.json(result_with_children);
			}

		});

	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// get information of specific project
router.get('/projects/:project_id', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.getProject(req.params.project_id).success(function (data) {
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// update an issue
router.put('/issues/:issue_id', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.updateIssue(req.params.issue_id, req.body)
	.success(function (data) {
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// create new issue (User Story or Task)
router.post('/create/issue', function (req, res, next) {
	setApiKey(req.session.current_api_key);
	redmine.postIssue(req.body)
	.success(function (data) {
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// delete an issue
router.delete('/issues/:issue_id', function (req, res, next) {
	setApiKey(req.session.current_api_key);

	
	/*request.del({
		headers: {'X-Redmine-API-Key':eq.params.api_key},
		url:     'http://redmine.badrit.com/issues/' + req.params.issue_id +'.json'
	}, function(error, response, body){
		console.log(JSON.stringify(error));
		res.json(body);
	});*/

	redmine.deleteIssue(req.params.issue_id)
	.success(function () {
		res.status(200);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

// GET project members | THIS ROUTE IS NOT USED IN THIS PHASE
router.get('/projects/:project_id/memberships', function (req, res, next) {
	var api_key = req.session.current_api_key;
	var url = redmine_host + "projects/" + req.params.project_id + "/memberships.json";

	request.get({
		headers: {'X-Redmine-API-Key': api_key},
		url:     url
	}, function(error, response, body){
		console.log(error);
		console.log(response);
		console.log(body);
		response.statusCode == 200 ? res.status(200).json(JSON.parse(body)) : res.status(response.statusCode).json('');
	});
});

router.post('/login/user', function (req, res, next) {
	var data = req.body;
	request("http://" + data.username + ":" + data.password + "@" + "redmine.badrit.com/users/current.json", function (error, response, body) {
  		if (!error && response.statusCode == 200) {
    		var user_data = JSON.parse(body);
    		redis_client.set(user_data.user.api_key, body);
    		req.session.current_api_key = user_data.user.api_key;
    		setApiKey(user_data.user.api_key);

				var url = redmine_host + "users/" + user_data.user.id + '.json?include=memberships';
				request.get({
					headers: {'X-Redmine-API-Key': user_data.user.api_key},
					url:     url
				}, function(error, response, body){
					data = JSON.parse(body)
					var first_project_id = data.user.memberships[0].project.id;
					user_data.first_project_id = first_project_id;
					res.json(user_data);
				});

  		} else {
  			var err = {"msg" : "unauthorized user"}
  			res.status(404).json(err);
  		}
	})
	
});


router.get('/authenticate/:project_id/:api_key', function (req, res, next) {
	var api_key = req.params.api_key;
	req.session.current_api_key = api_key;
	redis_client.set(api_key, api_key);
	setApiKey(api_key);
	res.redirect(trello_host + 'trello/' + req.params.project_id);
});

router.post('/logout/user', function (req, res, next) {
	// delete req.session.current_api_key;
	var api_key = req.session.current_api_key;
	req.session.destroy(function(err) {
		// if( err ) throw Error()
		redis_client.del(api_key);
		setApiKey(undefined);
		res.redirect(redmine_host);
	});
});

router.post('/upload/file/:issue_id', function (req, res, next) {
	var api_key = req.session.current_api_key;
	var issue_id = req.params.issue_id;
	var file = req.files.file;
  fs.readFile(file.path, function (err,file_data) {
		if (err) {
			console.log(err)
			return console.log(err);
		}
		request.post({
			headers: {'content-type' : 'application/octet-stream', 'X-Redmine-API-Key': api_key},
			url:     redmine_host + 'uploads.json',
			body:    file_data
		}, function(error, response, body){
  			var parsed_data = JSON.parse(body);
		    setApiKey(api_key);
		    redmine.updateIssue(issue_id, {"uploads":[{"token": parsed_data.upload.token, "filename": file.name, "content_type": file.type}]})
			.success(function (data) {
				fs.unlink(file.path, function (err) {
					if (err) throw err;
					console.log('successfully deleted');
				});
				res.json(data);
			}).error(function (err) {
				console.log(err);
				res.status(404).json(err);
			});
		});
	});
});

router.get('/issue/:issue_id/attachments', function (req, res, next) {
	var issue_id = req.params.issue_id;
	setApiKey(req.session.current_api_key);
	redmine.get('issues/' + issue_id, {
		include: 'attachments'
	}).success(function (data) {	
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});

router.get('/issue/:issue_id', function (req, res, next) {
	var issue_id = req.params.issue_id;
	setApiKey(req.session.current_api_key);
	redmine.get('issues/' + issue_id, {}).success(function (data) {	
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
});


router.delete('/attachments/:attachment_id', function (req, res, next) {
	var api_key = req.session.current_api_key;
	var attachment_id = req.params.attachment_id;
	request.del({
		headers: {'X-Redmine-API-Key': api_key},
		url:     redmine_host + 'attachments/' + attachment_id +'.json'
	}, function(error, response, body){
		res.json(body);
	});
});

router.get('/activities/:project_id', function (req, res, next) {
	var api_key = req.session.current_api_key;
	var project_id = req.params.project_id;
	var url = redmine_host + "projects/" + project_id + "/activity.json";
	request.get({
		headers: {'X-Redmine-API-Key': api_key},
		url:     url
	}, function(error, response, body){
		var activities = JSON.parse(body);
		activities.activities.splice(30, activities.activities.length);
		res.json(activities);
	});

});

router.get('/enumerations/issue_priorities', function (req, res, next) {
	var api_key = req.session.current_api_key;
	setApiKey(api_key);
	redmine.get('/enumerations/issue_priorities', 'json')
	.success(function (data) {	
		res.json(data);
	}).error(function (err) {
		console.log(err);
		res.status(404).json(err);
	});
	
});

function setApiKey(key) {
	redmine.setApiKey(key);
};

module.exports = router;