'use strict';

angular.module('transmartBaseUi')
  .controller('ImportWorkspaceCtrl', ['$scope', '$modalInstance', 'ChartService', function ($scope, $modalInstance, ChartService) {

    $scope.readContent = function ($fileContent){
      $scope.content = JSON.parse($fileContent);
    };

    $scope.ok = function () {
      //console.log('$scope.content', $scope.content);

      // TODO add nodes via chart service
      _.each($scope.content.nodes, function (node) {
        ChartService.addNodeToActiveCohortSelection(node);
      });


      //

      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

}]);
