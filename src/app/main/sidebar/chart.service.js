'use strict';

angular.module('transmartBaseUi')

  .factory('ChartService',['Restangular', function (Restangular) {

    var chartService = {};

    /**
     * Display summary statistics of a selected node
     * @param node
     */
    chartService.displayStats = function (node, study) {

      var _path = node.link.slice(1);

      Restangular.all(_path + '/observations').getList()
        .then(function (d) {

          console.log(d.length);


        }, function () {

        });
    };

    return chartService;
  }]);
