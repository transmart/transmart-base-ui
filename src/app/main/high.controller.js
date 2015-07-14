'use strict';

angular.module('transmartBaseUi').controller('HighCtrl',
  ['$scope', 'ProtobufService',
  function ($scope, ProtobufService) {
    $scope.concept = {};

    $scope.onNodeDropEvent = function (event, info, node) {
      $scope.concept = node;
    };
  }]);
