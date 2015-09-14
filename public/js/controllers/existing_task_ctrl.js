angular.module('trelloRedmine')
.controller('ExistingTaskCtrl', ['$scope', '$modal', '$modalStack', 'redmineService', 'tasksHelpers', 'cardsHelpers', 'issuesHelpers', 'sortingUtility', 'toaster', 'activitiesHelpers',
  function($scope, $modal, $modalStack, redmineService, tasksHelpers, cardsHelpers, issuesHelpers, sortingUtility, toaster, activitiesHelpers) {
      
    $scope.tasksHelpers = tasksHelpers;

    $scope.editTask = function(card, task) { 
      $modalInstance = $modal.open({
        scope: $scope,
        templateUrl: 'views/templates/edit_task.html',
        backdropClass: "backdrop-fix"
      });
      $modalInstance.result.finally( function() {
        synchronizeParentCard(card);
      })
    }

    $scope.deleteTask = function(card, task) {
      // TODO: find way to handle success and error
      // var task_index = card.subTasks.indexOf(task);
      // card.subTasks.splice(task_index, 1);
      // redmineService.deleteTask(task.id);
      // cardsHelpers.calculateProgress(card);
    };

    $scope.updateTask = function(task, parent_card) {
      parent_card.card_loading = true;

      redmineService.updateIssue(task.id, task)
      .then(function (result) {

        if( !$modalStack.getTop() ){
          synchronizeParentCard(parent_card);
        }

        if(task.status_id) {
          task.status.name = issuesHelpers.getStatusName(task.status_id);
          activitiesHelpers.appendTask(task);
        }

        if(task.assigned_to_id){
          task.assigned_to.name = issuesHelpers.getAssigneeName(task.assigned_to_id);
          task.assigned_to.mail = task.assigned_to.name.replace(/ /g, '.').toLowerCase() + '@badrit.com';
        }

        if( task.priority_id ) {
          task.priority.name = issuesHelpers.getPriorityName(task.priority_id);
        }

      }).finally( function() {
        task.priority_id = undefined;
        task.assigned_to_id = undefined;
        delete parent_card.card_loading;
      });
    };

    function synchronizeParentCard(parent_card){
      redmineService.getIssue(parent_card.id)
      .then(function (result) {
        var old_card = parent_card;
        var new_card = result.data.issue;
        var old_card_status_id = old_card.status.id;
        var new_card_status_id = new_card.status.id;
        if(old_card_status_id !== new_card_status_id){
          var source_widget = $scope.widgets[old_card_status_id - 1];
          var target_widget = $scope.widgets[new_card_status_id - 1];
          var card_index = source_widget.cards.indexOf(old_card);
          source_widget.cards.splice( card_index, 1 );
          toaster.pop({ type: 'info',
            title: 'Moved card ' + new_card.id + ' from ' +  old_card.status.name + ' to ' +  new_card.status.name + '.',
            showCloseButton: true
          });
          old_card.status = new_card.status;
          sortingUtility.insertInOrder(target_widget.cards, old_card);
        }
      });
    }
    // function getUserInfo(index, assign_to_id) {
    //   redmineService.getUserInfo(assign_to_id)
    //   .then(function (result) {
    //     $scope.subTasks[index].assigned_to = result.data;
    //   });
    // };

    $scope.updateTaskPriority = function(task, card){
      task.priority_id = task.priority.id;
      task.priority.name = 'Updating ...';
      $scope.updateTask(task, card);
    }

    $scope.updateTaskAssignee = function(task, card){
      task.assigned_to_id = task.assigned_to.id;
      task.assigned_to.name = 'Updating ...';
      $scope.updateTask(task, card);
    }

    $scope.updateTaskStatusFromCheckbox = function(is_finished, task, card) {
      if(is_finished) {
        card.finishedTasks++;
        task.status_id = 14;
        task.status.id = 14;
      } else {
        card.finishedTasks--;
        task.status_id = 9;
        task.status.id = 9;
      }
      task.status.name = 'Updating ...';
      $scope.updateTask(task, card);
    }

    $scope.updateTaskStatusFromList = function(task, card) {
      task.status_id = task.status.id;
      task.status.name = 'Updating ...';
      $scope.updateTask(task, card);
    }
  }
]);