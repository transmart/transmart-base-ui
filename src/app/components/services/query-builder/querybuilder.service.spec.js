'use strict';

describe('QueryBuilderService Unit Tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var QueryBuilderService,
        QueryBuilderMocks;

    beforeEach(inject(function (_QueryBuilderService_, _QueryBuilderMocks_) {
        QueryBuilderService = _QueryBuilderService_;
        QueryBuilderMocks = _QueryBuilderMocks_;
    }));

    it('should convert cohort filters with categories', function () {
        var cohortFilters = QueryBuilderMocks.cohortFiltersWithCategories();
        var convertedOutput = QueryBuilderService.convertCohortFiltersToI2B2Panels(cohortFilters);
        var expectedOutput = QueryBuilderMocks.cohortFiltersWithCategoriesI2B2Panels();
        expect(convertedOutput).toEqual(expectedOutput);
    });

    it('should convert cohort filters with number ranges', function () {
        var cohortFilters = QueryBuilderMocks.cohortFiltersWithNumberRanges();
        var convertedOutput = QueryBuilderService.convertCohortFiltersToI2B2Panels(cohortFilters);
        var expectedOutput = QueryBuilderMocks.cohortFiltersWithNumberRangesI2B2Panels();
        expect(convertedOutput).toEqual(expectedOutput);
    });

    it('should convert cohort filters with high dimensional data', function () {
        var cohortFilters = QueryBuilderMocks.cohortFiltersWithHighDimData();
        var convertedOutput = QueryBuilderService.convertCohortFiltersToI2B2Panels(cohortFilters);
        var expectedOutput = QueryBuilderMocks.cohortFiltersWithHighDimDataI2B2Panels();
        expect(convertedOutput).toEqual(expectedOutput);
    });

    it('should convert cohort filters to xml', function () {
        expect(
            QueryBuilderService
                .convertCohortFiltersToXML(
                    QueryBuilderMocks.cohortFilters().cohortFilters,
                    QueryBuilderMocks.cohortFilters().cohortName)
        )
            .toEqual(QueryBuilderMocks.cohortFiltersXML());
    });

});
