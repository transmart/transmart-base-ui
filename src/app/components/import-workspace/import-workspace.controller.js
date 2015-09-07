'use strict';

angular.module('transmartBaseUi')
  .controller('ImportWorkspaceCtrl', ['$scope', '$modalInstance', 'ChartService', 'EndpointService',
    'CohortSelectionService', 'StudyListService', '$state',
    function ($scope, $modalInstance, ChartService, EndpointService, CohortSelectionService, StudyListService, $state) {

    $scope.readContent = function ($fileContent){
      $scope.content = JSON.parse($fileContent);
    };

    $scope.ok = function () {

      console.log('$scope.content', $scope.content);

      $modalInstance.close();
      $state.go('workspace'); // go to workspace

      // TODO add nodes via chart service
      _.each($scope.content.nodes, function (node) {

        // check if endpoints are still connected
        var _e = _.where(EndpointService.endpoints, {url : node.study.endpoint.url});

        // if endpoints are still connected
        if (_e.length > 0) { // get restObj for each nodes

          _e[0].restangular.oneUrl(node._links.self.href).get().then(function (d) {

            node.restObj = d; // assign rest object to the imported node

            // assign study to the node
            var _study = _.where(StudyListService.studyList, {id : node.study.id});

            if (_study.length > 0) {

              node.study = _study[0];

              CohortSelectionService.nodes.push(node);
              ChartService.addNodeToActiveCohortSelection(node, $scope.content.filters).then(function () {

              })

            } else {
              // TODO load study
              console.error('Cannot find saved study');
            }
          }, function (err) {
            console.log(err);
          });
        } else {
          // TODO tell user endpoint is not connected
          console.error('Cannot connect to ' + node.study.endpoint.url);
        }
      });

    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

}]);
