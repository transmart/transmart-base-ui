'use strict';

angular.module('transmartBaseUi')
  .directive('tsCohortChart', ['ChartService', function(ChartService) {

    var _scope = {
      tsGridster: '=',
      tsGridsterItem: '=',
      tsLabel: '='
    };

    return {
      restrict: 'E',
      templateUrl: 'app/components/charts/cohort-chart.tpl.html',
      scope: _scope,
      link: function(scope, el, attrs) {

        var _bodyDiv = el.find('div')[2];
        var _chart = ChartService.createCohortChart(scope.tsLabel, _bodyDiv);

        if (_chart) {

          _chart.on('filtered', function () {
            ChartService.triggerFilterEvent();
            scope.$evalAsync();
          });

          _chart.render();

          if (_chart.type === 'NUMBER') {
            scope.number = true;
          }

          if (scope.tsLabel.type !== 'combination' &&
            scope.tsLabel.type !== 'highdim') {
            scope.showGroupIcon = true;
          }

          scope.$watchGroup(['tsGridsterItem.sizeX', 'tsGridsterItem.sizeY'],
            function (newValues, oldValues, scope) {

              //Calculate the gridster element size
              var _width = scope.tsGridsterItem.sizeX * scope.tsGridster.curColWidth;
              var _height = scope.tsGridsterItem.sizeY * scope.tsGridster.curRowHeight;

              //Number of characters after which the title string will be cut off
              //10 pixels per characters is assumed
              scope.cutOff = _width / 10;

              //Resize the chart leaving some margin space
              ChartService.doResizeChart(scope.tsLabel.ids, _height - 60, _width - 50);
            });

          //Title for the chart panel
          scope.title = scope.tsLabel.name + ' - ' + scope.tsLabel.study._embedded.ontologyTerm.name;

          scope.groupAction = function () {
            scope.groupOn = true;
            ChartService.groupCharts(_chart, function () {
              scope.groupOn = false;
            });
          };

        } else {
          console.error('Cannot create chart');
        }
      }
    };
  }]);
