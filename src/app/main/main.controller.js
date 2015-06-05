'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', 'ChartService', 'alertService', function ($scope, Restangular, ChartService, alertService) {

    $scope.close = alertService.remove;
    $scope.alerts = alertService.get();

    $scope.dataLoading = false;
    $scope.observations = [];

    $scope.getStudyConcepts = function (study) {

      ChartService.getSubjects(study).then(function(d) {

        $scope.selectedStudy = d;
        $scope.selectedStudy.panel.isDisplayed = true;
        $scope.displayedCollection = [].concat($scope.selectedStudy.obj);
        //console.log(d);

      }, function (err) {
        alertService.add("danger", err, 10000);
      }).then (function () {
        // then generate charts out of it
        //console.log($scope.selectedStudy.obj);
        if (typeof $scope.selectedStudy !== 'undefined') {
          ChartService.generateSubjectCharts($scope.selectedStudy.obj);
        }
      });
    };

    $scope.closeConceptsPanel = function () {
      $scope.selectedStudy.panel.isDisplayed = false;
    };

    $scope.displayNodeSummaryStatistics = function (node) {

      var _setLoadingAnim = function (data, chart) {
        $scope.dataLoading = data;
        $scope.chartLoading = chart;
      };

      angular.element('#node-charts-container').empty();
      _setLoadingAnim(true, false);

      ChartService.getObservations(node).then(function (d) {
        // at first, get the observation data for the selected node
        $scope.$apply(function () {
          $scope.observations = d;
          _setLoadingAnim(false, true);
          return $scope.observations;
        });
      }, function (err) {
          alertService.add('danger', err);
        })
        .then(function () {
        // then generate charts out of it
        if (typeof $scope.observations !== 'undefined') {
          ChartService.generateCharts($scope.observations);
        }
      })
        .then (function () {
        _setLoadingAnim(false, false);
      });

    };

  }]);
