'use strict';

angular.module('transmartBaseUi')

  .factory('ChartService',['Restangular', function (Restangular) {

    var chartService = {}, charts = [];

    chartService.myCharts = function () {
      return charts;
    };

    var _pieChart = function (cDimension, cGroup, el) {
      var tChart = dc.pieChart(el);

      //console.log(cDimension);
      //console.log(cGroup);
      //console.log(el);

      tChart
        .width(200)
        .height(200)
        .innerRadius(0)
        .dimension(cDimension)
        .group(cGroup);
      //.legend(dc.legend());


     return tChart;
    };

    var _groupObservationsBasedOnLabels = function (d) {
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
          if (arr[i][propName] == propValue)
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

        if (typeof _x == 'undefined') {
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

    chartService.getObservations = function (node) {
      var _observationsList = [],
        _path = node.link.slice(1);

      var promise = new Promise( function (resolve, reject) {
        Restangular.all(_path + '/observations').getList()
          .then(function (d) {
            // create categorical or numerical dimension based on observation data
            _observationsList = _groupObservationsBasedOnLabels(d);
            resolve(_observationsList);
          }, function (err) {
            console.log('Error', err);
            reject(err);
          });
      });

      return promise;
    };

    chartService.generateCharts = function (nodes) {
      var _charts = [];

      nodes.forEach (function(node, idx){
        var ndx = crossfilter(node.observations),
          tDimension = ndx.dimension(function(d) {return d.value;}),
          tGroup = tDimension.group();

          if (node.type === 'string') {
            _charts.push(_pieChart(tDimension, tGroup, '#chart_' + idx));
          }


      });


      _charts.forEach(function (c) {
        c.render();
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
            _observationsList = _groupObservationsBasedOnLabels(d);

            _observationsList.forEach (function(observation, idx){
              console.log(idx);
              console.log(observation);
              var ndx = crossfilter(observation),
                tDimension = ndx.dimension(function(_d) {return _d.value;}),
                tGroup = tDimension.group();
              _charts.push(_pieChart(tDimension, tGroup, '#chart_' + idx));
            });
            charts = _charts;
            resolve(_charts);
          }, function (err) {
            console.log('Error', err);
            reject(err);
          });
      });

      return promise;
    };

    return chartService;
  }]);
