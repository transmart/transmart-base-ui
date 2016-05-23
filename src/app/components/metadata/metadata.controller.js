'use strict';

var transmartBaseUi = angular.module('transmartBaseUi');

transmartBaseUi.controller('MetadataCtrl', ['$scope', 'metadata', '$uibModalInstance','isURL',
    function ($scope, metadata, $uibModalInstance, isURL) { 

        $scope.metadata = metadata;
        $scope.isURL = isURL;

        $scope.close = function () {
          $uibModalInstance.dismiss('close');
        };

}]);




