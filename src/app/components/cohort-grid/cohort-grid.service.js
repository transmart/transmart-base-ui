'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortGridService
 */
angular.module('transmartBaseUi').factory('CohortGridService', ['$timeout', 'CohortSelectionService',
    function ($timeout, CohortSelectionService) {

        var service = {
            WIDTH_PER_COLUMN: 200,
            HEIGHT: 500,
            options: {
                enableGridMenu: true,
                enableSelectAll: true,
                exporterCsvFilename: 'cohort.csv',
                exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                exporterMenuPdf: false,
                paginationPageSizes: [50, 75, 100],
                paginationPageSize: 50,
                columnDefs: [], // columns is stored here
                data: [], // data is stored here
                enableFiltering: false,
                onRegisterApi: function (gridApi) {
                    service.options.gridApi = gridApi;
                }
            }
        };

        /**
         * Generate grid columns
         * @memberof CohortGridService
         * @param rawHeaders
         * @returns {Array}
         */
        service.prepareColumnDefs = function (rawHeaders) {
            var columnDefs = [];
            columnDefs.push({
                field: "fields['cohort-panel']",
                width: 0.6 * service.WIDTH_PER_COLUMN,
                displayName: 'cohort-panel',
                pinnedLeft: true
            });
            columnDefs.push({
                field: "fields['id']",
                width: 0.5 * service.WIDTH_PER_COLUMN,
                displayName: 'id',
                pinnedLeft: true
            });
            rawHeaders.forEach(function (label) {
                if (_.find(columnDefs, {field: label.name}) == undefined) {
                    columnDefs.push({
                        field: "fields['" + label.name + "']",
                        width: service.WIDTH_PER_COLUMN,
                        displayName: label.name
                    });
                }
            });
            return columnDefs;
        };

        /**
         * Format data and labels for the gridview's data
         * @memberof CohortGridService
         * @param subjects - the selected subjects from cohort panels
         * @param labels - the dragged-in nodes/labels by the user
         * @returns {Array}
         */
        service.convertToTable = function (subjects, labels) {
            var stringifyIndices = function (boxes) {
                var result = '';
                boxes.forEach(function (box) {
                    result += box.ctrl.boxIndex + ',';
                });
                return result.substr(0,result.length-1);
            }

            var formatted = [];
            subjects.forEach(function (subject) {
                var cleanSubject = {};
                cleanSubject['cohort-panel'] = stringifyIndices(subject.boxes);
                cleanSubject.id = subject.id;
                labels.forEach(function (label) {
                    cleanSubject[label.name] = subject.observations[label.conceptPath];
                });
                formatted.push({'fields': cleanSubject});
            });

            return formatted;
        };

        service.updateCohortGridView = function (subjects, labels) {
            $timeout(function () { // this is necessary for ui-grid to notice the change at all
                if (subjects) {
                    service.options.data = service.convertToTable(subjects, labels);
                    service.options.columnDefs = service.prepareColumnDefs(labels);
                }
            });
        };

        return service;
    }]);
