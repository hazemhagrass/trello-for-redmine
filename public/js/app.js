(function() {
	angular.module('trelloRedmine', ['gridster', 'ui.bootstrap.accordion', 'ui.bootstrap.tpls', 'ui.bootstrap.modal', 'ngRoute', 'ui.sortable', 'ngAnimate', 'mgcrea.ngStrap.popover', 'mgcrea.ngStrap.tooltip',
                                    'ui.gravatar', 'xeditable', 'ngSanitize', 'ngStorage', 'angularFileUpload', 'toaster'])
		.config(['$routeProvider', '$locationProvider',
			function($routeProvider, $locationProvider) {
				$routeProvider
                    .when('/login', {
                        templateUrl: 'views/templates/login.html',
                        controller: 'AuthCtrl'
                    })
                    .when('/trello/:project_id/:api_key', {
                        templateUrl: 'views/templates/home.html',
                        controller: 'DashboardCtrl',
                        resolve: {
                            populationFinished: ['$route', 'redmineAPI', function($route, redmineAPI) {
                                return redmineAPI.populateData($route.current.params.project_id);
                            }]
                        }
                    })
                    .otherwise({
                        redirectTo: '/login'
                    });

                $locationProvider.html5Mode(true);
            }
        ])
        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push(['toaster', '$q', function(toaster, $q) {
                return {
                    'responseError': function(rejection) {
                        toaster.pop({ type: 'error',
                            title: 'Network error, please reload.',
                            showCloseButton: true
                        });
                        return $q.reject(rejection);
                    }
                };
            }])
        }])
        .run(function(editableOptions) {
            editableOptions.theme = 'bs3';
        })
        .run( function($rootScope, $location, $localStorage) {
            // register listener to watch route changes
            /*$rootScope.$on( "$routeChangeStart", function(event, next, current) {
                console.log(next.templateUrl)
                if($localStorage.current_api_key) {
                    if(next.templateUrl == "views/templates/login.html" ){
                        $location.path('/trello/' + $localStorage.first_project_id);
                    }
                }     
            });*/
        })
})();