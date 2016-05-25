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
      link: function(scope, el) {

        var _bodyDiv = el.find('div')[2],
            _chart = ChartService.createCohortChart(scope.tsLabel, _bodyDiv);

        _chart.on('filtered', function () {
          ChartService.triggerFilterEvent();
          scope.$evalAsync();
        });

        _chart.render();

        // check if chart is number chart or not
        scope.isNumberChart = _chart.type === 'NUMBER';

        // show group icon
        scope.showGroupIcon = scope.tsLabel.type !== 'combination' && scope.tsLabel.type !== 'highdim';

        // resize chart when container is being resized
        scope.$watchGroup(['tsGridsterItem.sizeX', 'tsGridsterItem.sizeY'],
          function (newValues, oldValues, scope) {

            if (!_.isEqual(newValues, oldValues)) {

              //Calculate the gridster element size
              var _width = newValues[0] * scope.tsGridster.curColWidth;
              var _height = newValues[1] * scope.tsGridster.curRowHeight;

              //Number of characters after which the title string will be cut off
              //10 pixels per characters is assumed

              scope.cutOff = _width / 10;

              //Resize the chart leaving some margin space
              ChartService.doResizeChart(scope.tsLabel.ids, _height - 60, _width - 50);
            }
          });

        // Title for the chart panel
        scope.title = scope.tsLabel.name + ' - ' + scope.tsLabel.study._embedded.ontologyTerm.name;

        /**
         * Group charts
         */
        scope.groupAction = function () {
          scope.groupOn = true;
          ChartService.groupCharts(_chart, function () {
            scope.groupOn = false;
          });
        };

      }
    };
  }]);
