'use strict';

angular.module('transmartBaseUi')
  .directive('tsCohortChart', ['ChartService', function(ChartService) {
    return {
      templateUrl: 'app/components/charts/cohort-chart-template.html',
      link: function(scope, el, attr) {
        scope.$on('gridster-item-resized', function(e, item) {
          ChartService.doResizeChart(scope.label.ids,
                                      item.sizeY*item.gridster.curRowHeight - 50,
                                      item.sizeX*item.gridster.curColWidth - 50);
        });
      }
    };
  }]);
