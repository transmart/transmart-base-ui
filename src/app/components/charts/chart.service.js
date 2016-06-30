'use strict';

angular.module('transmartBaseUi').factory('ChartService',
  ['Restangular', '$q', '$rootScope', '$timeout', 'AlertService', 'DcChartsService', 'GridsterService',
  function (Restangular, $q, $rootScope, $timeout, AlertService, DcChartsService, GridsterService) {

    var chartService = {
      cs : {}
    };

    chartService.triggerFilterEvent = function (chart, filter) {
      if (filter !== null) { // only trigger when there's filter
        chartService.updateDimensions();
      }
    };

  var _numDisplay = function (cDimension, cGroup, el){
    var _number = dc.numberDisplay(el);
    _number.group(cGroup)
      .html({
        one:'%number',
        some:'%number',
        none:'%number'
      })
      .formatNumber(d3.format('f'));
    return _number;
  };


  /**
   * Get the last token when requested model is a string path
   * @param what
   * @returns {*}
   * @private
   */
  var _getLastToken = function (what) {
      var _t = what.split('\\').slice(1);
      return what.indexOf('\\') === -1 ? what : _t[_t.length - 2];
  };

  /**
  * @param charts
  */
  chartService.renderAll = function (charts) {
    if(!charts){
      charts = chartService.cs.charts;
    }
    angular.forEach(charts, function (chart) {
      if(!chart.rendered){
        chart.render();
        chart.rendered = true;
      }
    });
  };

  var _saveFilters = function(){
    chartService.cs.charts.forEach(function(chart){
      chart.savedFilters = chart.filters();
    });
  };

  var _reapplyFilters = function(){
    chartService.cs.charts.forEach(function(chart){
      chart.savedFilters.forEach(function(filter){
        chart.filter(filter);
      });
    });
    dc.redrawAll();
  };

    chartService.reapplyFilters = function () {
      chartService.cs.charts.forEach(function(chart){
        chart.savedFilters.forEach(function(filter){
          chart.filter(filter);
        });
      });
      dc.redrawAll();
    };

  var _groupCharts = function (chart1, chart2) {
    var _combinationLabel = {
      ids: chartService.cs.chartId++,
      label: [chart1.tsLabel, chart2.tsLabel],
      name: chart1.tsLabel.name + ' - ' + chart2.tsLabel.name,
      resolved: false,
      //TODO: manage multiple studies
      study: chart1.tsLabel.study,
      type: 'combination'
    };
    chartService.cs.subjects.forEach(function(sub){
      if(sub.labels[chart1.tsLabel.ids] || sub.labels[chart2.tsLabel.ids]){
        sub.labels[_combinationLabel.ids] = [sub.labels[chart1.tsLabel.ids], sub.labels[chart2.tsLabel.ids]];
      }
    });
    chartService.cs.labels.push(_combinationLabel);
    $rootScope.$broadcast('prepareChartContainers',chartService.cs.labels);
  };

  var _groupingChart = {};

  chartService.groupCharts = function (newChart, turnOff) {
    // If a first chart was already selected, group them together
    if(_groupingChart.chartOne){
      _groupCharts(newChart, _groupingChart.chartOne);
      // Turn off both selection lights
      _groupingChart.turnOff();
      turnOff();
      _groupingChart = {};
    // If this is the first chart selected
    }else{
      _groupingChart.chartOne = newChart;
      _groupingChart.turnOff = turnOff;
    }
  };

  /**
   * Reset the cohort chart service to initial state
   */
  chartService.reset = function () {

    chartService.cs.subjects = [];
    chartService.cs.chartId = 0;
    chartService.cs.charts = [];
    chartService.cs.cross = crossfilter();
    chartService.cs.dims = {};
    chartService.cs.numDim = 0;
    chartService.cs.maxDim = 20;
    chartService.cs.groups = {};
    chartService.cs.labels = [];
    chartService.cs.selected = 0;
    chartService.cs.total = 0;
    chartService.cs.dimensions = 0;

    _groupingChart = {};

    // Main dimension used to get selection values
    chartService.cs.mainDim = chartService.cs.cross.dimension(function (d) {
      return d.labels;
    });

    $rootScope.$broadcast('prepareChartContainers', chartService.cs.labels);
  };

  var _getType = function (value) {
    var _type = typeof value;
    if(_type === 'string'){
      if(value === 'E' || value === 'MRNA'){
        _type = 'highdim';
      }
    } else if (_type === 'number'){
      if((value % 1) !== 0) {
        _type = 'float';
      }
    }
    return _type;
  };

    /**
     * Add new label to list and check data type
     * @param label
     * @param value
     * @private
     */
    var _addLabel = function (obs, node, filters) {

      // Check if label has already been added
      var label = _.find(chartService.cs.labels, {label: obs.label});

      if (!label) {

        //Check that the maximum number of dimensions has not been reached
        if (chartService.cs.numDim < chartService.cs.maxDim) {

          chartService.cs.numDim++;
          // Create the new label object

          label = {
            label : obs.label,
            type : _getType(obs.value),
            name : _getLastToken(obs.label),
            ids : chartService.cs.chartId++,
            study : node.study,
            resolved : false,
            filters : filters
          };

          chartService.cs.labels.push(label);

        } else {
          AlertService.add('danger', 'Max number of dimensions reached !', 2000);
        }
      } else {
        // if label already exists check its type
        label.type = label.type === 'float' ? label.type : _getType(obs.value);
      }

      if (label.type === 'float') {
        var precision = (obs.value + '').split('.');
        precision = precision[1] ? precision[1].length : 0;
        label.precision = label.precision ? Math.min(label.precision, precision) : precision;
      }

      return label.ids;
    };

    /**
     * Remove all the filters applied to the label dimensions
     * TODO: Add the possibility to reapply removed filters
     * @private
     */
    var _removeAllLabelFilters = function () {
      _.each(chartService.cs.dims, function (dim) {
        dim.filterAll();
      });
      dc.filterAll();
      dc.redrawAll();
    };

  /**
   * Create the Crossfilter instance from the subject data
   * @private
   */
  var _populateCohortCrossfilter = function () {
    _removeAllLabelFilters();
    chartService.cs.cross.remove();
    chartService.cs.cross.add(chartService.cs.subjects);
  };

  /**
   * Fetch the data for the selected node
   * @param node
   * @returns {*}
   */
  chartService.addNodeToActiveCohortSelection = function (node, filters) {

    var _filter, _deferred = $q.defer();

    var _getFilter = function (label, filters) {
      return _.find(filters, {label:label});
    };

    // Get all observations under the selected concept
    node.restObj.one('observations').get().then(function (observations){
      observations = observations._embedded.observations;

      observations.forEach(function (obs) {
        if (obs.value !== null) {

          if (filters) {
            _filter = _getFilter(obs.label, filters);
          }

          // Add the concept to the list of chart labels
          var _id = _addLabel(obs, node, _filter);

          // Check if the subject of the observation is already present
          var found = _.find(chartService.cs.subjects, {id: obs._embedded.subject.id});

          if (found){
            found.labels[_id] = obs.value;
          } else {
            obs._embedded.subject.labels = {};
            obs._embedded.subject.labels[_id] = obs.value;
            chartService.cs.subjects.push(obs._embedded.subject);
          }
        }
      });

      // Add all the subjects to a crossfilter instance
      _saveFilters();

      _populateCohortCrossfilter();

      // Notify the applicable controller that the chart directive instances
      // can be created
      //$rootScope.$broadcast('prepareChartContainers', chartService.cs.labels);
      GridsterService.resize('#main-chart-container', chartService.cs.labels, false);

      _reapplyFilters();

      _deferred.resolve();

    }, function (err) {
      //TODO: add alert
      _deferred.reject('Cannot get data from the end-point.' + err);
    });

    return _deferred.promise;
  };

  /**
   * Remove specified label
   * @param label
   */
  chartService.removeLabel = function (label) {

    // Remove dimension and group associated with the label
    chartService.cs.dims[label.ids].dispose();
    chartService.cs.numDim--;
    chartService.cs.groups[label.ids].dispose();

    // Remove label from subjects and remove subjects no longer associated
    // with any label
    for (var i = 0; i < chartService.cs.subjects.length; i++) {
      delete chartService.cs.subjects[i].labels[label.ids];
      if (_.size(chartService.cs.subjects[i].labels) === 0) {
        chartService.cs.subjects.splice(i--, 1);
      }
    }

    //Update crossfilter instance
    _saveFilters();

    _populateCohortCrossfilter();

    //Remove the chart
    var _i = _.findIndex(chartService.cs.charts, function (c) {
      return c.id === label.ids;
    });
    if (_i >= 0) {
      chartService.cs.charts.splice(_i, 1);
    }

    //Finally remove label
    chartService.cs.labels = _.reject(chartService.cs.labels, function (el) {
      return el.ids === label.ids;
    });

    //Update charts
    $rootScope.$broadcast('prepareChartContainers', chartService.cs.labels);

    _reapplyFilters();
  };

  var _createMultidimensionalChart = function (label, el) {
    var _chart, _min, _max;

    // Check if label0 or label1 has categorical values
    if(label.label[0].type === 'string' || label.label[1].type === 'string'){
      // Check if one of them is not categorical
      if(label.label[0].type !== 'string' || label.label[1].type !== 'string'){
        // Always categorical on X axis
        var _valueX = label.label[0].type === 'string' ? 0 : 1;
        var _valueY = _valueX === 0 ? 1 : 0;

        chartService.cs.dims[label.ids] = chartService.cs.cross.dimension(function (d) {
          return d.labels[label.ids] ? d.labels[label.ids][_valueX] : undefined;
        });
        chartService.cs.groups[label.ids] = chartService.cs.dims[label.ids].group().reduce(
          function(p,v) {
            p.push(v.labels[label.ids] ? +v.labels[label.ids][_valueY] : undefined);
            return p;
          },
          function(p,v) {
            p.splice(p.indexOf(v.labels[label.ids] ? +v.labels[label.ids][_valueY] : undefined), 1);
            return p;
          },
          function() {
            return [];
          }
        );

        _max = chartService.cs.dims[label.label[_valueY].ids].top(1)[0].labels[label.label[_valueY].ids];
        _min = chartService.cs.dims[label.label[_valueY].ids].bottom(1)[0].labels[label.label[_valueY].ids];

        _chart = DcChartsService.getBoxPlot(chartService.cs.dims[label.ids], chartService.cs.groups[label.ids], el, {
          xLab: label.label[_valueX].name,
          yLab: label.label[_valueY].name,
          min: _min,
          max: _max
        });
        _chart.type = 'BOXPLOT';

      } else {
        // Both labels are categorical
        chartService.cs.dims[label.ids] = chartService.cs.cross.dimension(function (d) {
          return [d.labels[label.ids] ? d.labels[label.ids][0]: undefined,
                  d.labels[label.ids] ? d.labels[label.ids][1]: undefined];
        });
        chartService.cs.groups[label.ids] = chartService.cs.dims[label.ids].group();

        _chart = DcChartsService.getHeatMap(chartService.cs.dims[label.ids], chartService.cs.groups[label.ids], el, {
          xLab: label.label[0].name,
          yLab: label.label[1].name
        });

        _chart.type = 'HEATMAP';

      }
    } else {
      // Both labels are numerical, create a scatter plot
      chartService.cs.dims[label.ids] = chartService.cs.cross.dimension(function (d) {
        return [d.labels[label.ids] ? d.labels[label.ids][0]: undefined,
                d.labels[label.ids] ? d.labels[label.ids][1]: undefined];
      });
      chartService.cs.groups[label.ids] = chartService.cs.dims[label.ids].group();

       _max = chartService.cs.dims[label.label[0].ids].top(1)[0].labels[label.label[0].ids];
       _min = chartService.cs.dims[label.label[0].ids].bottom(1)[0].labels[label.label[0].ids];

      _chart = DcChartsService.getScatterPlot(chartService.cs.dims[label.ids], chartService.cs.groups[label.ids], el, {
        min: _min,
        max: _max,
        xLab: label.label[0].name,
        yLab: label.label[1].name
      });

      _chart.type = 'SCATTER';
    }

    return _chart;
  };

  /**
   * Create the charts for each selected label
   * TODO: Leave the existing charts in place, and only add the new ones
   * TODO: Enable removing specific charts
   * @private
   */
  chartService.createCohortChart = function (label, el) {

    var _chart;

    var _defaultDim = function (_missingLabelId) {
      chartService.cs.dims[label.ids] = chartService.cs.cross.dimension(function (d) {
        var lbl = _missingLabelId || undefined;
        return d.labels[label.ids] === undefined ? lbl : d.labels[label.ids];
      });
      chartService.cs.groups[label.ids] = chartService.cs.dims[label.ids].group();

      // filter dimension
      if (typeof label.filters !== 'undefined') {
        if (label.filters.filters.length > 0) {
          chartService.cs.dims[label.ids].filter(label.filters.filters[0]);
        }
      }
    };

    if (label.type === 'combination') {
      _chart = _createMultidimensionalChart(label, el);
    } else {
      // Create a number display if highdim
      if (label.type === 'highdim') {
        _defaultDim();
        _chart = _numDisplay(chartService.cs.dims[label.ids], chartService.cs.groups[label.ids], el);
        _chart.type = 'NUMBER';

        // Create a PIECHART if categorical
      } else if (label.type === 'string' || label.type === 'object') {
        _defaultDim("N/A");
        _chart = DcChartsService.getPieChart(chartService.cs.dims[label.ids], chartService.cs.groups[label.ids], el);
        _chart.type = 'PIECHART';

        // Create a BARCHART if numerical
      } else if (label.type === 'number') {
        _defaultDim();
        _chart = DcChartsService.getBarChart(chartService.cs.dims[label.ids], chartService.cs.groups[label.ids], el,
          {nodeTitle: label.name});
        _chart.type = 'BARCHART';

        // Create a BARCHART WITH BINS if floating point values
      } else if (label.type === 'float') {
        chartService.cs.dims[label.ids] = chartService.cs.cross.dimension(function (d) {
          return d.labels[label.ids] === undefined ? undefined : d.labels[label.ids].toFixed(label.precision === 0 ? 0 : label.precision);
        });
        chartService.cs.groups[label.ids] = chartService.cs.dims[label.ids].group();
        _chart = DcChartsService.getBarChart(chartService.cs.dims[label.ids], chartService.cs.groups[label.ids],
          el, {nodeTitle: label.name, float: true, precision: label.precision});
        _chart.type = 'BARCHART';

      }
    }

    _chart.id = label.ids;
    _chart.tsLabel = label;

    if (typeof label.filters !== 'undefined') {
      if (label.filters.filters.length > 0) {
        _chart.savedFilters = label.filters.filters;
        _.each(_chart.savedFilters, function (f) {
          _chart.filterAll();
          _chart.filter(f);
        });
      }
    }

    _chart.render(); // render chart here

    this.cs.charts.push(_chart);
    return _chart;
  };

    chartService.resizeChart = function (_chart) {

      var width = (_chart.gridInfo.sizeX * _chart.gridInfo.curColWidth) - 50;
      var height =  (_chart.gridInfo.sizeY * _chart.gridInfo.curRowHeight) - 60;

      var _CONF = {
        RAD: 0.9, // Percentage to adjust the radius of the chart
        LEG_H: 0.05,// Percentage to adjust legend position in Y
        LEG_W: 0, // Percentage to adjust legend position in X
        LEG_S: 0.03, // Legend size percentage of chart
        LEG_B: 4, // Legend size base in px
        LEG_G: 0.02, // Legend gap in percentage of chart height
        MIN_S: (width > height ? height : width), // Smallest of width or height
        TICK_X: 30, // Pixels per tick in x
        TICK_Y: 30, // Pixels per tick in y
        SLICE: 20, // Pixels per slice for pie charts
        SP_DOT_SIZE: 4, // Pixels per width / height
        BP_PIXELS_PER_GROUP: 110,
        HM_LEFT_MARGIN: width/6,
        HM_Y_LABELS_PIXELS: 10
      };


      // Adjust width and height
      _chart.width(width).height(height);

      // If the chart has a radius (ie. pie chart)
      if(_chart.type === 'PIECHART'){
        //  set the radius to half the shortest dimension
        _chart.radius((_CONF.MIN_S) / 2 * _CONF.RAD)
          // Limit the number of slices in the chart
          .slicesCap(Math.floor(_CONF.MIN_S/_CONF.SLICE))
          //
          .legend(dc.legend()
            .x(width * _CONF.LEG_W)
            .y(height * _CONF.LEG_H)
            .itemHeight(_CONF.LEG_B+_CONF.LEG_S*_CONF.MIN_S)
            .gap(_CONF.MIN_S*_CONF.LEG_G));

      } else if (_chart.type === 'BARCHART') {
        // Adjust number of ticks to not overlap
        // Number of ticks per pixel
        _chart.xAxis().ticks(Math.floor(width/_CONF.TICK_X));
        _chart.yAxis().ticks(Math.floor(height/_CONF.TICK_Y));
        _chart.rescale();

      } else if (_chart.type === 'BOXPLOT') {
        _chart.margins({top: 5, right: 5, bottom: 45, left: 40});

        if(_chart.group().all().length > width/_CONF.BP_PIXELS_PER_GROUP){
          _chart.xAxis().tickValues([]);
          _chart.yAxis().ticks(3);
        } else {
          _chart.yAxis().ticks(Math.floor(height/_CONF.TICK_Y));
          _chart.xAxis().tickValues(null);
        }

      } else if (_chart.type === 'HEATMAP') {
        _chart
          .keyAccessor(function(d) {
            return d.key[0] ? d.key[0].slice(0, Math.floor(width/80)): undefined; })
          .valueAccessor(function(d) {
            return d.key[1] ? d.key[1].slice(0, Math.floor(width/50)): undefined; })
          .colorAccessor(function(d) { return d.value; })
          .margins({top: 5, right: 5, bottom: 40, left: _CONF.HM_LEFT_MARGIN});

      } else if (_chart.type === 'SCATTER') {
        // Adjust number of ticks to not overlap
        // Number of ticks per pixel
        _chart.xAxis().ticks(Math.floor(width/_CONF.TICK_X));
        _chart.yAxis().ticks(Math.floor(height/_CONF.TICK_Y));
        // Adjust the size of the dots
        _chart.symbolSize(_CONF.SP_DOT_SIZE);
        _chart.rescale();
      }
      _chart.render();
    };

    /**
     * Return active filters
     */
    chartService.getCohortFilters = function () {
      var _filters = [];

      if (chartService.cs.charts) {
        _.each(chartService.cs.charts, function (c, _index) {
          _filters.push({
            name : chartService.cs.labels[_index].name,
            label :chartService.cs.labels[_index].label,
            type : chartService.cs.labels[_index].type,
            study: chartService.cs.labels[_index].study,
            filters : c.filters()
          });
        });
      }

      return _filters;
    };


    /**
     * Update dimension
     */
    chartService.updateDimensions = function () {
      chartService.cs.selected =  chartService.cs.cross.groupAll().value();
      chartService.cs.total = chartService.cs.cross.size();
      chartService.cs.subjects =  chartService.cs.mainDim.top(Infinity);
      chartService.cs.dimensions = chartService.cs.numDim;
      chartService.cs.maxdim = chartService.cs.maxDim;
      chartService.cs.cohortLabels = chartService.cs.labels;
    };

    return chartService;

}]);
