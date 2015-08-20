'use strict';

angular.module('transmartBaseUi')
  .controller('ImportWorkspaceCtrl', ['$scope', '$modalInstance', 'ChartService', 'EndpointService',
    'CohortSelectionService', 'StudyListService', '$state',
    function ($scope, $modalInstance, ChartService, EndpointService, CohortSelectionService, StudyListService, $state) {

    $scope.readContent = function ($fileContent){
      $scope.content = JSON.parse($fileContent);
    };

    $scope.ok = function () {
      //console.log('$scope.content', $scope.content);
      $state.go('workspace'); // go to workspace

      // TODO add nodes via chart service
      _.each($scope.content.nodes, function (node) {

        // check if endpoints are connected
        var _e = _.where(EndpointService.endpoints, {url : node.study.endpoint.url});

        if (_e.length > 0) { // get restObj for each nodes

          var _restObj =  _e[0].restangular;

          _restObj.oneUrl(node._links.self.href).get().then(function (d) {

            node.restObj = d;

            // attach study
            var searchKey = {
              id : node.study.id
              //endpoint : {
              //  url: node.study.endpoint.url
              //}
            };

            console.log(StudyListService.studyList);

            var _study = _.where(StudyListService.studyList, searchKey);

            if (_study.length > 0) {
              node.study = _study[0];
            }

            CohortSelectionService.nodes.push(node);
            ChartService.addNodeToActiveCohortSelection(node).then(function() {

              //console.log('done ...');

              // TODO :
              // - Apply filters
              // - Get subject selection for grid view

            });
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
