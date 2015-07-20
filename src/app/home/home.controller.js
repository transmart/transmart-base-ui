'use strict';

angular.module('transmartBaseUi')
  .controller('HomeCtrl', ['$scope', function ($scope) {

    $scope.tutorial = {
      openStep1: true,
      disableStep1: false,
      openStep2: false
    };

    $scope.$on('howManyStudiesLoaded', function(e, val) {
      $scope.tutorial.openStep1 = !val;
      $scope.tutorial.disableStep1 = val;
      $scope.tutorial.openStep2 = val;
    });

  }]);
