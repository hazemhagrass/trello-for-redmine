angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', '$localStorage', '$location', '$sce', '$route', '$routeParams', 'redmineService', 'redmineAPI', 'cardsOrder', 'gridsterOptions', function($scope, $timeout, $modal, $http, $localStorage, $location, $sce, $route, $routeParams, redmineService, redmineAPI, cardsOrder, gridsterOptions) {

        redmineAPI.populateData($routeParams.project_id);

        $scope.current_user = redmineAPI.current_user;
        $scope.user_projects = redmineAPI.user_projects;
        $scope.selected_project = redmineAPI.selected_project;
        $scope.priorities = redmineAPI.priorities;
        $scope.widgets = redmineAPI.widgets;
        $scope.activities = redmineAPI.activities;
        $scope.allowed_statuses = redmineAPI.allowed_statuses;
        $scope.allowed_statuses_object = redmineAPI.allowed_statuses_object;
        $scope.config = redmineAPI.config;

        $scope.card = {};
        $scope.card.attachments = [];
        $scope.projectMembers = [];
        $scope.subject = "";

        $scope.styleUrl = 'assets/stylesheets/cards_style.css';
        $scope.project_id = $routeParams.project_id;
        $scope.gridsterOptions = gridsterOptions;

        $scope.setCurrentUser = function (api_key) {
            $localStorage.current_api_key = api_key;
        };

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };


        $scope.goToProject = function (project) {
            $location.path('/trello/' + project.id);
        };

        $scope.clear = function() {
            $scope.widgets = [];
        };

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

        $scope.startIndex = -1;
        $scope.moved = false;

        $scope.addNewSubTask = function(card) {
            $scope.temp_card = card;
            $modalInstance = $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/add_subtask.html',
                backdropClass: "backdrop-fix"
            });
        }

        $scope.editCard = function(widget, card) { 
            // I think it need more restructure to improve performence 
            var storyId = card.id;
            var projectId = card.project.id;
            var subTasks = [];
            var issues = [];
            $scope.subTasks = [];
            $scope.progress = 0;
            $scope.finishedTasks = 0;
         
            $scope.attachments = [];

            $scope.calculateProgress(card);
            
            $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/edit_card.html',
                controller: 'CrudCardCtrl',
                backdropClass: "backdrop-fix",
                resolve: {
                    widget: function() {
                        return widget;
                    },
                    card: function() {
                        return card;
                    }
                }
            });
        }

        $scope.editTask = function(card, task) { 
            $scope.modalTask = task;
            $scope.modalCard = card;
            $modalInstance = $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/edit_task.html',
                backdropClass: "backdrop-fix"
            });
        }

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

        $scope.updateBackend = function() {
            var dashboard = {
                "dashboard": {
                    "widgets": $scope.widgets
                }
            };

            $http.post('/dashboard/save', dashboard)
            .success(function(data, status){
                console.log(status)
            }).error(function(err, status){
                console.log(err);
            });

            console.log(dashboard);
            delete dashboard;
        };     

        $scope.saveUserLists = function() {
            $http.post('/settings/config/lists/' + $localStorage.current_api_key, $scope.allowed_statuses)
            .success(function(data, status){
                console.log(status);
            }).error(function(err, status){
                console.log(err);
            });
        };

        function getUserInfo(index, assign_to_id) {
            redmineService.getUserInfo(assign_to_id)
            .then(function (result) {
                $scope.subTasks[index].assigned_to = result.data;
            });
        };

        function getUserInfoByIssue(issue) {
            if(issue.assigned_to){
                redmineService.getUserInfo(issue.assigned_to.id)
                .then(function (result) {
                    issue.assigned_to = result.data;
                });
            }
        }

        $scope.deleteTask = function(card, task) {
            // TODO: find way to handle success and error
            var task_index = card.subTasks.indexOf(task);
            card.subTasks.splice(task_index, 1);
            redmineService.deleteTask(task.id);
            $scope.calculateProgress(card);   
        };

        $scope.getImageLink = function(card) {
            if(card.last_image) {
                return card.last_image.content_url;
            } else {
                return "http://blog.no-panic.at/wp-content/uploads/2011/04/redmine_logo_v1.png";
            }
        };

        $scope.getLastImage = function(card) {
            angular.forEach(card.attachments, function(attach) {
                if(attach.content_type.search("image/") >= 0) {
                    card.last_image = attach;
                }
            }, card.last_image);
        };

        // $scope.addNewAllowedStatus = function(id, state) {
        //     if(state) {
        //         $scope.allowed_statuses.push(id+1);
        //     } else {
        //         for (var i = 0; i <  $scope.allowed_statuses.length; i++) {
        //             if($scope.allowed_statuses[i]-1 == id){
        //                 $scope.allowed_statuses.splice(i, 1);
        //                 break;
        //             }
        //         };
        //     }
        //     $scope.saveUserLists();
        // }

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

        $scope.taskClass = function(task_status_id, in_modal){
            if( in_modal ){
                return task_status_id === 10  || task_status_id === 14 ? 'finished-task-modal' : '';
            } else {
                return task_status_id === 10  || task_status_id === 14 ? 'finished-task' : '';
            }
        };

        $scope.refresh = function(){
            $route.reload();
        }
    }
]);