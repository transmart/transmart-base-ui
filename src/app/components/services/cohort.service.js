'use strict';

angular.module('transmartBaseUi').factory('CohortService', [ function(){

  var cohortService = {
    cohortValue : {
      selected: 0,
      total: 0,
      subjects: []
    },
    displayedCollections : {},
    isCohortUpdating : false
  };

  service.setCohortVal = function (valObj) {
    cohortService.cohortValue = valObj;
  };

  service.getCohortVal = function () {
    return cohortService.cohortValue;
  };

  return service;
}]);
