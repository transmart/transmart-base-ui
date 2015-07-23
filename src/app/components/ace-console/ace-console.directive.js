'use strict';

angular.module('transmartBaseUi')
  .directive('aceConsole', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/components/ace-console/ace-console.tpl.html',
      scope: {},
      controller: function($scope) {
        $scope.aceOptions = {
          theme: 'idle_fingers',
          mode: 'r',
          useWrapMode : true
        };
        $scope.example = 'require(rCharts)\nrPlot(mpg ~ wt, data = mtcars,type = "point")';


      }
    };
});
