'use strict';
/* jshint undef: false */

describe('CohortViewService', function () {
    var CohortViewService,
        $timeout,
        $q,
        deferred,
        CohortViewMocks,
        httpBackend,
        EndpointService,
        Restangular,
        $rootScope;

    /**
     * Super dummy studies only have id and type
     * {id: number, b: string, c: boolean}}
     * @type {Array}
     */

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_CohortViewService_, _CohortViewMocks_, _$httpBackend_,
                                _EndpointService_, _Restangular_, _$rootScope_) {
        httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        CohortViewService = _CohortViewService_;
        CohortViewMocks = _CohortViewMocks_;
        EndpointService = _EndpointService_;
        Restangular = _Restangular_;
    }));

    describe('getCohorts', function() {
        var _endpoint;

        beforeEach(function () {
            httpBackend.whenGET('/patient_sets').respond(CohortViewMocks.cohorts());

            spyOn(Restangular, 'addResponseInterceptor');
            _endpoint = {restangular : Restangular};
            spyOn(EndpointService, 'getMasterEndpoint').and.returnValue(_endpoint);
        });

        afterEach(function () {
            httpBackend.flush();
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should return all cohorts', function() {
            CohortViewService.getCohorts().then(function(cohorts) {
                expect(cohorts.length).toEqual(3);
            });
        });

        it('should set a description property on the cohorts', function() {
            CohortViewService.getCohorts().then(function(cohorts) {
                cohorts.forEach(function(cohort) {
                    expect(cohort.description).toBeDefined();
                });
            })
        });
    });

});
