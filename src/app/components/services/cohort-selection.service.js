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

    _.each(nodes, function (node) {
      var _node = {
        key: node.restObj.key,
        fullpath: node.restObj.fullName,
        requestedUrl: node.restObj.getRequestedUrl(),
        restangularUrl: node.restObj.getRestangularUrl(),
        endpoint: {
          url: node.study.endpoint.url,
          title: node.study.endpoint.title
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
  service.exportToJSONFile = function () {
    var _d;
    if (this.nodes.length > 0) { // flush to file only when there's selected cohort
      _d = angular.toJson(_convertNodesToJSON(this.nodes), true);
      $window.open("data:text/csv;charset=utf-8," + encodeURIComponent(_d));
    }
  };

  return service;
}]);
