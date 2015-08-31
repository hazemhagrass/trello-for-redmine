angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', '$localStorage', '$location', '$sce', '$route', '$routeParams', 'toaster', 'redmineService', 'redmineAPI', 'gridsterOptions', 'cardsHelpers', function($scope, $timeout, $modal, $http, $localStorage, $location, $sce, $route, $routeParams, toaster, redmineService, redmineAPI, gridsterOptions, cardsHelpers) {

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

        $scope.styleUrl = 'assets/stylesheets/cards_style.css';
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
            stop: function(event, ui) {

                var has_moved = ui.item.sortable.received;
                var card_id = ui.item.attr('id');
                if(has_moved) {
                    var target_status = ui.item.sortable.droptarget.attr('widget-status');
                    var card_target_index = ui.item.sortable.dropindex;
                    var target_widget = $scope.widgets[target_status-1];
                    var moved_card = target_widget.cards[card_target_index];
                    moved_card.card_loading = true;
                    redmineService.updateIssue(card_id, {
                        status_id: target_status
                    }).then(function(result){
                        // moved_card.card_loading = false;
                        delete moved_card.card_loading;
                        moved_card.status.id = Number(target_status);
                        moved_card.status.name = redmineAPI.allowed_statuses_names[target_status-8];
                        cardsHelpers.reorderWidgetElement(target_widget.cards, card_id);
                    }, function(error){
                        console.log(error);
                    });
                } else {
                    cardsHelpers.reorderWidgetElement(ui.item.sortable.sourceModel, card_id);
                }
            }
        };

        $scope.updateIssue = function(issue_id, updated_data, parent_card) {
            redmineService.updateIssue(issue_id, updated_data)
            .then(function (result) {
                // Check the updated data is a task inside a card
                if(parent_card) {
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
                            cardsHelpers.insertInOrder(target_widget.cards, old_card);
                        }
                    }, function (error) {
                        console.log(error);
                    });
                }

            }, function (error) {
                console.log(error);
            });
        };

        function getUserInfo(index, assign_to_id) {
            redmineService.getUserInfo(assign_to_id)
            .then(function (result) {
                $scope.subTasks[index].assigned_to = result.data;
            });
        };

        $scope.parseTrustSnippt = function(html) {
            return $sce.trustAsHtml(html) || 'no description provided';
        };

        $scope.refresh = function(){
            $route.reload();
        }
    }
]);