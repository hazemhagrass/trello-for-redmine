angular.module('trelloRedmine')
.controller('DashboardCtrl', ['$scope', '$timeout', '$modal', '$http', 'redmineService', '$localStorage', '$location', '$sce', '$route', 'cardsOrder', function($scope, $timeout, $modal, $http, redmineService, $localStorage, $location, $sce, $route, cardsOrder) {

        $scope.current_user = {};
        $scope.user_projects = [];
        $scope.widgets = [];
        $scope.card = {};
        $scope.card.attachments = [];
        $scope.activities = [];
        $scope.projectMembers = [];
        $scope.subject = "";

        $scope.styleUrl = 'assets/stylesheets/cards_style.css';
        // TODO: make it dynamic
        $scope.allowed_statuses = [8, 9, 10];
        $scope.allowed_statuses_names = ['Defined', 'In progress', 'Completed'];
        $scope.allowed_statuses_object = [
            { id: 8, name: 'Defined' },
            { id: 9, name: 'In progress' },
            { id: 10, name: 'Completed' },
            { id: 14, name: 'Finished' }
        ];

        $scope.setCurrentUser = function (api_key) {
            $localStorage.current_api_key = api_key;
        };

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        var project_url = $location.path().split('/');
        $scope.project_id = project_url[2];

        if(!$scope.project_id) return; 

        $scope.go = function (page) {
            $location.path('/trello/' + page.id);
        };

        $scope.priorities = [];

        redmineService.getProjectMembers($scope.project_id)
        .then(function(result) {
            console.log(JSON.stringify(result));
        }, function(error) {
            console.log(error);
        });

        redmineService.getIssuePriorities()
        .then(function (result) {
            $scope.priorities = result.data.issue_priorities;
        }, function (error) {
            console.log(error);
        });

        /*$scope.allowed_statuses = [8, 9, 10];
        $scope.getUserLists = function() {
            $http.get('/settings/config/lists/' + $localStorage.current_api_key)
            .success(function(data, status){
                console.log(data)
                if(data) {
                    $scope.allowed_statuses = data.split(",");
                } else {
                    $scope.allowed_statuses = [8,9,10,11];
                }
            }).error(function(err, status){
                $scope.allowed_statuses = [8,9,10];
                console.log(err);
            });
        };

        $scope.getUserLists();*/

        redmineService.getUserProjects('current')
        .then(function (result) {
            $scope.current_user = result.data.user;
            // scope.user_projects = result.data.user.memberships;
            $scope.user_projects = result.data.user.memberships.map(function(project){
                return project.project;
            });
            $scope.user_projects.forEach(function(project) {
                if(project.id == $scope.project_id) {
                    $scope.selected_project = project;
                }
            });
        });

        redmineService.getIssuesStatuses()
        .then(function (result) {
            $scope.widgets = result.data;
            console.log($scope.widgets)
            // TODO: do it in better way
            for(var i = 0; i < $scope.allowed_statuses.length; i++) {
                $scope.widgets[$scope.allowed_statuses[i] - 1].allowed = true;
            }

            // BUG FIX: if getProjectUserStories gets called before getIssuesStatuses, $scope.widgets is undefined
            redmineService.getProjectUserStories($scope.project_id)
            .then(function (result) {
                
                for(var i = 0; i < $scope.widgets.length; i++) {
                    $scope.widgets[i].cards = [];
                }

                for(var key in result.data) {
                    if(result.data.hasOwnProperty(key)) {
                        try{
                            $scope.widgets[key - 1].cards = result.data[key];
                        } catch (err){
                            console.log('debug');
                        }
                        
                        //get user data
                        for(var card_key in $scope.widgets[key - 1].cards) {
                            var card = $scope.widgets[key - 1].cards[card_key];
                            card.showDetails = false;
                            console.log(card)
                            var getAttachments = function(card) {
                                redmineService.getIssueAttachments(card.id)
                                .then(function (result) {
                                    card.attachments = result.data.issue.attachments;
                                    if(card.attachments.length > 0) {
                                        card.hasAttachments = true;
                                    } else {
                                        card.hasAttachments = false;
                                    }
                                    $scope.getLastImage(card)
                                }, function (error) {
                                    console.log(error);
                                });
                            }

                            var getSubTasks = function(card){
                                var storyId = card.id;
                                var projectId = card.project.id;
                                var issues = [];                        
                                var subTasks = [];

                                card.finishedTasks = 0;
                                card.subTasks = [];

                                redmineService.getStoryTasks(projectId, storyId)
                                .then(function (result) {
                                    issues = result.data.issues;
                                    angular.forEach(issues, function(issue) {    
                                        if (issue.parent && issue.parent.id == storyId) {
                                            if (issue.status.id == 14) card.finishedTasks++;
                                            this.push(issue);
                                        }
                                    }, subTasks);

                                    card.subTasks = subTasks;
                                }, function (error) {
                                    console.log(error);
                                });
                            }

                            getSubTasks(card);
                            getAttachments(card);
                        }
                    }
                }
            });
        }); 

        /*redmineService.getProjectMembers($scope.project_id)
        .then(function (result) {
            angular.forEach(result.data.memberships, function(membership) {  
                var member = {
                    "id": membership.user.id,
                    "name": membership.user.name
                };
                this.push(member);
            }, $scope.projectMembers);
        }, function (error) {
            console.log(error);
        });*/

        $scope.gridsterOptions = {
            margins: [20, 20],
            columns: 3,
            draggable: {
                handle: '.box-header'
            },
            swapping: true,
            resizable: {
                handles: ['s']
            }
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
                backdropClass: "backdrop-fix"//,
                // USELESS WITHOUT A CONTROLLER TO PASS PARAMETERS TO IT
                // resolve: {
                //     card: function() {
                //         return card;
                //     }
                // }

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

        $scope.updateIssue = function(issue_id, updated_data, card) {
            redmineService.updateIssue(issue_id, updated_data)
            .then(function (result) {
                // Check the updated data is a task inside a card
                if(updated_data.parent) {
                    var task_index = 0;
                    for (var i = 0; i < card.subTasks.length; i++) {
                        if (card.subTasks[i].id == updated_data.id ){
                            task_index = i;
                            break;
                        } 
                    };
                    card.subTasks[task_index] = result.config.data;
                    if(result.config.data.assigned_to_id) getUserInfo(task_index, result.config.data.assigned_to_id);
                    if(result.config.data.status_id) {
                        card.subTasks[task_index].status.id = result.config.data.status_id;
                    }

                    redmineService.getIssue(updated_data.parent.id)
                    .then(function (result) {
                        var old_card = card;
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
                            // $route.reload();
                            // angular.element('.connectedSortable').sortable('refresh');
                            // $(".connectedSortable").trigger("sortupdate");
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

        $scope.getConfigData = function() {
            $http.get('/settings/config/' + $localStorage.current_api_key)
            .success(function(data, status){
                console.log(data.host);
                $scope.config = data;
            }).error(function(err, status){
                console.log(err);
            });
        };

       

        $scope.saveUserLists = function() {
            $http.post('/settings/config/lists/' + $localStorage.current_api_key, $scope.allowed_statuses)
            .success(function(data, status){
                console.log(status);
            }).error(function(err, status){
                console.log(err);
            });
        };

        //get config data
        $scope.getConfigData();

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


        redmineService.getActivities($scope.project_id)
        .then(function (result) {
            var data = JSON.parse(result.data);
            angular.forEach(data.activities, function(activity){
                this.push(activity);
            }, $scope.activities)
        });

        $scope.showCardAccordion = function(card) {
            $timeout(function() {
                angular.element("#accord-" + card.id).trigger('click');
            }, 100);
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