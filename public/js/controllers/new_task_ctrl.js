angular.module('trelloRedmine')
.controller('NewTaskCtrl', ['$scope', '$modal', '$localStorage', 'redmineService', 'cardsHelpers', 'toaster',
    function($scope, $modal, $localStorage, redmineService, cardsHelpers, toaster) {

        $scope.newTask = initiateTask();

        $scope.addNewSubTask = function(card) {
            $modalInstance = $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/new_task.html',
                backdropClass: "backdrop-fix"
            });
        }

        $scope.createTask = function(card, newTask) {
            toaster.pop({ type: 'info',
              title: 'A new task is being added to card ' + card.id + '.',
              showCloseButton: true
            });
            var assigned_to_id = newTask.assigned_to_id ? newTask.assigned_to_id : $localStorage.user_id;
            var priority_to_id = (card.priority) ? card.priority.id : '';
            
            newTask.priority_id = priority_to_id;
            newTask.assigned_to_id = assigned_to_id;
            newTask.parent_issue_id = card.id;

            $scope.dismiss();
            
            redmineService.createTask(newTask)
            .then(function (result) {
                var issue = result.data.issue;
                issue.assigned_to.mail = issue.assigned_to.name.replace(/ /g, '.').toLowerCase() + '@badrit.com';
                card.subTasks.unshift(issue);
                cardsHelpers.calculateProgress(card);
                toaster.pop({ type: 'info',
                  title: 'A new task has been added successfully.',
                  showCloseButton: true
                });
            }).finally( function() {
                $scope.newTask = initiateTask();
            });
        };

        function initiateTask(){
            return {
                subject: "",
                description: "",
                priority_id: 0,
                project_id: $scope.project_id,
                parent_issue_id: 0,
                tracker_id: 4,
                assigned_to_id: $localStorage.user_id
            };
        }
    }
]);