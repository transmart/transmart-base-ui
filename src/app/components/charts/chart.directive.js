'use strict';

angular.module('transmartBaseUi')
  .directive('tsCohortChart', ['ChartService', function(ChartService) {
    return {
      templateUrl: 'app/components/charts/cohort-chart-template.html',
      link: function(scope, el, attr) {
        //Title for the chart panel
        scope.title = scope.label.name +
                      ' - ' +
                      scope.label.study._embedded.ontologyTerm.name;

        //When the gridster element that contains the panel is resized
        scope.$on('gridster-item-resized', function(e, item) {
          //Calculate the gridster element size
          var _width = scope.gridsterItem.sizeX * scope.gridster.curColWidth;
          var _heigth = scope.gridsterItem.sizeY * scope.gridster.curRowHeight;
          //Number of caracters after wich the title string will be cut off
          //10 pixels per caracter is assumed
          scope.cutOff = _width / 10;
          //Resize the chart leving some margin space
          ChartService.doResizeChart(scope.label.ids, _heigth-60, _width-50);
        });
      }
    };
  }]);
