angular.module('trelloRedmine')
.directive('newCardForm', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/templates/new_card_form.html'
    };
});