angular.module('trelloRedmine')
.controller('ExistingTaskCtrl', ['$scope', '$modal', 'redmineService', 'tasksHelpers', 'cardsHelpers', 'sortingUtility', 'toaster',
  function($scope, $modal, redmineService, tasksHelpers, cardsHelpers, sortingUtility, toaster) {
      
    $scope.tasksHelpers = tasksHelpers;

    $scope.editTask = function(card, task) { 
      $modalInstance = $modal.open({
        scope: $scope,
        templateUrl: 'views/templates/edit_task.html',
        backdropClass: "backdrop-fix"
      });
    }

    $scope.deleteTask = function(card, task) {
      // TODO: find way to handle success and error
      var task_index = card.subTasks.indexOf(task);
      card.subTasks.splice(task_index, 1);
      redmineService.deleteTask(task.id);
      cardsHelpers.calculateProgress(card);
    };

    $scope.changeTaskStatus = function(card, task, state_val) {
      if(!angular.isNumber(state_val)){
        if(state_val) {
          card.finishedTasks++;
          task.status_id = 14;
          task.status.name = 'Finished';
        } else {
          card.finishedTasks--;
          task.status_id = 9;
          task.status.name = 'In progress';
        }
      } else {
        task.status_id = state_val;
        $scope.allowed_statuses_object.some(function(status){
          if(status.id === state_val){
            task.status.name = status.name;
            return true;
          }
        })
      }
      $scope.updateTask(task.id, task, card);
      cardsHelpers.calculateProgress(card);
    };

    $scope.updateTask = function(issue_id, updated_data, parent_card) {
        parent_card.card_loading = true;
        redmineService.updateIssue(issue_id, updated_data)
        .then(function (result) {
          var task_index = parent_card.subTasks.indexOf(updated_data);
          if(updated_data.assigned_to_id) { getUserInfo(task_index, updated_data.assigned_to_id); }
          if(updated_data.status_id) { parent_card.subTasks[task_index].status.id = updated_data.status_id; }

          redmineService.getIssue(updated_data.parent.id)
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

        }).finally( function() {
          delete parent_card.card_loading;
        });
    };

    function getUserInfo(index, assign_to_id) {
      redmineService.getUserInfo(assign_to_id)
      .then(function (result) {
        $scope.subTasks[index].assigned_to = result.data;
      });
    };
  }
]);