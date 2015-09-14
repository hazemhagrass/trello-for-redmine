angular.module('trelloRedmine')
.factory('activitiesHelpers', ['redmineAPI', function (redmineAPI) {

  return {
    appendCard: appendCard,
    appendTask: appendTask
  }

  function appendCard(card) {
    appendIssue(card, 'UserStory');
  };

  function appendTask(task) {
    appendIssue(task, 'Task');
  };

  function appendIssue(issue, issue_type) {
    var author = {
      name: issue.author.name.replace(/ /g, '.').toLowerCase(),
      email: issue.author.name.replace(/ /g, '.').toLowerCase() + '@badrit.com'
    }
    var new_activity = {
      author: author,
      description: '<p>' + issue.description + '</p>',
      time: getTimeNow(),
      title: issue_type + ' #' + issue.id + ' (' + issue.status.name + '): ' + issue.subject 
    };
    redmineAPI.activities.unshift(new_activity);
  };

  function getTimeNow(){
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }
    return $.datepicker.formatDate('dd/mm/yy', date) + ' ' + hours + ':' + minutes;
  }

}]);