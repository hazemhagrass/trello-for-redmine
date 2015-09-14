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
                $localStorage.user_id =  result.data.user.id;
                $localStorage.current_api_key =  result.data.user.api_key;
                redmineService.setApiKey(result.data.user.api_key);
                $localStorage.first_project_id = result.data.first_project_id;
                $location.path('/trello/' + result.data.first_project_id);
            }, function(){
                alert('Unauthorized user');
            });
        };

    }
]);