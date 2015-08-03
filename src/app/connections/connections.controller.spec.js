'use strict';

describe('ConnectionsCtrlTests', function() {
  beforeEach(module('transmartBaseUi'));

  var $controller, scope, rootScope, EndpointService, location;

  /**
   * dummy endpoints
   * @type {*[]}
   * @private
   */
  var _dummy_endpoints = [
    {
      title: 'foo',
      url: ' http://foo',
      status: 'active'
    },
    {
      title: 'bar',
      url: ' http://bar',
      status: 'error'
    },
    {
      title: ' local-dummy',
      url:'local-dummy',
      status: 'local'
    }
  ];

  beforeEach(inject(function (_$controller_, _$rootScope_, _$location_) {
      scope = _$rootScope_.$new();
      rootScope = _$rootScope_;
      location = _$location_;

      EndpointService = {
        getEndpoints : function() {},
        clearStoredEnpoints : function () {},
        navigateToAuthorizationPage : function () {},
        remove: function (e) {}
      };
      spyOn(EndpointService, "getEndpoints").and.returnValue(_dummy_endpoints);
      spyOn(EndpointService, "clearStoredEnpoints");
      spyOn(EndpointService, "navigateToAuthorizationPage");
      spyOn(EndpointService, "remove");

      $controller = _$controller_('ConnectionsCtrl', {
          $scope: scope,
          $location: location,
          EndpointService : EndpointService
      });
  }));

  it('is defined', function() {
    expect($controller).toBeDefined();
    expect(scope.formData).toBeDefined();
    expect(scope.endpoints).toBeDefined();
    expect(scope.connections).toBeDefined();
  });

  it('should call EndpointService.getEndpoints fn', function() {
    expect(scope.endpoints.length).toBe(3);
  });

  it('Should invoke EndpointService.clearStoredEnpoints', function () {
    scope.clearSavedEndpoints();
    expect(EndpointService.clearStoredEnpoints).toHaveBeenCalled();
  });

  it('should invoke EndpointService.navigateToAuthorizationPage', function () {
    scope.navigateToAuthorizationPage();
    expect(EndpointService.navigateToAuthorizationPage).toHaveBeenCalled();
  });

  it ('should populate selected endpoints to the form', function () {
    scope.selectedConnection = {
      label : 'foo',
      url : 'http://foo'
    };

    scope.populateDefaultApi();
    expect(scope.formData.title).toBe('foo');
    expect(scope.formData.url).toBe('http://foo');
    expect(scope.formData.requestToken).toBe('');

  });

  it('should invoke EndpointService.remove', function () {
    var _e = {};
    scope.removeEndpoint(_e);
    expect(EndpointService.remove).toHaveBeenCalled();
  })

});
