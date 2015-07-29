'use strict';

angular.module('transmartBaseUi')
  .directive('analysis', ['$http', function ($http) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/analysis/analysis.tpl.html',
      scope: {},
      controller: function($scope) {
        $scope.concept = {};
        $scope.token = "f50a1cea-c3ec-4910-b56f-ec60eece043d";

        console.log(jQuery.param({
          'apiUrl': '"'+$scope.concept.url,
          'auth.token': '"'+$scope.token,
          'study.name': $scope.concept.study,
          'concept.link': $scope.concept.link,
          'projection': "default_real_projection"}));

        $scope.onNodeDropEvent = function (event, info, node) {
          // Makes the progress bar animated
          $scope.concept.link = node.restObj._links.self.href;
          $scope.concept.study = node.study.id;
          $scope.concept.url = node.restObj.getRequestedUrl().split("/studies")[0]

          if(node.restObj._links.highdim == undefined){
            $scope.droppedNode = {title: "This node is not highdim"};
          } else {
            $http({
              method: 'POST',
              url: 'http://localhost:8004/ocpu/library/opencpuRScript/R/preprocessDataHeatmap',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              data: jQuery.param({'data': "x0636f40b5a"})
            }).success(function (data, status, headers, config) {
              console.log(data.split("/")[3])
            });

            $http({
              method: 'POST',
              url: 'http://localhost:8004/ocpu/library/opencpuRScript/R/generateArtefactsHeatmap',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              data: jQuery.param({'data': "x0d9cecc2b0"})
            }).success(function (data, status, headers, config) {
              console.log(data.split("/")[3])
            });


            $http({
              method: 'POST',
              url: 'http://localhost:8004/ocpu/library/transmartRClient/R/getHighdimData',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              data: jQuery.param({
                'apiUrl': '"'+$scope.concept.url+'"',
                'auth.token': '"'+$scope.token+'"',
                'study.name': '"'+$scope.concept.study+'"',
                'concept.link': '"'+$scope.concept.link+'"',
                'projection': '"default_real_projection"'})
            }).success(function (data, status, headers, config) {
              console.log(data.split("/")[3])
            });
          }



          console.log(node)

        };



      }
    };
}]);
