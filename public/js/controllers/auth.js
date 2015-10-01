angular.module('trelloRedmine')
.controller('AuthCtrl', ['$scope', '$location', '$localStorage', 'redmineService',
    function($scope, $location, $localStorage, redmineService) {
    
        $scope.username = "";
        $scope.password = "";

        $scope.login = function() {
            var user ={
                "username" : $scope.username,
                "password" : $scope.password
            };

            redmineService.authUser(user)
            .then(function(result){
                $location.path('/trello/51');
            }, function(){
                alert('Unauthorized user');
            });
        };

    }
]);