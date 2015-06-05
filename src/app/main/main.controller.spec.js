'use strict';

describe('MainCtrl', function () {
  beforeEach(module('transmartBaseUi'));

  var $controller;

  beforeEach(inject(function (_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  describe('MainPage', function () {
    var $scope, controller;

    beforeEach(function () {
      $scope = {};
      controller = $controller('MainCtrl', {$scope: $scope});
    });

    it('removes alert when alert is closed', function () {
      AlertService.add('success', 'Successfully connected to rest-api');
      AlertService.remove(1);
      expect($scope.alerts.length).toBeLessThan(1);
    });

    it('sets displayed to false when concept panel is closed', function () {
      $scope.selectedStudy.panel.isDisplayed = true;
      $scope.closeConceptsPanel();
      expect($scope.selectedStudy.panel.isDisplayed).toBeFalsy();
    });

  });

  // TODO: Unit tests for rest-api call


});
