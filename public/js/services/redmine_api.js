angular.module('trelloRedmine')
.service('redmineAPI', ['$localStorage', 'redmineService', function ($localStorage, redmineService) {

  this.data = {};

  this.populateData = function() {
    var _this = this;

    redmineService.getUserProjects('current')
    .then(function (result) {

      _this.data.current_user = result.data.user;
      $localStorage.user_mail = _this.data.current_user.mail;

      _this.data.user_projects = result.data.user.memberships.map(function(project){
        return project.project;
      });

      _this.data.user_projects.some(function(project) {
        if(project.id == _this.data.project_id) {
          _this.data.selected_project = project;
          return true;
        }
      });

    });
  };

  this.setProjectId = function(project_id){
    this.data.project_id = project_id;
  }

}]);