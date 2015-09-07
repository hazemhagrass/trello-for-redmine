angular.module('trelloRedmine').directive('resolveLoader', function($rootScope, $timeout) {

  return {
    restrict: 'E',
    replace: true,
    template: '<div class="alert alert-success"><i class="fa fa-spinner fa-spin"></i><strong>Welcome!</strong> Content is loading, please hold.</div>',
    link: function(scope, element) {
      $rootScope.$on('$routeChangeSuccess', function() {
        element.addClass('ng-hide');
      });
    }
  };
});