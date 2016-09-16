/**
 * Created by piotrzakrzewski on 16/09/16.
 */
'use strict';

describe('Endpoint Service Unit Tests', function () {
    var rServeService, $httpBackend, authRequestHandler;
    var baseURL = 'http://transmart-gb.thehyve.net/transmart';
    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
        module('tmEndpoints');
        module('smartRApp');
    });


    beforeEach(inject(function (_rServeService_, _$httpBackend_) {
        rServeService = _rServeService_;
        $httpBackend = _$httpBackend_;

        authRequestHandler = $httpBackend.when('POST', baseURL + '/RSession/deleteFiles')
            .respond(201, '');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('rServeService', function () {

        it('should be defined', function () {
            expect(rServeService).toBeDefined();
        });

        it('should call deleteSessionFiles', function () {
            $httpBackend.expectPOST(baseURL + '/RSession/deleteFiles');
            rServeService.deleteSessionFiles('bogus-session-id');
            $httpBackend.flush();
        });

    });

});
