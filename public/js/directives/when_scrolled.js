angular.module('trelloRedmine').directive('whenScrolled', function() {
  return function(scope, element, attr) {
    
    element.bind('scroll', function() {
      if ( element.prop('scrollHeight') - element.scrollTop() - element.height() <= 10 ) {
        scope.$apply(attr.whenScrolled);
      }
    });
    
  };
});