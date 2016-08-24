'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortViewService
 */
angular.module('transmartBaseUi').factory('CohortViewService', ['$timeout', 'EndpointService', '$q',
  function ($timeout, EndpointService, $q) {

    var service = {
        cohortList: [],
        cohortsResolved: false,

        options: {
            enableGridMenu: false,
            enableSelectAll: false,
            exporterMenuPdf: false,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 25,
            columnDefs: [ {field: 'name', name: 'Name', width: '**'},
                {field: 'id', name: 'ID', width: '*'},
                {field: 'setSize', name: 'Set size', width: '*'},
                {field: 'username', name: 'User', width: '*'}
            ], // columns is stored here
            data: 'cohorts',
            enableFiltering: true,
            onRegisterApi: function (gridApi) {
                service.options.gridApi = gridApi;
            },
        }
    };

    /**
     * Empty study list
     * @memberof CohortService
     */
    service.emptyAll = function () {
        service.cohortList = [];
    };

    service.getCohorts = function() {
        var deferred = $q.defer();

        var endpoint = EndpointService.getMasterEndpoint();
        endpoint.restangular.all('patient_sets').getList().then(function(cohorts) {
                service.cohortList = cohorts;
                deferred.resolve(service.cohortList);
            })
            .catch(function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    };

    service.removeCohort = function(cohort) {
        return cohort.remove();
    };

    return service;
}]);
