'use strict';

angular.module('transmartBaseUi')

  .factory('ChartService',['Restangular', function (Restangular) {

    var chartService = {};

    /**
     * Display summary statistics of a selected node
     * @param node
     */
    chartService.displayStats = function (node, study) {
      console.log('node', node);
      console.log('study', study._links.self.href);

      var _path = node.link.slice(1);
      console.log( _path);

      Restangular.all(_path + '/observations').getList()
        .then(function (d) {

          console.log(d);
        }, function () {

        });
    };

    return chartService;
  }]);
