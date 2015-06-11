'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', 'ChartService', 'AlertService', function ($scope, Restangular, ChartService, AlertService) {

    $scope.dataLoading = false;

    var dcData = {};
    dcData.dim = {};
    dcData.gro = {}

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    $scope.metadata = {
      Title: 'Node title',
      Organism: 'Homo sapiens',
      Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus ut nisl quis ullamcorper. Quisque in orci vitae nibh rhoncus blandit. Integer tincidunt nunc sit amet magna faucibus, eget pellentesque libero finibus. Sed eu cursus risus, ac pretium felis. In non turpis eros. Nam nec tellus venenatis, consectetur dui a, posuere dui. In id pellentesque elit, ac mattis orci. Donec aliquam feugiat neque nec efficitur. Donec fermentum posuere diam, quis semper felis aliquam vel. Praesent sit amet dapibus tortor. Aliquam sed quam non augue imperdiet scelerisque. Vivamus pretium pretium eros. Nullam finibus accumsan tempor. Duis mollis, ex nec maximus bibendum.'
    };

    $scope.selectedStudy = {};
    $scope.observations = [];
    $scope.observationsC = [];

    $scope.cohortSelected = 0;
    $scope.cohortTotal = 0;

    /*******************************************************************************************************************
     * Drag and drop controls
     */

    /**
     * Contains the active nodes after they are dropped
     * @type {array}
     */
    $scope.activeNodeButtons = [];

    /**
     * Callback for node drop
     * @param event jQuery drop event
     * @param info
     * @param node Dropped node
     */
    $scope.onNodeDropEvent = function(event, info, node){
      $scope.activeNodeButtons.push(node);
      $scope.addCohort(node);
    }

    /**
     * Reset the active nodes to empty
     */
    $scope.resetActiveNodes = function(){
      $scope.activeNodeButtons = [];
      for(var i =0; i < 10; i++){
        angular.element('#chartc_'+i).empty();
      }
      $scope.cohortSelected = 0;
      $scope.cohortTotal = 0;
      ChartService.reset();
    };




    $scope.displayStudySummaryStatistics = function (study) {

      var _setLoadingAnim = function (data, chart) {
        $scope.dataLoading = data;
        $scope.chartLoading = chart;
      };

      angular.element('#node-charts-container').empty();
      _setLoadingAnim(true, false);
      $scope.selectednode = study;
      $scope.selectedStudy.title = study.id;

      ChartService.getSubjects(study).then(function(d) {

        $scope.$apply(function () {
          $scope.observations = d.chartData;
          $scope.selectedStudy.subjects = d.subjects;
          $scope.selectedStudy.title = study.id;

          //console.log($scope.selectedStudy.subjects);

          $scope.displayedCollection = [].concat($scope.selectedStudy.subjects);
          _setLoadingAnim(false, true);

        });
        return $scope.observations;

      }, function (err) {
        AlertService.add("danger", err, 10000);
      }).then (function (observations) {
        //console.log(observations);
        // then generate charts out of it
        if (typeof observations !== 'undefined') {
          ChartService.generateCharts(observations).then(function (charts) {
            ChartService.renderAll(charts);
          });
        }
      }).then (function () {
        _setLoadingAnim(false, false);
      });
    };


    /**
     *
     * @param node
     */
    $scope.displayNodeSummaryStatistics = function (node) {

      $scope.selectedNode = node;

      var _setLoadingAnim = function (data, chart) {
        $scope.dataLoading = data;
        $scope.chartLoading = chart;
      };

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
          ChartService.generateCharts($scope.observations).then(function (c) {
            ChartService.renderAll(c);
          });
        }
      })
        .then (function () {
        _setLoadingAnim(false, false);
      });

    };

    $scope.addCohort = function (node) {

      $scope.selectedNode = node;

      var _setLoadingAnim = function (data, chart) {
        $scope.dataLoading = data;
        $scope.chartLoading = chart;
      };

      angular.element('#node-charts-container').empty();
      for(var i =0; i < 10; i++){
        angular.element('#cohort-chart-'+i).empty();
      }

      _setLoadingAnim(false, true);
      ChartService.addNodeToActiveCohortSelection(node).then(function(charts){
        charts.forEach(function(chart){
          $scope.cohortSelected = ChartService.getSelectionValues().selected;
          $scope.cohortTotal = ChartService.getSelectionValues().total;
          chart.on('postRedraw', function (){
            $scope.cohortSelected = ChartService.getSelectionValues().selected;
            $scope.cohortTotal = ChartService.getSelectionValues().total;
            $scope.$apply();
          });
        });
        ChartService.renderAll(charts);
      }).then(_setLoadingAnim(false, false));
    };
  }]);
