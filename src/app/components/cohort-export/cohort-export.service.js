'use strict'

/**
 * @Service CohortExportMocks
 * @Description Service layer exposing mocks for cohort data exports
 */
angular.module('transmartBaseUi')
    .factory('CohortExportService', [function () {
        var service = {};

        service.getConceptDataTypes = function () {
            var arr = [
                {
                    name: 'data type A',
                    checked: true
                },
                {
                    name: 'data type B',
                    checked: true
                },
                {
                    name: 'data type C',
                    checked: true
                }
            ];

            return arr;
        };

        service.getExportDataTypes = function () {
            var arr = [
                'tsv',
                'csv',
                'png',
                'pdf'
            ];

            return arr;
        };

        return service;
    }]);
