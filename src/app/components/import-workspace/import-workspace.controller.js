'use strict';

angular.module('transmartBaseUi')
  .controller('ImportWorkspaceCtrl', ['$scope', '$modalInstance', 'ChartService', 'EndpointService',
    function ($scope, $modalInstance, ChartService, EndpointService) {

    $scope.readContent = function ($fileContent){
      $scope.content = JSON.parse($fileContent);
    };

    $scope.ok = function () {
      //console.log('$scope.content', $scope.content);

      // TODO add nodes via chart service
      _.each($scope.content.nodes, function (node) {

        // check if endpoints are connected
        var _e = _.where(EndpointService.endpoints, {url:node.endpoint.url});

        if (_e) { // get restObj for each nodes
          console.log(_e[0].restangular);
          var _restObj =  _e[0].restangular;

          _restObj.oneUrl('xx', node.restangularUrl).get().then(function (d) {
            console.log(d);
            node.restObj = d;
            ChartService.addNodeToActiveCohortSelection(node);
          });

        } else {
          // TODO tell user endpoint is not connected
        }


        // add nodes to active cohort selection


      });


      //

      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

}]);
