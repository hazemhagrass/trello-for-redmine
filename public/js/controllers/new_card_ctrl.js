angular.module('trelloRedmine')
.controller('NewCardCtrl', ['$scope', '$localStorage', 'redmineService', 'toaster',
  function($scope, $localStorage, redmineService, toaster) {

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
      toaster.pop({ type: 'info',
        title: 'A new card is being added.',
        showCloseButton: true
      });
      $scope.newCard.status_id = widget.status_id;
      redmineService.createTask($scope.newCard)
      .then(function (result) {
        var issue = result.data.issue;
        // issue.assigned_to.mail = $localStorage.user_mail;
        issue.assigned_to.mail = issue.assigned_to.name.replace(/ /g, '.').toLowerCase() + '@badrit.com';
        issue.subTasks = []; 
        issue.attachments = [];
        widget.cards.unshift(issue);
      });
    };
  }
]);