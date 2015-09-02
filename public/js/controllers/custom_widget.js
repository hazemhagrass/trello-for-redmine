angular.module('trelloRedmine')
.controller('CustomWidgetCtrl', ['$scope', '$modal',
  function($scope, $modal) {

    $scope.remove = function(widget) {
      $scope.widgets.splice($scope.widgets.indexOf(widget), 1);
    };

    $scope.openSettings = function(widget) {
      $modalInstance = $modal.open({
        scope: $scope,
        templateUrl: 'views/templates/widget_settings.html',
        controller: 'WidgetSettingsCtrl',
        backdropClass: "backdrop-fix",
        resolve: {
          widget: function() {
            return widget;
          }
        }
      });
    };
  }
]);