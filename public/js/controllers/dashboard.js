angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', '$localStorage', '$location', '$sce', '$route', '$routeParams', 'toaster', 'redmineService', 'redmineAPI', 'gridsterOptions', 'cardsHelpers', 'sortingUtility', function($scope, $timeout, $modal, $http, $localStorage, $location, $sce, $route, $routeParams, toaster, redmineService, redmineAPI, gridsterOptions, cardsHelpers, sortingUtility) {

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
            $location.path('/trello/' + project.id + '/' + $localStorage.current_api_key);
        };

        $scope.sortableTemplates = {
            connectWith: '.connectedSortable',
            dropOnEmpty: true,
            'ui-floating': true,
            stop: function(event, ui) {
                cardsHelpers.update_status(ui.item);
            }
        };

        $scope.parseTrustSnippt = function(html) {
            return $sce.trustAsHtml(html) || 'no description provided';
        };

        $scope.refresh = function(){
            $route.reload();
        }
    }
]);