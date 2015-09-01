angular.module('trelloRedmine')
.controller('AuthCtrl', ['$scope', '$location', '$localStorage', '$window', 'redmineService',
    function($scope, $location, $localStorage, $window, redmineService) {
    
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
                $localStorage.first_project_id = result.data.first_project_id;
                $location.path('/trello/' + result.data.first_project_id);
            }, function(){
                alert('Unauthorized user');
            });
        };

        $scope.logout = function() {

            redmineService.logout()
            .then(function(result){
                $localStorage.$reset();
                $window.location.href = 'http://redmine.badrit.com';
            });
        };
    }
]);