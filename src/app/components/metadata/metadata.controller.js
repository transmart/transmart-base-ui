'use strict';

var transmartBaseUi = angular.module('transmartBaseUi');

transmartBaseUi.controller('MetadataCtrl', ['$scope', 'metadata', '$uibModalInstance','UtilService',
    function ($scope, metadata, $uibModalInstance, UtilService) {

        $scope.metadata = metadata;
        $scope.isURL = UtilService.isURL;

        $scope.close = function () {
          $uibModalInstance.dismiss('close');
        };

}]);




