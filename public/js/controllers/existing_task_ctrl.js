angular.module('trelloRedmine')
.controller('ExistingTaskCtrl', ['$scope', '$modal', 'redmineService', 'tasksHelpers', 'cardsHelpers',
    function($scope, $modal, redmineService, tasksHelpers, cardsHelpers) {
        
        $scope.tasksHelpers = tasksHelpers;

        $scope.editTask = function(card, task) { 
            // $scope.modalTask = task;
            // $scope.modalCard = card;
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
            $scope.updateIssue(task.id, task, card);
            cardsHelpers.calculateProgress(card);
        };
    }
]);