angular.module('trelloRedmine')
.controller('NewCardCtrl', ['$scope', '$localStorage', 'redmineService', 'activitiesHelpers',
  function($scope, $localStorage, redmineService, activitiesHelpers) {

    $scope.newCard = initiateCard();

    $scope.addNewCard = function(widget) {
      $scope.newCard.status_id = widget.status_id;
      redmineService.createTask($scope.newCard)
      .then(function (result) {
        var issue = result.data.issue;
        // issue.assigned_to.mail = $localStorage.user_mail;
        issue.assigned_to.mail = issue.assigned_to.name.replace(/ /g, '.').toLowerCase() + '@badrit.com';
        issue.subTasks = []; 
        issue.attachments = [];
        widget.cards.unshift(issue);
        activitiesHelpers.appendCard(issue);
      }).finally( function() {
        $scope.newCard = initiateCard();
      });
    };

    function initiateCard(){
      return {
        subject: "",
        description: "",
        project_id: $scope.project_id,
        tracker_id: 5,
        status_id: '',
        priority_id : 3,
        parent_issue_id : '',
        is_private: 0,
        assigned_to_id: $localStorage.user_id
      };
    }
  }
]);