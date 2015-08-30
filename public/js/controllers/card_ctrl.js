angular.module('trelloRedmine')
.controller('CardCtrl', ['$scope', '$timeout', '$modal', '$upload', '$localStorage', 'redmineService', 'cardsHelpers',
    function($scope, $timeout, $modal, $upload, $localStorage, redmineService, cardsHelpers) {
        
        // $scope.widget = widget;
        // $scope.status_val = false;
        // $scope.dropAreaState = false;
        $scope.estimateSizes = ['0.0', '0.5', '1.0', '2.0', '3.0', '5.0', '8.0', '13.0','20.0','40.0','60.0','100.0', '200.0'];
        // var card = $scope.card;
        // $scope.storySize = 0;
        // $scope.businessValue = 0;
        // $scope.release = 0;

        // var assigned_to_id = (card.assigned_to) ? card.assigned_to.id : '';
        // var priority_to_id = (card.priority_to) ? card.priority.id : '';
        
        function getCustomeFieldValues() {
            $scope.card.custom_fields.forEach(function(field){
                if(field.name == "Story-size") $scope.storySize = field.value;
                if(field.name == "Business Value") $scope.businessValue = field.value;
                if(field.name == "Release") $scope.release = field.value;
            });
        };

        getCustomeFieldValues();

        $scope.updateCard = function(card) {
            $scope.updateIssue(card.id, card);
        };

        $scope.deleteAttachment = function(attachment_id, id) {
            $scope.card.attachments.splice(id, 1); 
            redmineService.deleteAttachment(attachment_id)
            .then(function (result) {
                console.log(result);
                if($scope.card.attachments.length == 0) {
                    $scope.card.last_image = null;
                    $scope.card.hasAttachments = false;
                } else {
                    getLastImage($scope.card);
                }
                
            }, function (error) {
                console.log(error);
            });
        };

        function getLastImage(card) {
            angular.forEach(card.attachments, function(attach) {
                if(attach.content_type.search("image/") >= 0) {
                    card.last_image = attach;
                }
            }, card.last_image);
        };

        $scope.getImageLink = function(card) {
            if(card.last_image) {
                return card.last_image.content_url;
            } else {
                return "http://blog.no-panic.at/wp-content/uploads/2011/04/redmine_logo_v1.png";
            }
        };

        $scope.$watch('files', function () {
            upload($scope.files, $scope.card);
        });

        function upload(files, card) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    $upload.upload({
                        url: '/redmine/upload/file/' + card.id + "/" + $localStorage.current_api_key,
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {

                        redmineService.getIssueAttachments(card.id)
                        .then(function (result) {
                            card.attachments = result.data.issue.attachments;
                            card.hasAttachments = true;
                            $scope.getLastImage(card);
                        }, function (error) {
                            console.log(error);
                        });
                        console.log('file ' + config.file.name + ' uploaded. Response: ' + data);
                    });
                }
            }
        };

        $scope.editCard = function(widget, card) { 
            // I think it need more restructure to improve performence 
            // var storyId = card.id;
            // var projectId = card.project.id;
            // var subTasks = [];
            // var issues = [];
            // $scope.subTasks = [];
            // $scope.progress = 0;
            // $scope.finishedTasks = 0;
         
            // $scope.attachments = [];

            cardsHelpers.calculateProgress(card);
            
            $modal.open({
                scope: $scope,
                templateUrl: 'views/templates/edit_card.html',
                backdropClass: "backdrop-fix"
            });
        }
    }
]);