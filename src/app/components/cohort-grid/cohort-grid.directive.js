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
              CohortGridService.updateCohortGridView($scope.cohort, newValue)
                .then(function (res) {
                  $scope.style_modifiers.width = res;
              });
          }
        });

        $scope.$watchCollection('cohort', function (newValue, oldValue) {
          if (!_.isEqual(newValue, oldValue)) {
            CohortGridService.updateCohortGridView(newValue, $scope.headers)
              .then(function (res) {
                $scope.style_modifiers.width = res;
              });
          }
        });

        $scope.getConceptValue = function (id) {
          return function (subject) {
            return subject.labels[id];
          };
        };

      }]
    };
  });
