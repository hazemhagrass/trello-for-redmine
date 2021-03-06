angular.module('trelloRedmine')
.controller('CustomWidgetCtrl', ['$scope', '$modal', 'redmineService', '$localStorage',
    function($scope, $modal, redmineService, $localStorage) {

        $scope.newCard = {
            subject: "",
            description: "",
            project_id: $scope.project_id,
            tracker_id: 5,
            status_id: '',
            priority_id : '',
            parent_issue_id : '',
            is_private: 0,
            assigned_to_id: $localStorage.user_id
        };

        $scope.isNewCard = false;
        
        $scope.statuses = [];


        redmineService.getIssuesStatuses()
        .then(function (result) {
            $scope.statuses = result.data;
        }, function (error) {
            console.log(error);
        });

        $scope.remove = function(widget) {
            $scope.widgets.splice($scope.widgets.indexOf(widget), 1);
        };

        $scope.openSettings = function(widget) {
            $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/widget_settings.html',
                controller: 'WidgetSettingsCtrl',
                backdropClass: "backdrop-fix",
                resolve: {
                    widget: function() {
                        return widget;
                    }
                }
            });
        };

        $scope.addNewCard = function(widget) { 
            $scope.newCard.status_id = widget.status_id;
            redmineService.createTask($scope.newCard)
            .then(function (result) {
                var issue = result.data.issue;
                var widget_index = $scope.widgets.indexOf(widget);
                $scope.widgets[widget_index].cards.push(issue);
                $scope.widgets[widget_index].cards[$scope.widgets[widget_index].cards.length - 1 ].subTasks = []; 
                $scope.widgets[widget_index].cards[$scope.widgets[widget_index].cards.length - 1 ].attachments = [];
            }, function (error) {
                console.log(error);
            });
        };
    }
]);
