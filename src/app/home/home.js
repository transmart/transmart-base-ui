'use strict';

angular.module('transmartBaseUi')
  .controller('HomeCtrl',
  ['$scope', '$rootScope', function ($scope, $rootScope) {

      $scope.tutorial = {
        openStep1: true,
        openStep2: false
      };

      $scope.$on('howManyStudiesLoaded', function(e, val) {
        $scope.tutorial.openStep1 = !val;
        $scope.tutorial.openStep2 = val;
      });

  }]);
