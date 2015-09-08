angular.module('trelloRedmine')
.service('tasksHelpers', function (){

  return {
    taskClass: taskClass
  }

  function taskClass(task_status_id, in_modal){
    if( in_modal ){
      return task_status_id === 10  || task_status_id === 14 ? 'finished-task-modal' : '';
    } else {
      return task_status_id === 10  || task_status_id === 14 ? 'finished-task' : '';
    }
  };

});