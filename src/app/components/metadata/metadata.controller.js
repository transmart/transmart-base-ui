'use strict';

angular.module('transmartBaseUi')
  .controller('ModalInstanceCtrl', ['$scope', 'selectedNode', '$modalInstance', function ($scope, selectedNode, $modalInstance) {
    $scope.metadata = selectedNode._embedded.ontologyTerm.metadata;
    $scope.title = selectedNode._embedded.ontologyTerm.name;

    $scope.close = function () {
      $modalInstance.close();
    };

}]);
