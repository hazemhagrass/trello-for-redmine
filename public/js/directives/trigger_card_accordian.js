angular.module('trelloRedmine')
.directive('triggerCardAccordion', ['$timeout', function($timeout) {
  return function(scope, element, attr) {
    element.bind('click', function() {
      $timeout(function() {
        angular.element("#accord-" + scope.card.id).trigger('click');
      }, 100);
    });
  };
}]);