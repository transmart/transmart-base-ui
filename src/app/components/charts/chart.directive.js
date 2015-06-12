'use strict';

angular.module('transmartBaseUi')
  .directive('tsChart', function() {
    return {
      templateUrl: '/app/components/charts/chart-template.html'
    };
  })
  .directive('tsCohortChart', function() {
    return {
      templateUrl: '/app/components/charts/cohort-chart-template.html'
    };
  })
  .directive('repeatDone', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function (scope, element, iAttrs) {
      if (scope.$last){
        $rootScope.$broadcast('chartContainersReady', true);
      }
    }
  };
}]);
