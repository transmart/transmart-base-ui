'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', 'ChartService', 'AlertService', function ($scope, Restangular, ChartService, AlertService) {

    $scope.dataLoading = false;

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    $scope.selectedStudy = {
      'obj': null,
      'title': '',
      'panel': {
        isDisplayed: false
      }
    };

    $scope.selectedNode = $scope.selectedStudy;

    $scope.metadata = {
      Title: 'Node title',
      Organism: 'Homo sapiens',
      Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus ut nisl quis ullamcorper. Quisque in orci vitae nibh rhoncus blandit. Integer tincidunt nunc sit amet magna faucibus, eget pellentesque libero finibus. Sed eu cursus risus, ac pretium felis. In non turpis eros. Nam nec tellus venenatis, consectetur dui a, posuere dui. In id pellentesque elit, ac mattis orci. Donec aliquam feugiat neque nec efficitur. Donec fermentum posuere diam, quis semper felis aliquam vel. Praesent sit amet dapibus tortor. Aliquam sed quam non augue imperdiet scelerisque. Vivamus pretium pretium eros. Nullam finibus accumsan tempor. Duis mollis, ex nec maximus bibendum.'
    };

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

      $scope.selectedNode = node;

      var _setLoadingAnim = function (data, chart) {
        $scope.dataLoading = data;
        $scope.chartLoading = chart;
      };

      angular.element('#node-charts-container').empty();
      _setLoadingAnim(true, false);
      $scope.selectednode = node;

      ChartService.getObservations(node).then(function (d) {
        // at first, get the observation data for the selected node
        $scope.$apply(function () {
          $scope.observations = d;
          _setLoadingAnim(false, true);
          return $scope.observations;
        });
      }, function (err) {
          AlertService.add('danger', err);
        }
      ).then(function () {
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
