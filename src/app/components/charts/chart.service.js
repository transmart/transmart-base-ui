'use strict';

angular.module('transmartBaseUi').factory('ChartService',
  ['Restangular', '$q', '$rootScope', '$timeout', 'AlertService',
  function (Restangular, $q, $rootScope, $timeout, AlertService) {

  var chartService = {};

  var _filterEvent = function () {};
  chartService.registerFilterEvent = function (func) {_filterEvent = func;}
  chartService.triggerFilterEvent = function (){_filterEvent();};

  /**
   * Create dc.js bar chart
   * @param cDimension
   * @param cGroup
   * @param el
   * @private
   */
  var _barChart = function (cDimension, cGroup, el, min, max, nodeTitle, width,
    height, btmMarg) {
    //Determine if the number is floating point and it's precision
    var precision = (min + '').split('.');

    width = width || 270;
    height = height || 210;
    btmMarg = btmMarg || 30;

    var _barChart = dc.barChart(el);
    _barChart
        .width(width)
        .height(height)
        .margins({top: 5, right: 5, bottom: btmMarg, left: 25})
        .dimension(cDimension)
        .group(cGroup)
        .elasticY(true)
        .elasticX(true)
        .xAxisPadding('10%')
        .yAxisPadding('10%')
        .centerBar(true)
        .gap(1)
        .x(d3.scale.linear().domain([min-0.05*min, max+0.05*max]))
        .renderHorizontalGridLines(true);
    // Correction for unusual chart behavior with floating point
    // Numbers.
    // Check the precision of floating point numbers and adjust
    // the scale of x units accordingly
    if(precision[1]){
      _barChart.xUnits(
        dc.units.fp.precision(Math.pow(0.01, precision[1].length)));
    } else {
      _barChart.xUnits();
    }
    _barChart.xAxis().ticks(5);
    _barChart.yAxis().ticks(5);
    _barChart.yAxisLabel('# subjects');

    return _barChart;
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
  }

  /**
   * Create dc.js box plot
   */
  var _boxPlot = function(cDimension, cGroup, el, min, max) {
    var _bp = dc.boxPlot(el);
    _bp
      .margins({top: 5, right: 5, bottom: 5, left: 25})
      .dimension(cDimension)
      .group(cGroup)
      .y(d3.scale.linear().domain([min-(0.1*(max-min)), max+(0.1*(max-min))]))
      .xAxis().tickValues([]);
    return _bp;
  }

  /**
   * Create dc.js pie chart
   * @param cDimension
   * @param cGroup
   * @param el
   * @returns {*}
   * @private
   */
  var _pieChart = function (cDimension, cGroup, el, size, nolegend) {
    var tChart = dc.pieChart(el);

    nolegend = nolegend || false;
    size = size || 200;

    tChart
        .width(size)
        .height(size)
        .innerRadius(0)
        .dimension(cDimension)
        .group(cGroup)
        .renderLabel(false)
        .colors(d3.scale.category20c());
    if(!nolegend){
        tChart.legend(dc.legend());
    }
    return tChart;
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
  *
  * @param charts
  */
  chartService.renderAll = function (charts) {
    if(!charts){
      charts = cs.charts;
    }
    angular.forEach(charts, function (chart) {
      if(!chart.rendered){
        chart.render();
        chart.rendered = true;
      }
    });
  };

  /****************************************************************************
  * Summary statistics chart service
  */
  var ss = {};

  chartService.displaySummaryStatistics = function(study, magicConcepts){
    var _deferred = $q.defer();

    study.one('subjects').get().then(function (d) {
      var sub = d._embedded.subjects;

      ss = {
        charts: [],
        cross: crossfilter(sub),
        dims: {},
        grps: {},
      };

      magicConcepts.forEach(function(concept){
        ss.dims[concept] = ss.cross.dimension(function(d){
          return d[concept];})
        ss.grps[concept] = ss.dims[concept].group();

        if (typeof sub[0][concept] === 'string' ||
            typeof sub[0][concept] === 'object') {
          ss.charts.push(_pieChart(ss.dims[concept], ss.grps[concept],
            '#summary-chart-' + concept, 75, true));
        } else if (typeof sub[0][concept] === 'number') {
          var max = ss.dims[concept].top(1)[0][concept];
          var min = ss.dims[concept].bottom(1)[0][concept];
          ss.charts.push(_barChart(ss.dims[concept], ss.grps[concept],
            '#summary-chart-' + concept, min-5, max+5, '', 600, 100, 5));
        }
      });
      chartService.renderAll(ss.charts);
      _deferred.resolve();
    }, function (err) {
      _deferred.reject('Cannot get data from the end-point.' + err);
    });
    return _deferred.promise;
  };

  /****************************************************************************
   * Cohort chart service
   */
  var cs = {};

  /**
   * Reset the cohort chart service to initial state
   */
  chartService.reset = function () {
    cs = {
      subjects: [],
      chartId: 0,
      charts: [],
      cross: crossfilter(),
      dims: {},
      numDim: 0,
      maxDim: 20,
      grps: {},
      labels: []
    };
    // Main dimension used to get selection values
    cs.mainDim = cs.cross.dimension(function (d) {return d.labels;});

    $rootScope.$broadcast('prepareChartContainers',cs.labels);
  };
  chartService.reset();

  var _getType = function (value) {
    var _type = typeof value;
    if(_type === 'string'){
      if(value === 'E' || value === 'MRNA'){
        _type = 'highdim';
      }
    } else if (_type === 'number'){
      if((value % 1) != 0) {
        _type = 'float';
      }
    }
    return _type;
  }

  /**
   * Add new label to list and check data type
   * @param label
   * @param value
   * @private
   */
  var _addLabel = function (obs, node) {
    // Check if label has already been added
    var label = _.findWhere(cs.labels, {label: obs.label});
    if(!label){
      //Check that the maximum number of dimensions has not been reached
      if(cs.numDim < cs.maxDim){
        cs.numDim++;
        // Create the new label object
        label = {
          label: obs.label,
          type: _getType(obs.value),
          name: _getLastToken(obs.label),
          ids: cs.chartId++,
          study: node.study,
          resolved: false
        };
        cs.labels.push(label);
      } else {
        AlertService.add('danger', 'Max number of dimensions reached !', 2000);
      }
    } else {
      label.type = _getType(obs.value);
    }
  };

  /**
   * Remove all the filters applied to the label dimensions
   * TODO: Add the possibility to reapply removed filters
   * @private
   */
  var _removeAllLabelFilters = function () {
    _.each(cs.dims, function(dim){dim.filterAll();});
    dc.filterAll();
    dc.redrawAll();
  };

  /**
   * Fetch the data for the selected node
   * @param node
   * @returns {*}
   */
  chartService.addNodeToActiveCohortSelection = function (node){
    var _deferred = $q.defer();
    //Get all observations under the selected concept
    node.restObj.one('observations').get().then(function (observations){
      observations = observations._embedded.observations;
      observations.forEach(function (obs){
        if(obs.value !== null) {
          // Add the concept to the list of chart labels
          _addLabel(obs, node);
          // Check if the subject of the observation is already present
          var found = _.findWhere(cs.subjects, {id: obs._embedded.subject.id});

          if (found){
            found.labels[obs.label] = obs.value;
          } else {
            obs._embedded.subject.labels = {};
            obs._embedded.subject.labels[obs.label] = obs.value;
            cs.subjects.push(obs._embedded.subject);
          }
        }
      });
      // Add all the subjects to a crossfilter instance
      _populateCohortCrossfilter();
      // Notify the applicable controller that the chart directive instances
      // can be created
      $rootScope.$broadcast('prepareChartContainers', cs.labels);

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
      // Remove label from subjects and remove subjects no longer associated
      // with any label
      console.log(cs.subjects)
      for (var i = 0; i < cs.subjects.length; i++) {
        delete cs.subjects[i].labels[label.label];
        if (_.size(cs.subjects[i].labels) === 0){
          cs.subjects.splice(i--, 1);
        }
      }
      //Update crossfilter instance
      _populateCohortCrossfilter;
      //Remove dimension and group associated with the label
      cs.dims[label.label].dispose();
      cs.numDim--;
      cs.grps[label.label].dispose();
      //Finally remove label
      cs.labels = _.reject(cs.labels, function(el) {
        return el.label === label.label;
      });
      //Update charts
      $rootScope.$broadcast('prepareChartContainers',cs.labels);
      dc.filterAll();
      dc.redrawAll();

  };

  /**
   * Create the Crossfilter instance from the subject data
   * @private
   */
  var _populateCohortCrossfilter = function () {
    _removeAllLabelFilters();
    cs.cross.remove();
    cs.cross.add(cs.subjects);
  };

  /**
   * Create the charts for each selected label
   * TODO: Leave the existing charts in place, and only add the new ones
   * TODO: Enable removing specific charts
   * @private
   */
  chartService.createCohortChart = function (label, el) {
    var _defaultDim = function () {
      cs.dims[label.label] = cs.cross.dimension(function (d) {
        return d.labels[label.label] === undefined
          ? 'UnDef' : d.labels[label.label];
      });
      cs.grps[label.label] = cs.dims[label.label].group();
    };

    if (!label.resolved) {
      var _chart;
      // Create a number display if highdim
      if (label.type === 'highdim') {
        _defaultDim();
        var _chart = _numDisplay(cs.dims[label.label], cs.grps[label.label], el);
        _chart.type = 'NUMBER';
      // Create a PIECHART if categorical
      } else if (label.type === 'string' || label.type === 'object') {
        _defaultDim();
        var _chart = _pieChart(cs.dims[label.label], cs.grps[label.label], el);
        _chart.type = 'PIECHART';
      // Create a BARCHART if numerical
      } else if (label.type === 'number') {
        _defaultDim();
        var _max = cs.dims[label.label].top(1)[0].labels[label.label];
        var _min = cs.dims[label.label].bottom(1)[0].labels[label.label];
        var _chart = _barChart(cs.dims[label.label], cs.grps[label.label],
          el, _min, _max, label.name);
        _chart.type = 'BARCHART';
      // Create a BOXPLOT if floating point values
      } else if (label.type === 'float'){
        cs.dims[label.label] = cs.cross.dimension(function (d) {
          return label.name;
        });
        cs.grps[label.label] = cs.dims[label.label].group().reduce(
          function(p,v) {
            p.push(v.labels[label.label]);
            return p;
          },
          function(p,v) {
            p.splice(p.indexOf(v.labels[label.label]), 1);
            return p;
          },
          function() {
            return [];
          }
        );
        var _it = cs.grps[label.label].top(1)[0].value;
        var _max = _.max(_it);
        var _min = _.min(_it);
        var _chart = _boxPlot(cs.dims[label.label], cs.grps[label.label],
           el, _min, _max);
        _chart.type = 'BOXPLOT';
      }
      label.resolved = true;
      _chart.id = label.ids;
      cs.charts.push(_chart);
      return _chart;
    }
  };

  chartService.doResizeChart = function (id, height, width) {
    var _CONF = {
      RAD: 0.9, // Percentage to adjust the radius of the chart
      LEG_H: 0.05,// Percentage to adjust legend position in Y
      LEG_W: 0, // Percentage to adjust legend position in X
      LEG_S: 0.03, // Legend size percentage of chart
      LEG_B: 4, // Legend size base in px
      LEG_G: 0.02, // Legen gap in percentage of chart height
      MIN_S: (width > height ? height : width), // Smallest of width or heigth
      TICK_X: 30, // Pixels per tick in x
      TICK_Y: 30, // Pixels per tick in y
      SLICE: 20, // Pixels per slice for pie charts
      BOX_W: 0.2, //Box plot width in percentage of chart width
      BOX_P: 0.25, // Box plot padding
      BOX_O: 0.4  // Box plot outer padding
    };

    var _chart = _.findWhere(cs.charts, {id: id});
    if(_chart) {

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
        _chart
          .boxPadding(_CONF.BOX_P)
          .outerPadding(_CONF.BOX_O)
          .boxWidth(width*_CONF.BOX_W);
      }

      _chart.render();
    }
  }

  /**
   * Return the values for the current selection in cohort
   * @returns {{selected: (*|{returns the sum total of matching records,
   * observes all dimension's filters}), total: *}}
   */
  chartService.getSelectionValues = function () {
      return {
          selected: cs.cross.groupAll().value(),
          total: cs.cross.size(),
          subjects: cs.mainDim.top(Infinity),
          dimensions: cs.numDim,
          maxdim: cs.maxDim
      };
  };

  chartService.getLabels = function () {
    return cs.labels;
  };

  /**
   * ChartService
   */
  return chartService;

}]);
