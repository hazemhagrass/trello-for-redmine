angular.module('trelloRedmine')
.directive('triggerCardAccordion', ['$timeout', function($timeout) {
  return function(scope, element, attr) {
    scope.accordion_icon_title = "Show Tasks";
    element.bind('click', function() {
      $timeout(function() {
        angular.element("#accord-" + scope.card.id).trigger('click');
      }, 100);
      scope.accordion_icon_title = scope.accordion_icon_title === "Show Tasks" ? "Hide Tasks" : "Show Tasks";
    });
  };
}]);