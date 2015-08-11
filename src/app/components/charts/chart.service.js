'use strict';
/* jshint undef: false */

angular.module('transmartBaseUi').factory('ChartService',
  ['Restangular', '$q', '$rootScope', '$timeout', 'AlertService',
  function (Restangular, $q, $rootScope, $timeout, AlertService) {

    var chartService = {};

    var _filterEvent = function () {};

    chartService.registerFilterEvent = function (func) {
      _filterEvent = func;
    };

    chartService.triggerFilterEvent = function () {
      _filterEvent();
    };

  /**
   * Create dc.js bar chart
   * @param cDimension
   * @param cGroup
   * @param el
   * @private
   */
  var _barChart = function (cDimension, cGroup, el, opt) {
    opt = opt || {};
    var _barChart = dc.barChart(el);

    _barChart
        .width(opt.width || 270)
        .height(opt.height || 210)
        .margins({top: 5, right: 5, bottom: opt.btmMarg || 30, left: 25})
        .dimension(cDimension)
        .group(cGroup)
        .elasticY(true)
        .elasticX(true)
        .xAxisPadding('10%')
        .yAxisPadding('10%')
        .centerBar(true)
        .gap(1)
        .x(d3.scale.linear())
        .renderHorizontalGridLines(true);

    if(opt.float){
      _barChart
        .centerBar(false)
        .xUnits(dc.units.fp.precision(Math.pow(0.1, opt.precision)));
    } else {
      _barChart.xUnits();
    }
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
  };

  /**
   * Create dc.js box plot
   */
  var _boxPlot = function(cDimension, cGroup, el, opt) {
    opt = opt || {};
    var _bp = dc.boxPlot(el);

    _bp
      .dimension(cDimension)
      .group(cGroup)
      .elasticX(true)
      .yAxisLabel(opt.yLab ? opt.yLab : '')
      .xAxisLabel(opt.xLab ? opt.xLab : '');

    if(opt.min !== undefined && opt.max !== undefined){
      _bp.y(d3.scale.linear().domain([opt.min-0.20*opt.max, opt.max*1.20]));
    }else{
      _bp.elasticY(true);
    }

    return _bp;
  };

  /**
   * Create dc.js pie chart
   * @param cDimension
   * @param cGroup
   * @param el
   * @returns {*}
   * @private
   */
  var _pieChart = function (cDimension, cGroup, el, opt) {
    opt = opt || {};
    var _pChart = dc.pieChart(el);

    _pChart
        .width(opt.size || 200)
        .height(opt.size || 200)
        .innerRadius(0)
        .dimension(cDimension)
        .group(cGroup)
        .renderLabel(false)
        .colors(d3.scale.category20c());

    if(!opt.nolegend){
        _pChart.legend(dc.legend());
    }

    return _pChart;
  };

  var _scatterPlot = function (cDimension, cGroup, el, opt) {
    var _chart = dc.scatterPlot(el);

    //Min and max for the x dimension
    if(opt.min !== undefined && opt.max !== undefined){
      _chart.x(d3.scale.linear().domain(
        [opt.min-opt.max*0.1, opt.max+opt.max*0.05]
      ));
    }else{
      _chart.x(d3.scale.linear());
    }

    _chart
      .yAxisPadding('15%')
      .dimension(cDimension)
      .margins({top: 5, right: 5, bottom: 30, left: 30})
      .yAxisLabel(opt.yLab || '')
      .xAxisLabel(opt.xLab || '')
      .group(cGroup);

    return _chart;
  };

  var _heatMap = function (cDimension, cGroup, el, opt)  {
    var _chart = dc.heatMap(el);

    _chart
      .dimension(cDimension)
      .group(cGroup)
      .keyAccessor(function(d) {
        return d.key[0] ? d.key[0].slice(0,3)+'..' : undefined; })
      .valueAccessor(function(d) {
        return d.key[1] ? d.key[1].slice(0,3)+'..' : undefined; })
      .colorAccessor(function(d) { return d.value; })
      .margins({top: 5, right: 5, bottom: 40, left: 50})
      .title(function(d) {
        return opt.xLab + ':   ' + d.key[0] + '\n' +
                opt.yLab + ':  ' + d.key[1] + '\n' +
                'Count: ' + ( d.value) + ' ';
      })
      .colors(['#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8',
        '#253494','#081d58'])
      .calculateColorDomain();

    return _chart;
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
        groups: {},
      };

      magicConcepts.forEach(function(concept){
        ss.dims[concept] = ss.cross.dimension(function(d){
          return d[concept];});
        ss.groups[concept] = ss.dims[concept].group();

        if (typeof sub[0][concept] === 'string' ||
            typeof sub[0][concept] === 'object') {
          ss.charts.push(_pieChart(ss.dims[concept], ss.groups[concept],
            '#summary-chart-' + concept, {size: 75, nolegend: true}));
        } else if (typeof sub[0][concept] === 'number') {
          var max = ss.dims[concept].top(1)[0][concept];
          var min = ss.dims[concept].bottom(1)[0][concept];
          ss.charts.push(_barChart(ss.dims[concept], ss.groups[concept], '#summary-chart-' + concept, {
            nodeTitle: '',
            min: min-5,
            max: max+5,
            width: 600,
            height: 100,
            btmMarg: 5
          }));
        }
      });
      chartService.renderAll(ss.charts);
      _deferred.resolve();
    }, function (err) {
      _deferred.reject('Cannot get data from the end-point.' + err);
    });
    return _deferred.promise;
  };

  var _saveFilters = function(){
    cs.charts.forEach(function(chart){
      chart.savedFilters = chart.filters();
    });
  };

  var _reapplyFilters = function(){
    cs.charts.forEach(function(chart){
      chart.savedFilters.forEach(function(filter){
        chart.filter(filter);
      });
    });
    dc.redrawAll();
  };

  var _groupCharts = function (chart1, chart2) {
    var _combinationLabel = {
      ids: cs.chartId++,
      label: [chart1.tsLabel, chart2.tsLabel],
      name: chart1.tsLabel.name + ' - ' + chart2.tsLabel.name,
      resolved: false,
      //TODO: manage multiple studies
      study: chart1.tsLabel.study,
      type: 'combination'
    };
    cs.subjects.forEach(function(sub){
      if(sub.labels[chart1.tsLabel.ids] || sub.labels[chart2.tsLabel.ids]){
        sub.labels[_combinationLabel.ids] = [sub.labels[chart1.tsLabel.ids], sub.labels[chart2.tsLabel.ids]];
      }
    });
    cs.labels.push(_combinationLabel);
    $rootScope.$broadcast('prepareChartContainers',cs.labels);
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
      groups: {},
      labels: []
    };

    _groupingChart = {};

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
      label.type = label.type === 'float' ? label.type : _getType(obs.value);
    }
    if(label.type === 'float'){
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
    _.each(cs.dims, function(dim){dim.filterAll();});
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
   * Fetch the data for the selected node
   * @param node
   * @returns {*}
   */
  chartService.addNodeToActiveCohortSelection = function (node){
    console.log(node);
    var _deferred = $q.defer();
    //Get all observations under the selected concept
    node.restObj.one('observations').get().then(function (observations){
      observations = observations._embedded.observations;
      observations.forEach(function (obs){
        if(obs.value !== null) {
          // Add the concept to the list of chart labels
          var _id = _addLabel(obs, node);
          // Check if the subject of the observation is already present
          var found = _.findWhere(cs.subjects, {id: obs._embedded.subject.id});

          if (found){
            found.labels[_id] = obs.value;
          } else {
            obs._embedded.subject.labels = {};
            obs._embedded.subject.labels[_id] = obs.value;
            cs.subjects.push(obs._embedded.subject);
          }
        }
      });
      // Add all the subjects to a crossfilter instance
      _saveFilters();
      _populateCohortCrossfilter();
      // Notify the applicable controller that the chart directive instances
      // can be created
      $rootScope.$broadcast('prepareChartContainers', cs.labels);
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
    //Remove dimension and group associated with the label
    cs.dims[label.ids].dispose();
    cs.numDim--;
    cs.groups[label.ids].dispose();

      // Remove label from subjects and remove subjects no longer associated
      // with any label
      for (var i = 0; i < cs.subjects.length; i++) {
        delete cs.subjects[i].labels[label.ids];
        if (_.size(cs.subjects[i].labels) === 0){
          cs.subjects.splice(i--, 1);
        }
      }
      //Update crossfilter instance
      _saveFilters();
      _populateCohortCrossfilter();

      //Remove the chart
      var _i = _.findIndex(cs.charts, function(c){return c.id === label.ids;});
      if(_i >= 0){cs.charts.splice(_i, 1);}
      //Finally remove label
      cs.labels = _.reject(cs.labels, function(el) {
        return el.ids === label.ids;
      });
      //Update charts
      $rootScope.$broadcast('prepareChartContainers',cs.labels);
      _reapplyFilters();
  };

  var _createMultidimensionalChart = function (label, el) {
    var _chart;

    // Check if label0 or label1 has categorical values
    if(label.label[0].type === 'string' || label.label[1].type === 'string'){
      // Check if one of them is not categorical
      if(label.label[0].type !== 'string' || label.label[1].type !== 'string'){
        // Always categorical on X axis
        var _valueX = label.label[0].type === 'string' ? 0 : 1;
        var _valueY = _valueX === 0 ? 1 : 0;

        cs.dims[label.ids] = cs.cross.dimension(function (d) {
          return d.labels[label.ids] ? d.labels[label.ids][_valueX] : undefined;
        });
        cs.groups[label.ids] = cs.dims[label.ids].group().reduce(
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

        var _max = cs.dims[label.label[_valueY].ids].top(1)[0].labels[label.label[_valueY].ids];
        var _min = cs.dims[label.label[_valueY].ids].bottom(1)[0].labels[label.label[_valueY].ids];

        _chart = _boxPlot(cs.dims[label.ids], cs.groups[label.ids], el, {
          xLab: label.label[_valueX].name,
          yLab: label.label[_valueY].name,
          min: _min,
          max: _max
        });
        _chart.type = 'BOXPLOT';

      } else {
        // Both labels are categorical
        cs.dims[label.ids] = cs.cross.dimension(function (d) {
          return [d.labels[label.ids] ? d.labels[label.ids][0]: undefined,
                  d.labels[label.ids] ? d.labels[label.ids][1]: undefined];
        });
        cs.groups[label.ids] = cs.dims[label.ids].group();

        _chart = _heatMap(cs.dims[label.ids], cs.groups[label.ids], el, {
          xLab: label.label[0].name,
          yLab: label.label[1].name
        });

        _chart.type = 'HEATMAP';

      }
    } else {
      // Both labels are numerical, create a scatter plot
      cs.dims[label.ids] = cs.cross.dimension(function (d) {
        return [d.labels[label.ids] ? d.labels[label.ids][0]: undefined,
                d.labels[label.ids] ? d.labels[label.ids][1]: undefined];
      });
      cs.groups[label.ids] = cs.dims[label.ids].group();

      var _max = cs.dims[label.label[0].ids].top(1)[0].labels[label.label[0].ids];
      var _min = cs.dims[label.label[0].ids].bottom(1)[0].labels[label.label[0].ids];

      _chart = _scatterPlot(cs.dims[label.ids], cs.groups[label.ids], el, {
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
    var _defaultDim = function () {
      cs.dims[label.ids] = cs.cross.dimension(function (d) {
        return d.labels[label.ids] === undefined ? 'UnDef' : d.labels[label.ids];
      });
      cs.groups[label.ids] = cs.dims[label.ids].group();
    };

    if (!label.resolved) {
      var _chart;

      if(label.type === 'combination'){
        _chart = _createMultidimensionalChart(label, el);
      } else {

        // Create a number display if highdim
        if (label.type === 'highdim') {
          _defaultDim();
          _chart = _numDisplay(cs.dims[label.ids], cs.groups[label.ids], el);
          _chart.type = 'NUMBER';

        // Create a PIECHART if categorical
        } else if (label.type === 'string' || label.type === 'object') {
          _defaultDim();
          _chart = _pieChart(cs.dims[label.ids], cs.groups[label.ids], el);
          _chart.type = 'PIECHART';

        // Create a BARCHART if numerical
        } else if (label.type === 'number') {
          _defaultDim();
          _chart = _barChart(cs.dims[label.ids], cs.groups[label.ids], el,
            {nodeTitle: label.name});
          _chart.type = 'BARCHART';

        // Create a BARCHART WITH BINS if floating point values
        } else if (label.type === 'float'){
          cs.dims[label.ids] = cs.cross.dimension(function (d) {
            return d.labels[label.ids] === undefined ? 'UnDef' : d.labels[label.ids].toFixed(label.precision === 0 ? 0 : label.precision);
          });
          cs.groups[label.ids] = cs.dims[label.ids].group();
          _chart = _barChart(cs.dims[label.ids], cs.groups[label.ids],
            el, {nodeTitle: label.name, float: true, precision: label.precision});
          _chart.type = 'BARCHART';

        }
      }
      label.resolved = true;
      _chart.id = label.ids;
      _chart.tsLabel = label;
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
      SP_DOT_SIZE: 4, // Pixels per width / heigth
      BP_PIXELS_PER_GROUP: 110,
      HM_LEFT_MARGIN: width/6,
      HM_Y_LABELS_PIXELS: 10
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
    }
  };

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
     * Return active filters
     */
    chartService.getCohortFilters = function () {
      var _filters = [];
      if (cs.charts) {
        _.each(cs.charts, function (c, _index) {
          console.log(cs.labels[_index]);
          console.log(c.filter());
          _filters.push(c.filter());
        });
      }

      return _filters;
    };

  /**
   * ChartService
   */
  return chartService;

}]);
