angular.module('trelloRedmine')
.controller('CrudCardCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'card', 'redmineService', 'filterFilter', '$sce',

    function($scope, $timeout, $rootScope, $modalInstance, widget, card, redmineService, filterFilter, $sce) {
        $scope.widget = widget;
        $scope.status_val = false;
        var assigned_to_id = (card.assigned_to) ? card.assigned_to.id : '';


        if (card) {
            $scope.card = card;
            $scope.newTask = {
                subject: "",
                project_id: card.project.id,
                parent_issue_id: card.id,
                tracker_id: 4,
                assigned_to_id: assigned_to_id
            };
        } else {
            $scope.card = {
                title: 'New Userstory',
                thumb: '',
                desc: ''
            };
        }

        $scope.calculateProgress = function () {
            $scope.progress = ( $scope.subTasks.length == 0) ? 0 : parseInt(( $scope.finishedTasks / $scope.subTasks.length ) * 100);
        };

        $scope.calculateProgress();

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.submit = function() {
            widget.cards.push($scope.card);
            $modalInstance.close(widget);
            $scope.updateBackend();
        };

        $scope.changeTaskStatus = function(id, state_val) {
            if(state_val) {
                $scope.finishedTasks++;
                $scope.updateIssue(id, {status_id: 14});
            } else {
                $scope.finishedTasks--;
                $scope.updateIssue(id, {status_id: 9});
            }
            $scope.calculateProgress();
        };

        $scope.createNewTask = function() {
            redmineService.createTask($scope.newTask)
            .then(function (result) {
                var issue = result.data.issue;
                $scope.subTasks.push(issue);
                $scope.calculateProgress();
            }, function (error) {
                console.log(error);
            });
        };

        $scope.updateTask = function(task) {
            $scope.updateIssue(task.id, task)
        };

        $scope.deleteTask = function(task) {
            // TODO: find way to handle success and error
            var task_index = $scope.subTasks.indexOf(task);
            $scope.subTasks.splice(task_index, 1);
            redmineService.deleteTask(task.id);
            $scope.calculateProgress();   
        };

        $scope.showName = function(task) {
            var selected = filterFilter($scope.projectMembers, {id: task.assigned_to.id});
            return (task.assigned_to.id && selected.length) ? selected[0].name : 'Not set';
        };

        $scope.parseTrustSnippt = function(html) {
            return $sce.trustAsHtml(html) || 'no description provided';
        };
    }
]);