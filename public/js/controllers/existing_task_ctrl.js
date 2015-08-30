angular.module('trelloRedmine')
.controller('ExistingTaskCtrl', ['$scope', '$modal', 'redmineService', 'tasksHelpers',
    function($scope, $modal, redmineService, tasksHelpers) {
        
        $scope.tasksHelpers = tasksHelpers;

        $scope.editTask = function(card, task) { 
            $scope.modalTask = task;
            $scope.modalCard = card;
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
            $scope.calculateProgress(card);   
        };
    }
]);