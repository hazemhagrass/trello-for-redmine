angular.module('trelloRedmine')
.controller('NewCardCtrl', ['$scope', '$localStorage', 'redmineService',
  function($scope, $localStorage, redmineService) {

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

    $scope.addNewCard = function(widget) { 
      $scope.newCard.status_id = widget.status_id;
      redmineService.createTask($scope.newCard)
      .then(function (result) {
        var issue = result.data.issue;
        issue.assigned_to.mail = $localStorage.user_mail;
        issue.subTasks = []; 
        issue.attachments = [];
        widget.cards.unshift(issue);
      }, function (error) {
        console.log(error);
      });
    };
  }
]);