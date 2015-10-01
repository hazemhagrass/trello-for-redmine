angular.module('trelloRedmine')
.service('redmineService', ['$http', '$q', '$localStorage', function ($http, $q, $localStorage){
    var users_url = '/redmine/users/';
    var projects_url = '/redmine/projects/';
    var issues_url = '/redmine/issues/';

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

    this.getUserInfo = function (user_id) {
        var query = users_url + user_id;
        return restAPI('get', query);
    };
    
    this.getUserProjects = function (user_id) {
        var query = users_url + user_id + '/projects';
        return restAPI('get', query);
    };

    this.getProjectByID = function (project_id) {
        var query = projects_url + project_id;
        return restAPI('get', query);
    };

    this.getProjectUserStories = function (project_id, status_id, offset) {
        var offset_query = offset ? 'offset=' + offset : '';
        var status_query = status_id ? 'status_id=' + status_id : '';
        var query_string = offset_query && status_query ? '?' + offset_query + '&' + status_query : '';
        var query = projects_url + project_id + '/userstories' + query_string;
        return restAPI('get', query);
    };

    this.updateIssue = function (issue_id, updated_data) {
        var query = issues_url + issue_id;
        return restAPI('put', query, updated_data);
    };

    this.getIssuesStatuses = function () {
        var query = '/redmine/issue_statuses';
        return restAPI('get', query);
    };

    this.getStoryTasks = function(project_id, issue_id) {
        var query = projects_url + project_id  + '/issues/' + issue_id;
        return restAPI('get', query);
    };

    this.createTask = function (data) {
        var query = '/redmine/create/issue/';
        return restAPI('post', query, data);
    };

    this.deleteTask = function (issue_id) {
        var query = issues_url + issue_id;
        return restAPI('delete', query);
    };

    this.getProjectMembers = function (project_id) {
        var query = projects_url + project_id + "/memberships";
        return restAPI('get', query);
    };

    this.authUser = function (data) {
        var query = '/redmine/login/user';
        return restAPI('post', query, data);
    };

    this.logout = function (data) {
        var query = '/redmine/logout/user';
        return restAPI('post', query, data);
    };

    this.getIssueAttachments = function(issue_id) {
        var query = '/redmine/issue/' +  issue_id +'/attachments';
        return restAPI('get', query);
    };

    this.deleteAttachment = function(attachment_id) {
        var query = '/redmine/attachments/' + attachment_id;
        return restAPI('delete', query);
    };

    this.getActivities = function(project_id) {
        var query = '/redmine/activities/' + project_id;
        return restAPI('get', query);
    };

    this.getIssuePriorities = function () {
        var query = '/redmine/enumerations/issue_priorities';
        return restAPI('get', query);
    };

    this.getIssue = function (issue_id) {
        var query = '/redmine/issue/'+ issue_id;
        return restAPI('get', query);
    };

    this.getConfig = function () {
        var query = '/settings/config';
        return restAPI('get', query);
    };

}]);