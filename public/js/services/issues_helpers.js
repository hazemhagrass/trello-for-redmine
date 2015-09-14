angular.module('trelloRedmine')
.service('issuesHelpers', ['redmineAPI', function (redmineAPI){

  return {
    getPriorityName: getPriorityName,
    getAssigneeName: getAssigneeName,
    getStatusName: getStatusName
  }

  function getPriorityName(priority_id) {
    var priority_name;
    redmineAPI.priorities.some( function(priority) {
      if( priority.id == priority_id ){
        priority_name = priority.name;
        return true;
      }
    });
    return priority_name;
  }

  function getAssigneeName(assignee_id) {
    var assignee_name;
    redmineAPI.selected_project.members.some( function(assignee) {
      if( assignee.id == assignee_id ){
        assignee_name = assignee.name;
        return true;
      }
    });
    return assignee_name;
  }

  function getStatusName(status_id) {
    var status_name;
    redmineAPI.allowed_statuses_object.some( function(status) {
      if( status.id == status_id ){
        status_name = status.name;
        return true;
      }
    });
    return status_name;
  }

}]);