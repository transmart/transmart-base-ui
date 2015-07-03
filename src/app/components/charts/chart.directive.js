'use strict';

angular.module('transmartBaseUi')
  .directive('tsCohortChart', ['ChartService', function(ChartService) {
    return {
      templateUrl: 'app/components/charts/cohort-chart-template.html',
      link: function(scope, el, attr) {
        scope.$on('gridster-item-resized', function(e, item) {
          ChartService.doResizeChart(scope.label.ids,
                                      scope.gridsterItem.sizeY*scope.gridster.curRowHeight - 80,
                                      scope.gridsterItem.sizeX*scope.gridster.curColWidth - 50);
        });
      }
    };
  }]);
