'use strict';

angular.module('transmartBaseUi')
  .directive('analysis', ['$http', function ($http) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/analysis/analysis.tpl.html',
      scope: {},
      link: function($scope){

        $scope.dropConcept = function (event, info, node, input) {
          input.value = [];
          input.value[0] = node.restObj.getRequestedUrl().split('/studies')[0];
          input.value[1] = node.study.endpoint.accessToken;
          input.value[2] = node.study.id;
          input.value[3] = node.restObj._links.self.href;
        };

        $scope.tabIndex = 0;

        $scope.nextTab = function() {
           if($scope.tabIndex !== $scope.analysis.length -1 ){
            $scope.analysis[$scope.tabIndex].active = false;
            $scope.tabIndex++;
            $scope.analysis[$scope.tabIndex].active = true;
           }
        };

        $scope.setTab = function(i) {
          $scope.tabIndex = i;
        };

        // Get the UI configuration
        $http({
          method: 'POST',
          url: 'http://localhost:8004/ocpu/library/opencpuRScripts/R/produceUI/json',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: jQuery.param({})
        })
        .success(function (data) {
          $scope.analysis = data;

          $scope.analysis.forEach(function(step){
            step.done = false;

            step.exec = function(){
              $scope.analysis[$scope.tabIndex].executing = true;
              $scope.analysis[$scope.tabIndex].done = false;

              var _query = {};
              step.inputs.forEach(function(inp){
                inp.param.forEach(function(par, index){
                  _query[par] = inp.value ? '"'+inp.value[index]+'"' : "";
                });
              });

              if($scope.tabIndex !== 0) _query.data = step.data;

              $http({
                method: 'POST',
                url: 'http://localhost:8004/ocpu/library/'+step.package[0]+'/R/'+step.func[0],
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: jQuery.param(_query)
              }).success(function (data) {

                $scope.analysis[$scope.tabIndex].done = true;
                $scope.analysis[$scope.tabIndex].executing = false;
                $scope.analysis[$scope.tabIndex].return = data.split('/')[3];
                if(!step.final[0])$scope.analysis[$scope.tabIndex+1].data = data.split('/')[3];
              });

            }
          })
          data[0].active = true;
          //data[0].done = true;
          //data[1].data = "x02c7eeb35b";
          console.log(data)

        });


      },
      controller: function($scope) {

        $scope.step3 = function (dataKey) {
          $scope.tabs[$scope.tabIndex].executing = false;
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
