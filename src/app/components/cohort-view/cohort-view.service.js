'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortViewService
 */
angular.module('transmartBaseUi').factory('CohortViewService', ['$timeout', 'EndpointService', '$q',
    function ($timeout, EndpointService, $q) {

        var service = {
            options: {
                enableGridMenu: false,
                enableSelectAll: false,
                exporterMenuPdf: false,
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                columnDefs: [{field: 'name', name: 'Name', width: '**'},
                    {field: 'id', name: 'ID', width: '*'},
                    {field: 'setSize', name: 'Set size', width: '*'},
                    {field: 'username', name: 'User', width: '*'}
                ], // columns is stored here
                data: 'cohorts',
                enableFiltering: true
            }
        };

        /** Retrieves the list of cohorts.
         *
         * @returns {*} A promise that resolves when the list has been retrieved or is
         *              rejected in case of an error.
         * @memberof CohortViewService
         */
        service.getCohorts = function () {
            var deferred = $q.defer();

            // TODO: allow cohorts to be retrieved from other sources than the master endpoint?
            var endpoint = EndpointService.getMasterEndpoint();
            endpoint.restangular.all('patient_sets').getList().then(function (cohorts) {
                deferred.resolve(cohorts);
            })
                .catch(function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        };

        /** Removes the specified cohort.
         * @param cohort The cohort to be deleted.
         * @returns {*} A promise that is resolved on successful completion of deletion,
         *              or rejected in case of an error.
         * @memberof CohortViewService
         */
        service.removeCohort = function (cohort) {
            return cohort.remove();
        };

        return service;
    }]);
