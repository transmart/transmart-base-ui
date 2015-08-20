'use strict';

angular.module('transmartBaseUi').factory('CohortSelectionService', [ '$window', function ($window) {

  var service = {
    nodes : []
  };

  /**
   * Convert nodes to json
   * @param nodes
   * @returns {Array}
   * @private
   */
  var _convertNodesToJSON = function (nodes) {

    var nodesJSON = [];

    //console.log('nodes', nodes);

    _.each(nodes, function (node) {
      var _node = {
        title : node.title,
        type : node.type,
        _links : node.restObj._links,
        loaded : node.loaded,
        study : {
          id : node.study.id,
          type : node.study.type,
          _links : node.study._links,
          endpoint : {
            url: node.study.endpoint.url,
            title: node.study.endpoint.title
          }
        }
      };

      nodesJSON.push(_node);
    }); //end each

    return nodesJSON;
  };

  /**
   * Clear all nodes
   */
  service.clearAll = function () {
    this.nodes = [];
  };

  /**
   * Export json to file
   */
  service.exportToFile = function (endpoints, filters) {

    var _obj = {
      endpoints : [],
      nodes : _convertNodesToJSON(service.nodes),
      filters : filters
    };

    _.each(endpoints, function (e) {
      _obj.endpoints.push( {
        title : e.title,
        url : e.url
      });
    });

    var _d = angular.toJson(_obj, true);
    $window.open("data:text/csv;charset=utf-8," + encodeURIComponent(_d));
  };


  return service;
}]);
