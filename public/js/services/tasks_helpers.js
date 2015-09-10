angular.module('trelloRedmine')
.service('tasksHelpers', ['redmineAPI', function (redmineAPI){

  return {
    taskClass: taskClass,
    getPriorityName: getPriorityName,
    getAssigneeName: getAssigneeName
  }

  function taskClass(task_status_id, in_modal){
    if( in_modal ){
      return task_status_id === 10  || task_status_id === 14 ? 'finished-task-modal' : '';
    } else {
      return task_status_id === 10  || task_status_id === 14 ? 'finished-task' : '';
    }
  };

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

}]);