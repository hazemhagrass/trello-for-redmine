angular.module('trelloRedmine')
.controller('NewTaskCtrl', ['$scope', '$modal', '$localStorage', 'redmineService', 'cardsHelpers',
    function($scope, $modal, $localStorage, redmineService, cardsHelpers) {

        $scope.newTask = {
            subject: "",
            description: "",
            priority_id: 0,
            project_id: $scope.project_id,
            parent_issue_id: 0,
            tracker_id: 4,
            assigned_to_id: 0
        };

        $scope.addNewSubTask = function(card) {
            $modalInstance = $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/new_task.html',
                backdropClass: "backdrop-fix"
            });
        }

        $scope.createTask = function(card, newTask) {
        
            var assigned_to_id = (card.assigned_to) ? card.assigned_to.id : '';
            var priority_to_id = (card.priority) ? card.priority.id : '';
            
            newTask.priority_id = priority_to_id;
            newTask.assigned_to_id = assigned_to_id;
            newTask.parent_issue_id = card.id;

            $scope.dismiss();
            
            redmineService.createTask(newTask)
            .then(function (result) {
                var issue = result.data.issue;
                issue.assigned_to.mail = $localStorage.user_mail;
                card.subTasks.unshift(issue);
                cardsHelpers.calculateProgress(card);
            });
        };
    }
]);