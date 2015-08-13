'use strict';

angular.module('transmartBaseUi')
  .controller('ImportWorkspaceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    $scope.showContent = function ($fileContent){
      $scope.content = $fileContent;
    };

    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

}]);
