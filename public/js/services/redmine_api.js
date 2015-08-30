angular.module('trelloRedmine')
.factory('redmineAPI', ['$localStorage', '$q', 'redmineService', function ($localStorage, $q, redmineService) {

  var project_id = null;
  var current_user = {};
  var user_projects = [];
  var selected_project = {};
  var priorities = [];
  var widgets = [];
  var activities = [];
  var config = {};
  // TODO: make it dynamic
  var allowed_statuses = [8, 9, 10];
  var allowed_statuses_names = ['Defined', 'In progress', 'Completed'];
  var allowed_statuses_object = [
    { id: 8, name: 'Defined' },
    { id: 9, name: 'In progress' },
    { id: 10, name: 'Completed' },
    { id: 14, name: 'Finished' }
  ];

  return {
    current_user: current_user,
    user_projects: user_projects,
    selected_project: selected_project,
    priorities: priorities,
    widgets: widgets,
    allowed_statuses: allowed_statuses,
    allowed_statuses_object: allowed_statuses_object,
    activities: activities,
    config: config,
    populateData: populateData
  };
  
  function populateData(controller_project_id) {
    var deferred = $q.defer();

    project_id = controller_project_id;

    redmineService.getUserProjects('current')
    .then(function (result) {

      angular.extend(current_user, result.data.user);
      $localStorage.user_mail = current_user.mail;

      angular.extend(user_projects, result.data.user.memberships.map(function(project){
        return project.project;
      }));

      user_projects.some(function(project) {
        if(project.id == project_id) {
          angular.extend(selected_project, project);
          return true;
        }
      });

    });

    redmineService.getIssuePriorities()
    .then(function (result) {
      angular.extend(priorities, result.data.issue_priorities);
    }, function (error) {
      console.log(error);
    });

    function getLastImage(card) {
      angular.forEach(card.attachments, function(attach) {
        if(attach.content_type.search("image/") >= 0) {
          card.last_image = attach;
        }
      }, card.last_image);
    };

    function getAttachments(card) {
      redmineService.getIssueAttachments(card.id)
      .then(function (result) {
        card.attachments = result.data.issue.attachments;
        if(card.attachments.length > 0) {
          card.hasAttachments = true;
        } else {
          card.hasAttachments = false;
        }
        getLastImage(card);
      }, function (error) {
        console.log(error);
      });
    }

    function getSubTasks(card) {
      var storyId = card.id;
      var projectId = card.project.id;
      var issues = [];                        
      var subTasks = [];

      card.finishedTasks = 0;
      card.subTasks = [];

      redmineService.getStoryTasks(projectId, storyId)
      .then(function (result) {
        issues = result.data.issues;
        angular.forEach(issues, function(issue) {    
          if (issue.parent && issue.parent.id == storyId) {
            if (issue.status.id == 14) card.finishedTasks++;
            this.push(issue);
          }
        }, subTasks);

        card.subTasks = subTasks;
      }, function (error) {
        console.log(error);
      });
    }

    redmineService.getIssuesStatuses()
    .then(function (result) {
        angular.extend(widgets, result.data);
        // TODO: do it in better way
        for(var i = 0; i < allowed_statuses.length; i++) {
          widgets[allowed_statuses[i] - 1].allowed = true;
        }

        redmineService.getProjectUserStories(project_id)
        .then(function (result) {
            
          // RESOLVE PROMISE FOR ROUTE TO DISPLAY CONTROLLER AFTER FETCHING THE PROJECT USERSTORIES
          deferred.resolve(result);

          for(var i = 0; i < widgets.length; i++) {
            widgets[i].cards = [];
          }

          for(var key in result.data) {
            if(result.data.hasOwnProperty(key)) {
              widgets[key - 1].cards = result.data[key];
                
              //get user data
              for(var card_key in widgets[key - 1].cards) {
                var card = widgets[key - 1].cards[card_key];
                card.showDetails = false;
                getSubTasks(card);
                getAttachments(card);
              }
            }
          }
        });
    });

    redmineService.getActivities(project_id)
    .then(function (result) {
      var data = JSON.parse(result.data);
      angular.forEach(data.activities, function(activity){
        activities.push(activity);
      })
    });

    redmineService.getConfig()
    .then(function (result) {
      angular.extend(config, result.data);
    }, function (error) {
      console.log(error);
    });

    return deferred.promise;

    // redmineService.getProjectMembers($scope.project_id)
    // .then(function(result) {
    //     // console.log(JSON.stringify(result));
    // }, function(error) {
    //     console.log(error);
    // });

    /*$scope.allowed_statuses = [8, 9, 10];
    $scope.getUserLists = function() {
        $http.get('/settings/config/lists/' + $localStorage.current_api_key)
        .success(function(data, status){
            console.log(data)
            if(data) {
                $scope.allowed_statuses = data.split(",");
            } else {
                $scope.allowed_statuses = [8,9,10,11];
            }
        }).error(function(err, status){
            $scope.allowed_statuses = [8,9,10];
            console.log(err);
        });
    };

    $scope.getUserLists();*/

    /*redmineService.getProjectMembers($scope.project_id)
    .then(function (result) {
        angular.forEach(result.data.memberships, function(membership) {  
            var member = {
                "id": membership.user.id,
                "name": membership.user.name
            };
            this.push(member);
        }, $scope.projectMembers);
    }, function (error) {
        console.log(error);
    });*/

  };

}]);