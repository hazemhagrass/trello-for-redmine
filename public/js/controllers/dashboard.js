angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', '$localStorage', '$location', '$sce', '$route', '$routeParams', 'redmineService', 'redmineAPI', 'cardsOrder', 'gridsterOptions', function($scope, $timeout, $modal, $http, $localStorage, $location, $sce, $route, $routeParams, redmineService, redmineAPI, cardsOrder, gridsterOptions) {

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
        $scope.subject = "";

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
                var index = ui.item.sortable.index;
                var targetIndex = ui.item.sortable.dropindex;
                var moved = ui.item.sortable.received;
                if(moved || targetIndex !== undefined && (targetIndex !== index)) {
                    $scope.updateIssue(ui.item.attr('id'), {
                        status_id: ui.item.sortable.droptarget.attr('widget-status')
                    });
                    cardsOrder.reorderWidgetElement(ui.item.sortable.droptargetModel, ui.item.attr('id'));
                }
                $(ui.item).find("#overlay").show();
                setTimeout(function() {
                    $(ui.item).find("#overlay").hide();
                }, 1000);
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
                            $scope.alert = 'Moved card from ' +  old_card.status.name + ' to ' +  new_card.status.name + '.';
                            $timeout(function() {
                                $scope.alert = '';
                            }, 10000);
                            old_card.status = new_card.status;
                            cardsOrder.insertInOrder(target_widget.cards, old_card);
                        }
                    }, function (error) {
                        console.log(error);
                    });
                }               

            }, function (error) {
                console.log(error);
            });
        };

        $scope.parseTrustSnippt = function(html) {
            return $sce.trustAsHtml(html) || 'no description provided';
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
            $scope.calculateProgress(card);
        };

        $scope.calculateProgress = function (task) {
            task.progress = ( task.subTasks.length == 0) ? 0 : parseInt(( task.finishedTasks / task.subTasks.length ) * 100);
        };

        $scope.refresh = function(){
            $route.reload();
        }
    }
]);