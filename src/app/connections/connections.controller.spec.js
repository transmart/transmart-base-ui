'use strict';

describe('ConnectionsCtrl', function() {
  beforeEach(module('transmartBaseUi'));

  var $controller, scope, rootScope, EndpointService, AlertService, location;

  /**
   * dummy endpoints
   * @type {*[]}
   * @private
   */
  var _dummyEndpoints = [
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
        clearStoredEndpoints : function () {},
        saveSelectedEndpoint : function () {},
        navigateToAuthorizationPage : function () {},
        remove: function (e) {}
      };

      AlertService = {
        remove : function () {

        },
        get : function () {

        },
        add : function () {

        }
      };

      spyOn(EndpointService, 'getEndpoints').and.returnValue(_dummyEndpoints);
      spyOn(EndpointService, 'clearStoredEnpoints');
      spyOn(EndpointService, 'saveSelectedEndpoint');
      spyOn(EndpointService, 'navigateToAuthorizationPage');
      spyOn(EndpointService, 'remove');
      spyOn(AlertService, 'add');
      spyOn(AlertService, 'remove');
      spyOn(AlertService, 'get');

    $controller = _$controller_('ConnectionsCtrl', {
          $scope: scope,
          $location: location,
          EndpointService : EndpointService,
          AlertService : AlertService
      });
  }));

  it('should have initial variables to be defined', function() {
    expect($controller).toBeDefined();
    expect(scope.formData).toBeDefined();
    expect(scope.endpoints).toBeDefined();
    expect(scope.connections).toBeDefined();
    expect(AlertService.get).toHaveBeenCalled();
  });

  it('should call EndpointService.getEndpoints fn', function() {
    expect(scope.endpoints.length).toBe(3);
  });

  describe ('$scope.clearSavedEndpoints', function () {
    it('Should invoke EndpointService.clearStoredEnpoints', function () {
      scope.clearSavedEndpoints();
      expect(EndpointService.clearStoredEnpoints).toHaveBeenCalled();
    });
  });

  describe ('$scope.navigateToAuthorizationPage', function () {

    it('should invoke EndpointService.navigateToAuthorizationPage', function () {
      scope.navigateToAuthorizationPage();
      expect(EndpointService.navigateToAuthorizationPage).toHaveBeenCalled();
    });

    it('should not navigate and store auth endpoint uri when already connected', function () {
      // override existing spy
      EndpointService.getEndpoints = jasmine.createSpy().and.returnValue([{
        label : 'foo',
        url : 'http://foo'
      }]);

      scope.selectedConnection = { url:'http://foo' };
      scope.navigateToAuthorizationPage(scope.selectedConnection);
      //expect(AlertService.add).toHaveBeenCalled();
      expect(EndpointService.saveSelectedEndpoint).not.toHaveBeenCalled();
      expect(EndpointService.navigateToAuthorizationPage).not.toHaveBeenCalled();
    });

  });

  describe ('$scope.populateDefaultApi', function () {
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
  });

  describe ('$scope.removeEndpoint', function () {
    it('should invoke EndpointService.remove', function () {
      var _e = {};
      scope.removeEndpoint(_e);
      expect(EndpointService.remove).toHaveBeenCalled();
    });
  });

});
