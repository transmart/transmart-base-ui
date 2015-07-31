'use strict';

angular.module('transmartBaseUi').factory('CohortSelectionService', [ function () {

  var service = {
    nodes : []
  };

  service.clearAll = function () {
    service.nodes = [];
  };

  return service;

}]);
