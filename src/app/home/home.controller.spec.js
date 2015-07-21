'use strict';

describe('Unit testing for HomeCtrl', function() {

  beforeEach(module('transmartBaseUi'));

  var $scope, $rootScope, controller, CreateTarget;

  beforeEach(function() {
    inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $scope = $rootScope.$new();

      var $controller = $injector.get('$controller');

      CreateTarget = function() {
        $controller('HomeCtrl', {$scope: $scope});
      };
    });
  });

  describe('test cases', function() {

    it('should define tutorial', function () {
      controller = CreateTarget();
      $rootScope.$broadcast('howManyStudiesLoaded', true);
      expect($scope.tutorial).toBeDefined();
    });

    it('should set openStep1 to false and openStep2 to true if argument is true', function() {
      controller = CreateTarget();
      $rootScope.$broadcast('howManyStudiesLoaded', true);
      expect($scope.tutorial.openStep1).toBe(false);
      expect($scope.tutorial.openStep2).toBe(true);
    });

    it('should set openStep1 to true and openStep2 to false if argument is false', function() {
      controller = CreateTarget();
      $rootScope.$broadcast('howManyStudiesLoaded', false);
      expect($scope.tutorial.openStep1).toBe(true);
      expect($scope.tutorial.openStep2).toBe(false);
    });

    it('should set openStep1 to true and openStep2 to false if argument is false', function() {
      controller = CreateTarget();
      $rootScope.$broadcast('howManyStudiesLoaded', undefined);
      expect($scope.tutorial.openStep1).toBe(true);
      expect($scope.tutorial.openStep2).toBe(false);
    });  });
});
