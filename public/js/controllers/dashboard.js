angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$location', '$sce', '$route', '$routeParams', 'redmineService', 'redmineAPI', 'gridsterOptions', 'cardsHelpers', function($scope, $timeout, $location, $sce, $route, $routeParams, redmineService, redmineAPI, gridsterOptions, cardsHelpers) {

        $scope.current_user = redmineAPI.current_user;
        $scope.user_projects = redmineAPI.user_projects;
        $scope.selected_project = redmineAPI.selected_project;
        $scope.priorities = redmineAPI.priorities;
        $scope.widgets = redmineAPI.widgets;
        $scope.activities = redmineAPI.activities;
        $scope.allowed_statuses = redmineAPI.allowed_statuses;
        $scope.allowed_statuses_object = redmineAPI.allowed_statuses_object;
        $scope.config = redmineAPI.config;

        // $scope.card = {};
        // $scope.card.attachments = [];
        // $scope.projectMembers = [];
        // $scope.subject = "";

        $scope.project_id = $routeParams.project_id;
        $scope.gridsterOptions = gridsterOptions;

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.goToProject = function (project) {
            $location.path('/trello/' + project.id);
        };

        $scope.sortableTemplates = {
            connectWith: '.connectedSortable',
            dropOnEmpty: true,
            'ui-floating': true,
            update: function(event, ui) {
                cardsHelpers.update_status(ui.item);
            }
        };

        $scope.parseTrustSnippt = function(html) {
            return $sce.trustAsHtml(html) || 'no description provided';
        };

        $scope.refresh = function(){
            $route.reload();
        }

        $scope.loadMore = function(widget){
            widget.loader = true;

            redmineService.getProjectUserStories($scope.project_id, widget.status_id, widget.cards.length)
            .then(function (result) {
                if(result.data[widget.status_id]) {
                    widget.cards = widget.cards.concat(result.data[widget.status_id]);
                }
                widget.loader = false;
            });

        }
    }
]);