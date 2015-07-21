'use strict';

angular.module('transmartBaseUi')
  .controller('HomeCtrl',
  ['$scope', function ($scope) {

      $scope.tutorial = {
        openStep1: true,
        openStep2: false
      };

      $scope.$on('howManyStudiesLoaded', function(e, val) {
        if (val !== undefined) {
          $scope.tutorial.openStep1 = !val;
          $scope.tutorial.openStep2 = val;
        }
      });

  }]);
