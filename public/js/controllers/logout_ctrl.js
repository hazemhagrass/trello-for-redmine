angular.module('trelloRedmine')
.controller('LogoutCtrl', ['$scope', '$localStorage',
    function($scope, $localStorage) {

        // Needed to make a full post request to the server, because AJAX requests cannot have redirect in the response
        $scope.logoutUrl = '/redmine/logout/user/' + $localStorage.current_api_key;

        $scope.logout = function() {
            $localStorage.$reset();
        };
    }
]);