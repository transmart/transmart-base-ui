'use strict';

angular.module('transmartBaseUi').controller('HighdimCtrl',
  ['$scope', 'ProtobufService',
  function ($scope, ProtobufService) {
    $scope.concept = {};

    $scope.onNodeDropEvent = function (event, info, node) {
      $scope.concept = node;

      node.restObj.one('highdim').get().then(function (metadata){
        $scope.restObj = metadata;
        $scope.metadata = metadata._embedded.dataTypes;
      });
    };

    $scope.getData = function (name) {
      $scope.restObj.one('?dataType='+name).get({}, {'Accept': 'application/octet-stream'}).then(function (data){
        ProtobufService.decode(data);
        //console.log(message);
      });
    };
  }]);
