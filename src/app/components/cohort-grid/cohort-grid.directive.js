'use strict';

/**
  -----------------------------------------------------------------------------
  - Parameters
  -----------------------------------------------------------------------------
  cohort:
    Array of subjects
      Subjects are formatted as:
        {
          id: ...
          ...
          labels: [
            label1: value,
            label2: value
          ]
        }
  headers:
    Array of grid headers corresponding to the subject labels.
      Headers are formatted as:
        {
          name: ...
          ...
          label: "label1"
        }

*/

angular.module('transmartBaseUi')
  .directive('cohortGrid', function () {
    return {
        restrict: 'E',
        templateUrl: 'app/components/cohort-grid/cohort-grid.tpl.html',
        scope: {
          cohort: '=',
          headers: '='
        },
        controller: function($scope) {
          $scope.getConceptValue = function (label) {
              return function (subject) {return subject.labels[label];};
          };

          $scope.getCsvFormatted = function(){
            var formatted = [];
            $scope.cohort.forEach(function(subject){
              var cleanSubject = {};
              cleanSubject.id = subject.id;
              $scope.headers.forEach(function(label){
                cleanSubject[label.name] = subject.labels[label.label];
              });
              formatted.push(cleanSubject);
            });
            if(formatted.length > 0) {
              $scope.csvHeaders = Object.keys(formatted[0]);
            } else {
              $scope.csvHeaders = [];
            }
            return formatted;
          };

          $scope.displayedCollection = [].concat($scope.cohort);
        }
    };
});
