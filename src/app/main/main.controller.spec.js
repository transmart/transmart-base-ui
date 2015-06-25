'use strict';

describe('MainCtrl', function () {
  beforeEach(module('transmartBaseUi'));

  var $controller, AlertService;

  beforeEach(inject(function (_$controller_, _AlertService_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    AlertService = _AlertService_;
  }));

  describe('MainPage', function () {
    var $scope, controller;

    beforeEach(function () {
      $scope = {};
      controller = $controller('MainCtrl', {$scope: $scope});
    });

    // Need to inject the normal scope
    /**
    it('removes alert when alert is closed', function () {
      AlertService.add('success', 'Successfully connected to rest-api');
      AlertService.remove(1);
      expect($scope.alerts.length).toBeLessThan(1);
    });
**/
  });

  // TODO: Unit tests for rest-api call


});
