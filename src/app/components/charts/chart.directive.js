'use strict';

angular.module('transmartBaseUi')
  .directive('tsCohortChart', ['ChartService', function(ChartService) {
    return {
      templateUrl: 'app/components/charts/cohort-chart-template.html',
      link: function(scope, el, attr) {
        scope.title = scope.label.name + " - " + scope.label.study._embedded.ontologyTerm.name;
        scope.$on('gridster-item-resized', function(e, item) {
          scope.divWidth = scope.gridsterItem.sizeX*scope.gridster.curColWidth/10;
          ChartService.doResizeChart(scope.label.ids,
            scope.gridsterItem.sizeY*scope.gridster.curRowHeight - 60,
            scope.gridsterItem.sizeX*scope.gridster.curColWidth - 50);
        });
      }
    };
  }]);
