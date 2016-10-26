'use strict';

describe('QueryParserService Unit Tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var QueryParserService,
        QueryBuilderMocks,
        CohortSelectionCtrl,
        $controller,
        ctrl,
        scope,
        StudyListService,
        TreeNodeService,
        $q;

    beforeEach(inject(function (_QueryParserService_, _QueryBuilderMocks_,
                                _$controller_, _AlertService_, _$rootScope_,
                                _StudyListService_, _TreeNodeService_, _$q_) {
        QueryParserService = _QueryParserService_;
        QueryBuilderMocks = _QueryBuilderMocks_;
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        StudyListService = _StudyListService_;
        TreeNodeService = _TreeNodeService_;
        $q = _$q_;

        // Just return dummy study and concept nodes
        spyOn(StudyListService, 'getStudy').and.returnValue({});
        spyOn(TreeNodeService, 'expandConcept').and.returnValue($q.when({}));

        var ctrlElm = angular.element('<div></div>');
        ctrl = $controller('CohortSelectionCtrl', {$scope: scope, $element: ctrlElm});

        scope.$digest();
    }));

    it('should parse query xml and add cohort filters', function() {
        spyOn(ctrl, 'addNodeWithFilters');

        // We're mocking the dc.filters.RangedFilter() call, because it is not
        // properly matching different instances
        spyOn(dc.filters, 'RangedFilter').and.callFake(function() {
            // Just return the arguments passed to create the RangedFilter
            return arguments;
        });

        QueryParserService.convertCohortFiltersFromXML(QueryBuilderMocks.cohortFiltersToXMLResponse(), ctrl);
        scope.$digest(); // to make promise resolve

        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith({}, [dc.filters.RangedFilter('65', '70')]);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith({}, [['carcinoid'], ['hematoma']]);
        expect(ctrl.addNodeWithFilters).toHaveBeenCalledTimes(2);
    });

    it('should parse query xml to a description', function() {
        expect(QueryParserService.parseQueryXMLToDescription(QueryBuilderMocks.cohortFiltersToXMLResponse()))
            .toEqual('GSE8581 Age [65.0,70.0] Diagnosis [carcinoid, hematoma] ');
    });

});
