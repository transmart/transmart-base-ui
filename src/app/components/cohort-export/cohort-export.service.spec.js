'user strict'

describe('CohortExportService', function () {
    var CohortExportService;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_CohortExportService_) {
        CohortExportService = _CohortExportService_;
    }));

    describe('getConceptDataTypes', function () {
        it('should get non-empty array of data types', function () {
            var dataTypes = CohortExportService.getConceptDataTypes();
            expect(dataTypes.length).toBeGreaterThan(0);
        });
    });

    describe('getExportDataTypes', function () {
        it('should get non-empty array of export data types', function () {
            var exportDataTypes = CohortExportService.getExportDataTypes();
            expect(exportDataTypes.length).toBeGreaterThan(0);
        });
    });

});
