'use strict';

angular.module('transmartBaseUi')
    .controller('CohortExportCtrl', ['CohortExportService', function (CohortExportService) {
        var vm = this;
        vm.conceptDataTypes = CohortExportService.getConceptDataTypes();
        vm.exportDataTypes = CohortExportService.getExportDataTypes();

        vm.conceptDataTypes.forEach(function (conceptDataType) {
            conceptDataType['exportDataType'] = 'tsv';
        });

        vm.onExportDataTypeClick = function (conceptDataType, exportDataType) {
            conceptDataType['exportDataType'] = exportDataType;
        };

    }]);
