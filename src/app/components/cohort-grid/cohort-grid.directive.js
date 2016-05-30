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
      controller: ['$scope', '$timeout', function ($scope, $timeout) {
        $scope.getConceptValue = function (id) {
          return function (subject) {
            return subject.labels[id];
          };
        };

        var prepareColumnDefs = function (rawHeaders) {
          var columnDefs = [];
          columnDefs.push({'field': 'id'});
          var usedAlready = new Set();
          rawHeaders.forEach(function (label) {
            if (!usedAlready.has(label.name)) {
              columnDefs.push({field: label.name});
              usedAlready.add(label.name);
            }
          });
          return columnDefs;
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

        var _to_table = function (cohort, headers) {
          var formatted = [];
          cohort.forEach(function (subject) {
            var cleanSubject = {};
            cleanSubject.id = subject.id;
            headers.forEach(function (label) {
              cleanSubject[label.name] = subject.labels[label.ids];
            });
            formatted.push(cleanSubject);
          });
          return formatted;
        };

        $scope.displayedCollection = [].concat($scope.cohort);
        $scope.gridOptions = {
          paginationPageSizes: [10, 25, 50],
          paginationPageSize: 10,
          columnDefs: [],
          data: [],
          enableFiltering: true
        };

        $scope.$watch('cohorts',function () {
          console.log('Watcher registered change in cohorts');
        }, true);

        $scope.$watch('headers',function () {
          console.log('Watcher registered change in headers');
        });// if you set it to true it will cause maximum call stack exceeded exception

        $scope.$on('collectionUpdated', function (event, passedFromBroadcast) {
          console.log('collectionUpdated event fired');
          var _cohorts = passedFromBroadcast[0];
          var _headers = passedFromBroadcast[1];
          $scope.gridOptions.data.length = 0;       // In order to make sure ui-grid is refreshed also when tables
          $scope.gridOptions.columnDefs.length = 0; // are of the same length
          $timeout(function () { // this is necessary for ui-grid to notice the change at all
            $scope.gridOptions.data = _to_table(_cohorts, _headers);
            $scope.gridOptions.columnDefs = prepareColumnDefs(_headers);
          });
        });
      }]
    };
  });
