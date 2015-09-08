angular.module('trelloRedmine')
.controller('ExistingCardCtrl', ['$scope', '$modal', '$upload', '$localStorage', 'redmineService', 'cardsHelpers',
  function($scope, $modal, $upload, $localStorage, redmineService, cardsHelpers) {

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
        // To do: handle error
      card.card_loading = true;
      redmineService.updateIssue(card.id, card).then(function(result) {
        // GET ISSUE AFTER UPDATING TO UPDATE ASSIGNED TO FIELD IN ANGULAR
        redmineService.getIssue(card.id)
        .then(function (updated_card) {
          card.assigned_to = updated_card.data.issue.assigned_to;
          card.assigned_to.mail = card.assigned_to.name.replace(/ /g, '.').toLowerCase() + '@badrit.com';;
          console.log(result);
        }).finally( function() {
          delete card.card_loading;
        });
      });
    };

    $scope.deleteAttachment = function(attachment_id, id) {
      $scope.card.attachments.splice(id, 1);
      redmineService.deleteAttachment(attachment_id)
      .then(function (result) {
        if($scope.card.attachments.length == 0) {
          $scope.card.last_image = null;
          $scope.card.hasAttachments = false;
        } else {
          getLastImage($scope.card);
        }

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

    $scope.$watch('card.files', function () {
      upload($scope.card.files, $scope.card);
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
              getLastImage(card);
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

      $modalInstance = $modal.open({
        scope: $scope,
        templateUrl: 'views/templates/edit_card.html',
        backdropClass: "backdrop-fix"
      });
  }
  }
]);