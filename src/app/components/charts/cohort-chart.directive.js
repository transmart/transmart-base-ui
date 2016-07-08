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

        var  _chart,
            _bodyDiv = el.find('div')[2],
            _cached =  _.find(ChartService.cs.charts, {id: scope.tsLabel.ids});

        // always create new chart even it's been cached
        _chart = ChartService.createCohortChart(scope.tsLabel, _bodyDiv);

        if (_cached) {
          _chart.gridInfo = _cached.gridInfo; // get cached gridster info
        }

        // on filtered
        _chart.on('filtered', function () { 
          scope.$evalAsync(ChartService.triggerFilterEvent);
        });

        // check if chart is number chart or not
        scope.isNumberChart = _chart.type === 'NUMBER';

        // show group icon
        scope.showGroupIcon = scope.tsLabel.type !== 'combination' && scope.tsLabel.type !== 'highdim';

        // resize chart when container is being resized
        scope.$watchGroup([
          'tsGridsterItem.sizeX', 'tsGridsterItem.sizeY',
          'tsGridster.curColWidth', 'tsGridster.curRowHeight'
        ], function (newValues, oldValues, scope) {

            if (!_.isEqual(newValues, oldValues) || !_cached) {
              // save gridster info
              _chart.gridInfo = {
                sizeX : newValues[0],
                sizeY : newValues[1],
                curColWidth : newValues[2],
                curRowHeight : newValues[3]
              };
            }

            // Number of characters after which the title string will be cut off
            // 10 pixels per characters is assumed
            scope.cutOff =  _chart.gridInfo.sizeX * _chart.gridInfo.curColWidth / 10;
            ChartService.resizeChart(_chart);
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
