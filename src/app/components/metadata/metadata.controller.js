'use strict';

angular.module('transmartBaseUi')
  .controller('MetadataCtrl', ['$scope', 'metadata', '$modalInstance',
    function ($scope, metadata, $modalInstance) {

        $scope.metadata = metadata;

        $scope.close = function () {
          $modalInstance.dismiss('close');
        };

}]);
