'use strict';

angular.module('transmartBaseUi')
  .directive('analysis', ['$http', function ($http) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/analysis/analysis.tpl.html',
      scope: {},
      link: function($scope){
        $scope.opencpuURL = "http://transmart-gb-opencpu.thehyve.net/ocpu/"

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
          url: $scope.opencpuURL + 'library/opencpuRScripts/R/produceUI/json',
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
              $scope.analysis[$scope.tabIndex].return = undefined;

              var _query = {};
              step.inputs.forEach(function(inp){
                inp.param.forEach(function(par, index){
                  _query[par] = inp.value ? '"'+inp.value[index]+'"' : '';
                });
              });

              if($scope.tabIndex !== 0){ _query.data = step.data};

              $http({
                method: 'POST',
                url: $scope.opencpuURL +'library/'+step.package[0]+'/R/'+step.func[0],
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: jQuery.param(_query)
              }).success(function (data) {

                $scope.analysis[$scope.tabIndex].done = true;
                $scope.analysis[$scope.tabIndex].executing = false;
                $scope.analysis[$scope.tabIndex].return = data.split('/')[3];
                if(!step.final[0]){
                  $scope.analysis[$scope.tabIndex+1].data = data.split('/')[3]
                };

                // Fetch the console output of the executed function for display
                $http({
                  method: 'GET',
                  url: $scope.opencpuURL + 'tmp/'+$scope.analysis[$scope.tabIndex+1].data+'/console/json'
                }).success(function (data){
                  var modified = [];
                  data.pop();
                  data.forEach(function(message){
                    var type;
                    if(message[0] === 'M') {type = 'MESSAGE';}
                    else if (message[0] === 'W') {type = 'WARNING';}
                    else {type = 'OTHER';}

                    modified.push({'message': message, 'type': type});
                  });
                  $scope.analysis[$scope.tabIndex].messages = modified;
                });

              }).error(function(){
                $scope.analysis[$scope.tabIndex].messages = [{'message': 'Call failure, try again.', 'type': 'WARNING'}];
                $scope.analysis[$scope.tabIndex].executing = false;
              });

            };
          });
          data[0].active = true;
        });
      }
    };
}]);
