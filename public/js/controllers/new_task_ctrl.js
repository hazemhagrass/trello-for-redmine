angular.module('trelloRedmine')
.controller('NewTaskCtrl', ['$scope', '$modal', '$localStorage', 'redmineService',
    function($scope, $modal, $localStorage, redmineService) {
        
        $scope.addNewSubTask = function(card) {
            $scope.temp_card = card;
            $modalInstance = $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/new_task.html',
                backdropClass: "backdrop-fix"
            });
        }

        $scope.newTask = {
            subject: "",
            description: "",
            priority_id: 0,
            project_id: $scope.project_id,
            parent_issue_id: 0,
            tracker_id: 4,
            assigned_to_id: 0
        };

        $scope.createNewTask = function(card) {
        
            var assigned_to_id = (card.assigned_to) ? card.assigned_to.id : '';
            var priority_to_id = (card.priority) ? card.priority.id : '';
            
            $scope.newTask.priority_id = priority_to_id;
            $scope.newTask.assigned_to_id = assigned_to_id;
            $scope.newTask.parent_issue_id = card.id;

            $scope.dismiss();
            
            redmineService.createTask($scope.newTask)
            .then(function (result) {
                var issue = result.data.issue;
                issue.assigned_to.mail = $localStorage.user_mail;
                card.subTasks.unshift(issue);
                $scope.calculateProgress(card);
            }, function (error) {
                console.log(error);
            });
        };
    }
]);