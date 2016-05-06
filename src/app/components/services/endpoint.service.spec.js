'use strict';

describe('Endpoint Service Unit Tests', function() {
  var endpointService;

  // Load the transmartBaseUi module, which contains the directive
  beforeEach(function() {module('transmartBaseUi');});

  beforeEach(inject(function(_EndpointService_) {
    endpointService = _EndpointService_;
  }));

  describe('getRedirectURI', function() {

    it('should return direct uri with port when port is not 80 or 443', function() {
      var testURI = endpointService.getRedirectURI('http', 'localhost', '8001');
      expect(testURI).toBe('http%3A%2F%2Flocalhost%3A8001%2Fconnections');
    });

    it('should return direct uri without port when port is  80', function() {
      var testURI = endpointService.getRedirectURI('http', 'localhost', '80');
      expect(testURI).toBe('http%3A%2F%2Flocalhost%2Fconnections');
    });

    it('should return direct uri without port when port is  443', function() {
      var testURI = endpointService.getRedirectURI('http', 'localhost', '443');
      expect(testURI).toBe('http%3A%2F%2Flocalhost%2Fconnections');
    });

  });
});
