'use strict';

angular.module('transmartBaseUi')
  .directive('aceConsole', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/components/ace-console/ace-console.tpl.html',
      scope: {},
      controller: function($scope) {

        $scope.aceOptionsIn = {
          theme: 'idle_fingers',
          mode: 'r',
          useWrapMode : true
        };

        $scope.aceOptionsOut = {
          theme: 'pastel_on_dark',
          mode: 'json',
          useWrapMode : true
        };

        $scope.inputConsole = 'x <- 5';
        $scope.outputConsole = '';

        ocpu.seturl("//transmart-gb-opencpu.thehyve.net/ocpu/github/thehyve/rtransmartbaseui/R");

        $scope.runScript = function () {
          var req = ocpu.rpc("execscript",{
            text : $scope.inputConsole
          }, function(output){
            $scope.outputConsole = JSON.stringify(output, null, '\t');
            $scope.aceOptionsOut.mode = 'json';
            $scope.$apply();
          });

          req.fail(function(){
            $scope.outputConsole = req.responseText;
            $scope.aceOptionsOut.mode = 'r';
            $scope.$apply();
          });
        };

      }
    };
});
