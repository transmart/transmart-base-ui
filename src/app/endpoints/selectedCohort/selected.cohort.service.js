'use strict';

/**
 * Resource factory
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortSelectionService
 */
angular.module('tmEndpoints')
    .factory('CohortSelectionService', function () {

        var service = {};
        var cohorts = []; // resultInstanceIDs only, i.e. array of strings

        service.getSelection = function () {
            return [28863];//cohorts;
        };

        service.setSelection = function (cohortsArray) {
            cohorts = cohortsArray;
        };

        return service;
    });
