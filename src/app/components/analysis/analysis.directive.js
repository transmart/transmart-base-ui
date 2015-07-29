'use strict';

angular.module('transmartBaseUi')
  .directive('analysis', ['$http', function ($http) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/analysis/analysis.tpl.html',
      scope: {},
      controller: function($scope) {
        $scope.step2drop = ['zscore','logfold'];
        $scope.step2option="zscore";

        $scope.tabIndex = 0;

        $scope.tabs = [
          { title:'1. Fetch data', content:'step1.html', done: true, active: true},
          { title:'2. Pre-process data', content:'step2.html', done: false },
          { title:'3. Generate heatmap', content:'step3.html', done: false },
        ];

        $scope.nextTab = function() {
           if($scope.tabIndex !== $scope.tabs.length -1 ){
            $scope.tabs[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.tabs[$scope.tabIndex].active = true;
           }

           if($scope.tabIndex === $scope.tabs.length -1){
              $scope.buttonLabel = "Finish";
           }
        };

        $scope.setTab = function(i) {
          $scope.tabIndex = i;
        };


        $scope.concept = {};
        $scope.token = 'f50a1cea-c3ec-4910-b56f-ec60eece043d';

        $scope.onNodeDropEvent = function (event, info, node) {
          $scope.concept.link = node.restObj._links.self.href;
          $scope.concept.study = node.study.id;
          $scope.concept.url = node.restObj.getRequestedUrl().split('/studies')[0];

          if(node.restObj._links.highdim === undefined){
            $scope.droppedNode = {title: 'This node is not highdim'};
          } else {
            $scope.tabs[$scope.tabIndex].executing = true;

            $http({
              method: 'POST',
              url: 'http://localhost:8004/ocpu/library/transmartRClient/R/getHighdimData',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              data: jQuery.param({
                'apiUrl': '"'+$scope.concept.url+'"',
                'auth.token': '"'+$scope.token+'"',
                'study.name': '"'+$scope.concept.study+'"',
                'concept.link': '"'+$scope.concept.link+'"',
                'projection': '"zscore"'})
            }).success(function (data) {
              $scope.tabs[$scope.tabIndex].done = true;
              $scope.tabs[$scope.tabIndex].executing = false;
              $scope.tabs[$scope.tabIndex+1].data = data.split('/')[3];
            });
          }
        };

        $scope.step2 = function (dataKey) {
          $scope.tabs[$scope.tabIndex].executing = true;
          $http({
            method: 'POST',
            url: 'http://localhost:8004/ocpu/library/opencpuRScript/R/preprocessDataHeatmap',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: jQuery.param({
              'data': 'x0919f30f67',
              'preprocess': '"'+$scope.step2option+'"',

            })
          })
          .success(function (data) {
            $scope.tabs[$scope.tabIndex].done = true;
            $scope.tabs[$scope.tabIndex].executing = false;
            $scope.tabs[$scope.tabIndex+1].data = data.split('/')[3];
          });
        }

        $scope.step3 = function (dataKey) {
          $scope.tabs[$scope.tabIndex].executing = true;
          $http({
            method: 'POST',
            url: 'http://localhost:8004/ocpu/library/opencpuRScript/R/generateArtefactsHeatmap',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: jQuery.param({'data': dataKey})
          })
          .success(function (data) {
            $scope.tabs[$scope.tabIndex].done = true;
            $scope.tabs[$scope.tabIndex].executing = false;
            $scope.imgHash = data.split('/')[3];
          });
        }



      }
    };
}]);

/**


$http({
  method: 'POST',
  url: 'http://localhost:8004/ocpu/library/opencpuRScript/R/generateArtefactsHeatmap',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  data: jQuery.param({'data': "x0d9cecc2b0"})
}).success(function (data, status, headers, config) {
  console.log(data.split("/")[3])
});
**/
