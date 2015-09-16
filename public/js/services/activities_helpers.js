angular.module('trelloRedmine')
.factory('activitiesHelpers', ['$interval', 'redmineAPI', 'redmineService', function ($interval, redmineAPI, redmineService) {

  var POLL_DURATION = 10000;
  $interval(synchronize, POLL_DURATION, 0, false, false);

  return {
    synchronize: synchronize
  }

  function synchronize(show_loader){

    redmineAPI.activities.loader = show_loader;
    redmineService.getActivities(redmineAPI.selected_project.id)
    .then(function (result) {
      var data = result.data;
      if( redmineAPI.activities.length ) {
        var first_activity_time = redmineAPI.activities[0].time;
        var first_activity_title = redmineAPI.activities[0].title;
      }
      var matched_flag = false;
      // NOTE writing activities = [] would make a new reference and hence the scope won't have the same reference as this one
      redmineAPI.activities.length = 0;
      data.activities.forEach( function(activity) {

        if( activity.time == first_activity_time && activity.title == first_activity_title) {
          matched_flag = true;
        }
        if( !matched_flag ) {
          activity.animate = true;
        }

        redmineAPI.activities.push(activity);

      });

      redmineAPI.activities.loader = false;
    });
  };

}]);