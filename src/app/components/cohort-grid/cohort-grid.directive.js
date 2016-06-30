'use strict';

angular.module('transmartBaseUi')
  .directive('cohortGrid', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/components/cohort-grid/cohort-grid.tpl.html',
      scope: {
        cohort: '=',
        headers: '='
      },
      controller: ['$scope', '$timeout', 'CohortGridService', function ($scope, $timeout, CohortGridService) {

        $scope.displayedCollection = [].concat($scope.cohort);
        $scope.gridOptions = CohortGridService.options;
        $scope.style_modifiers = {'width': CohortGridService.WIDTH_PER_COLUMN * 2}; // Starting value never really used

        $scope.$watchCollection('headers', function (newValue, oldValue) {
          if (!_.isEqual(newValue, oldValue)) {
            $scope.style_modifiers.width = CohortGridService.updateCohortGridView($scope.cohort, newValue);
          }
        });

        $scope.$watchCollection('cohort', function (newValue, oldValue) {
          if (!_.isEqual(newValue, oldValue)) {
            $scope.style_modifiers.width = CohortGridService.updateCohortGridView(newValue, $scope.headers);
          }
        });

        $scope.getConceptValue = function (id) {
          return function (subject) {
            return subject.labels[id];
          };
        };

        $scope.getCsvFormatted = function () {
          var formatted = [];
          $scope.cohort.forEach(function (subject) {
            var cleanSubject = {};
            cleanSubject.id = subject.id;
            $scope.headers.forEach(function (label) {
              cleanSubject[label.name] = subject.labels[label.ids];
            });
            formatted.push(cleanSubject);
          });
          if (formatted.length > 0) {
            $scope.csvHeaders = Object.keys(formatted[0]);
          } else {
            $scope.csvHeaders = [];
          }
          return formatted;
        };
      }]
    };
  });
