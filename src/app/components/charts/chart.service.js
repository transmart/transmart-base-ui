'use strict';

angular.module('transmartBaseUi')

  .factory('ChartService',['Restangular', function (Restangular) {

    var chartService = {}, charts = [];

    /**
     * Create dc.js bar chart
     * @param cDimension
     * @param cGroup
     * @param el
     * @private
     */
    var _barChart = function (cDimension, cGroup, el, min, max, nodeTitle) {
      var _barChart = dc.barChart(el);
      _barChart
        .width(270)
        .height(200)
        .margins({top: 5, right: 5, bottom: 30, left: 25})
        .dimension(cDimension)
        .group(cGroup)
        .elasticY(true)
        .centerBar(true)
        .gap(0)
        .x(d3.scale.linear().domain([min, max]))
        .renderHorizontalGridLines(true)
        .filterPrinter(function (filters) {
          var filter = filters[0], s = '';
          // TODO number format
          //s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
          return s;
        })
      ;
      _barChart.xAxis().tickFormat(
        function (v) { return v; });
      _barChart.yAxis().ticks(5);
      _barChart.xAxisLabel(nodeTitle);
      _barChart.yAxisLabel('# subjects');

      return _barChart;
    };

    /**
     * Create dc.js pie chart
     * @param cDimension
     * @param cGroup
     * @param el
     * @returns {*}
     * @private
     */
    var _pieChart = function (cDimension, cGroup, el) {
      var tChart = dc.pieChart(el);

      tChart
        .width(270)
        .height(200)
        .innerRadius(0)
        .dimension(cDimension)
        .group(cGroup)
        .renderLabel(false)
        .legend(dc.legend());

     return tChart;
    };

    /**
     * Group observations based on its labels
     * @param d
     * @returns {Array}
     * @private
     */
    var _createGroupObservationsBasedOnLabel = function (d) {
      var _d = [];

      var _getDataType = function (val) {
        return typeof val;
      };

      /**
       * To find element in array based on object's key:value
       * @param arr
       * @param propName
       * @param propValue
       * @returns {*}
       * @private
       */
      var _findElement = function (arr, propName, propValue) {
        for (var i=0; i < arr.length; i++)
          if (arr[i][propName] === propValue)
            return arr[i];
        // will return undefined if not found; you could return a default instead
      };

      /**
       * Get the last token when requested model is a string path
       * @param what
       * @returns {*}
       * @private
       */
      var _getLastToken = function (what) {
        var _t = what.split('\\').slice(1);
        return what.indexOf('\\') === -1 ? what : _t[_t.length-2];
      };

      d.forEach(function (o, idx) {
        var _x = _findElement(_d, 'label', o.label);

        if (typeof _x === 'undefined') {
          _d.push(
            {
              id: idx,
              label: o.label,
              title: _getLastToken(o.label),
              type: _getDataType(o.value),
              observations: [{
                value : o.value
              }]
            });
        } else {
          _x.observations.push({value : o.value});
        }
      });

      return _d;
    };

    var _groupSubjectsBasedOnStudy = function (d) {
      var returnVal = {
        'obj': d._embedded.subjects,
        'title': '',
        'panel': {
          isDisplayed: false
        }
      };

      return returnVal;
    };

    chartService.myCharts = function () {
      return charts;
    };

    chartService.getObservations = function (node) {
      var _observationsList = [],
        _path = node.link.slice(1);

      var promise = new Promise( function (resolve, reject) {
        Restangular.all(_path + '/observations').getList()
          .then(function (d) {
            // create categorical or numerical dimension based on observation data
            _observationsList = _createGroupObservationsBasedOnLabel(d);
            resolve(_observationsList);
          }, function (err) {
            reject('Cannot get data from the end-point.');
          });
      });

      return promise;
    };

    chartService.getSubjects = function (node) {
      var selectedStudy,
        studyLink = node._links.self.href.slice(1),
        studyId = node._embedded.ontologyTerm.name;

      var promise = new Promise( function (resolve, reject) {
        Restangular.one(studyLink + '/subjects').get()
          .then(function (d) {
            selectedStudy = _groupSubjectsBasedOnStudy(d);
            selectedStudy.title = studyId;
            resolve(selectedStudy);
          }, function (err) {
            reject('Cannot get subjects from the end-point.');
          });
      }); //end Promise

      return promise;
    };

    chartService.generateSubjectCharts = function (subjects) {
      var _charts = [];

      var ndx = crossfilter(subjects),

        sexDimension = ndx.dimension(function(d) {return d.sex;}),
        sexGroup = sexDimension.group(),

        raceDimension = ndx.dimension(function(d) {return d.race;}),
        raceGroup = raceDimension.group(),

        ageDimension = ndx.dimension(function(d) {return d.age;}),
        ageGroup = ageDimension.group(),

        maritalDimension = ndx.dimension(function(d) {return d.maritalStatus;}),
        maritalGroup = maritalDimension.group();

      var _max = Math.max.apply(Math, subjects.map(function(o){return o.age;})),
        _min = Math.min.apply(Math, subjects.map(function(o){return o.age;}));

      _charts.push(_pieChart(sexDimension, sexGroup, '#gender-pie-chart'));
      _charts.push(_pieChart(raceDimension, raceGroup, '#race-pie-chart'));
      _charts.push(_pieChart(maritalDimension, maritalGroup, '#marital-pie-chart'));
      _charts.push(_barChart(ageDimension, ageGroup, '#numeric-age-chart', _min, _max, "Age"));

      // now render all charts ..
      _charts.forEach(function (c) {
        c.render(); // TODO: still contains bug, somehow it can't render on the first invoke
      });

    };

    chartService.generateCharts = function (nodes) {
      var _charts = [];

      nodes.forEach (function(node, idx){
        var ndx = crossfilter(node.observations),
          tDimension = ndx.dimension(function(d) {return d.value;}),
          tGroup = tDimension.group();

        if (node.type === 'string') {
          _charts.push(_pieChart(tDimension, tGroup, '#chart_' + idx));
        } else if (node.type === 'number') {
          var _max = Math.max.apply(Math,node.observations.map(function(o){return o.value;})),
              _min = Math.min.apply(Math,node.observations.map(function(o){return o.value;}));
          _charts.push(_barChart(tDimension, tGroup, '#chart_' + idx, _min, _max, node.title));
        }
      });

      // now render all charts ..
      _charts.forEach(function (c) {
        c.render(); // TODO: still contains bug, somehow it can't render on the first invoke
      });
    };

    /**
     * Display summary statistics of a selected node
     * @param node
     */
    chartService.displayStats = function (node) {

      var _observationsList = [], _charts = [],
        _path = node.link.slice(1);

      var promise = new Promise( function (resolve, reject) {
        Restangular.all(_path + '/observations').getList()
          .then(function (d) {
            // create categorical or numerical dimension based on observation data
            _observationsList = _createGroupObservationsBasedOnLabel(d);

            _observationsList.forEach (function(observation, idx){
              //console.log(idx);
              //console.log(observation);
              var ndx = crossfilter(observation),
                tDimension = ndx.dimension(function(_d) {return _d.value;}),
                tGroup = tDimension.group();
              _charts.push(_pieChart(tDimension, tGroup, '#chart_' + idx));
            });
            charts = _charts;
            resolve(_charts);
          }, function (err) {
            //console.log('Error', err);
            reject(err);
          });
      });

      return promise;
    };

    return chartService;
  }]);
