'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortViewService
 */
angular.module('transmartBaseUi').factory('CohortViewService',
    ['$timeout', 'EndpointService', '$q', 'QueryParserService', 'uiGridConstants',
    function ($timeout, EndpointService, $q, QueryParserService, uiGridConstants) {

        var service = {
            options: {
                enableGridMenu: false,
                enableSelectAll: false,
                exporterMenuPdf: false,
                paginationPageSizes: [25, 50, 75],
                paginationPageSize: 25,
                columnDefs: [{field: 'name', name: 'Name', width: '**'},
                    {field: 'id', name: 'ID', width: '*', sort: {
                        direction: uiGridConstants.DESC,
                        priority: 0
                    }},
                    {field: 'setSize', name: 'Set size', width: '*'},
                    {field: 'username', name: 'User', width: '*'},
                    {field: 'description', name: 'Description', width: '**',
                        cellTemplate: 'app/components/cohort-view/cohort-view-tooltip.tpl.html'}
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
            // TODO: allow cohorts to be retrieved from other sources than the master endpoint?
            var endpoint = EndpointService.getMasterEndpoint();
            return endpoint.restangular.all('patient_sets').getList().then(function (cohorts) {
                // Annotate the cohorts with the descriptions
                cohorts.forEach(function(cohort) {
                    cohort.description = QueryParserService.parseQueryXMLToDescription(cohort.queryXML);
                });
                return cohorts;
            });
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
