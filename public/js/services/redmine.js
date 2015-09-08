angular.module('trelloRedmine')
.service('redmineService', ['$http', '$q', '$localStorage', function ($http, $q, $localStorage){
    var users_url = '/redmine/users/';
    var projects_url = '/redmine/projects/';
    var issues_url = '/redmine/issues/';
    var current_api_key = $localStorage.current_api_key;

    function restAPI (method, query, body) {
        var deferred = $q.defer();
        var httpPromise = body ? $http[method](query, body) :  $http[method](query);
        httpPromise.then(function (result) {
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    this.setApiKey = function (key){
        current_api_key = $localStorage.current_api_key;
    }

    this.getUserInfo = function (user_id) {
        var query = users_url + user_id + "/" + current_api_key;
        return restAPI('get', query);
    };
    
    this.getUserProjects = function (user_id) {
        var query = users_url + user_id + '/projects' + "/" + current_api_key;
        return restAPI('get', query);
    };

    this.getProjectByID = function (project_id) {
        var query = projects_url + project_id + "/" + current_api_key;
        return restAPI('get', query);
    };

    this.getProjectUserStories = function (project_id) {
        var query = projects_url + project_id + '/userstories' + "/" + current_api_key;
        return restAPI('get', query);
    };

    this.updateIssue = function (issue_id, updated_data) {
        var query = issues_url + issue_id + "/" + current_api_key;
        return restAPI('put', query, updated_data);
    };

    this.getIssuesStatuses = function () {
        var query = '/redmine/issue_statuses' + "/" + current_api_key;
        return restAPI('get', query);
    };

    this.getStoryTasks = function(project_id, issue_id) {
        var query = projects_url + project_id  + '/issues/' + issue_id + "/" + current_api_key;
        return restAPI('get', query);
    };

    this.createTask = function (data) {
        var query = '/redmine/create/issue/' + current_api_key;
        return restAPI('post', query, data);
    };

    this.deleteTask = function (issue_id) {
        var query = issues_url + issue_id + "/" + current_api_key;
        return restAPI('delete', query);
    };

    this.getProjectMembers = function (project_id) {
        var query = projects_url + project_id + "/memberships/" + current_api_key;
        return restAPI('get', query);
    };

    this.authUser = function (data) {
        var query = '/redmine/login/user';
        return restAPI('post', query, data);
    };

    this.logout = function (data) {
        var query = '/redmine/logout/user/' + current_api_key;
        return restAPI('post', query, data);
    };

    this.getIssueAttachments = function(issue_id) {
        var query = '/redmine/issue/' +  issue_id +'/attachments/' + current_api_key;
        return restAPI('get', query);
    };

    this.deleteAttachment = function(attachment_id) {
        var query = '/redmine/attachments/' + attachment_id + '/' + current_api_key;
        return restAPI('delete', query);
    };

    this.getActivities = function(project_id) {
        var query = '/redmine/activities/' + project_id + "/" + current_api_key;
        return restAPI('get', query);
    };

    this.getIssuePriorities = function () {
        var query = '/redmine/enumerations/issue_priorities/' + current_api_key;
        return restAPI('get', query);
    };

    this.getIssue = function (issue_id) {
        var query = '/redmine/issue/'+ issue_id + '/' + current_api_key;
        return restAPI('get', query);
    };

    this.getConfig = function () {
        var query = '/settings/config/' + $localStorage.current_api_key;
        return restAPI('get', query);
    };

}]);