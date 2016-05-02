'use strict';

angular.module('transmartBaseUi')
  .controller('MetadataCtrl', ['$scope', 'metadata', '$uibModalInstance',
    function ($scope, metadata, $uibModalInstance) {

        $scope.metadata = metadata;

        $scope.close = function () {
          $uibModalInstance.dismiss('close');
        };

}]);
