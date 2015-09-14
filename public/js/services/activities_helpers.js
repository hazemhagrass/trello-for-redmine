angular.module('trelloRedmine')
.factory('activitiesHelpers', ['redmineAPI', 'redmineService', function (redmineAPI, redmineService) {

  return {
    synchronize: synchronize
  }

  function synchronize(){
    redmineService.getActivities(redmineAPI.selected_project.id)
    .then(function (result) {
      var data = JSON.parse(result.data);
      // NOTE writing activities = [] would make a new reference and hence the scope won't have the same reference as this one
      redmineAPI.activities.length = 0;
      angular.forEach(data.activities, function(activity){
        redmineAPI.activities.push(activity);
      })
    });
  }

}]);