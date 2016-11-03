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
        expect(QueryBuilderService.convertCohortFiltersToI2B2Panels(QueryBuilderMocks.cohortFiltersWithCategories()))
            .toEqual(QueryBuilderMocks.cohortFiltersWithCategoriesI2B2Panels());
    });

    it('should convert cohort filters with number ranges', function () {
        expect(QueryBuilderService.convertCohortFiltersToI2B2Panels(QueryBuilderMocks.cohortFiltersWithNumberRanges()))
            .toEqual(QueryBuilderMocks.cohortFiltersWithNumberRangesI2B2Panels());
    });

    it('should convert cohort filters with high dimensional data', function() {
        expect(QueryBuilderService.convertCohortFiltersToI2B2Panels(QueryBuilderMocks.cohortFiltersWithHighDimData()))
            .toEqual(QueryBuilderMocks.cohortFiltersWithHighDimDataI2B2Panels());
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
