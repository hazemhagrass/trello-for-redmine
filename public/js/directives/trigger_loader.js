angular.module('trelloRedmine')
.directive('triggerLoader', function() {
  return function(scope, element, attr) {
    scope.$watch('card.card_loading', function(){
      if(scope.card.card_loading){
        $(element).find("#overlay").show();
      } else {
        $(element).find("#overlay").hide();
      }
    });

  };
});