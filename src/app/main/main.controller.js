'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', 'Restangular', 'ChartService', 'AlertService', function ($scope, Restangular, ChartService, AlertService) {

    $scope.summaryLoading = false;
    $scope.summaryOpen = false;

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    $scope.metadata = {
      Title: 'Node title',
      Organism: 'Homo sapiens',
      Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris faucibus ut nisl quis ullamcorper. Quisque in orci vitae nibh rhoncus blandit. Integer tincidunt nunc sit amet magna faucibus, eget pellentesque libero finibus. Sed eu cursus risus, ac pretium felis. In non turpis eros. Nam nec tellus venenatis, consectetur dui a, posuere dui. In id pellentesque elit, ac mattis orci. Donec aliquam feugiat neque nec efficitur. Donec fermentum posuere diam, quis semper felis aliquam vel. Praesent sit amet dapibus tortor. Aliquam sed quam non augue imperdiet scelerisque. Vivamus pretium pretium eros. Nullam finibus accumsan tempor. Duis mollis, ex nec maximus bibendum.'
    };

    $scope.magicConcepts = ['sex', 'race', 'age', 'religion', 'maritalStatus'];
    $scope.titles = ['Sex', 'Race', 'Age', 'Religion', 'Marital Status'];

    /*******************************************************************************************************************
     * Summary statistics
     */
    /**
     * Selected study
     * @type {{}}
     */
    $scope.selectedStudy = {};

    /**
     * Display summary statisctics for the selected study
     * @param study
     */
    $scope.displayStudySummaryStatistics = function (study) {
      $scope.summaryLoading = true;
      $scope.summaryOpen = false;

      $scope.selectedStudy.title = study.id;
      ChartService.displaySummaryStatistics(study, $scope.magicConcepts).then(function(){
        $scope.summaryLoading = false;
        $scope.summaryOpen = true;
        //$scope.$apply();
      });
    };

    /*******************************************************************************************************************
     * Cohort selection
     */

    /**
     * Quantity of subjects remaining in cohort selection after filters are applied
     * @type {number}
     */
    $scope.cohortVal = {selected: 0, total: 0, subjects: []};

    /**
     *
     * @type {Array}
     */
    $scope.cohortChartContainerLabels = [];

    /**
     * Update quantity of containers necessary for displaying the graphs in cohort selection
     */
    $scope.$on('prepareChartContainers', function (event, labels) {
      $scope.cohortChartContainerLabels = labels;
    });

    /**
     * Callback for node drop
     * @param event drop event
     * @param info
     * @param node Dropped node
     */
    $scope.onNodeDropEvent = function (event, info, node) {
      _addCohort(node);
    };

    /**
     *
     * @param label
     */
    $scope.removeLabel = function (label) {
      ChartService.removeLabel(label);
    };

    /**
     * Reset the active nodes for cohort selection
     */
    $scope.resetActiveLabels = function () {
      ChartService.reset();
      _updateCohortDisplay();
    };

    /**
     *
     * @private
     */
    var _updateCohortDisplay = function(){
      $scope.cohortVal = ChartService.getSelectionValues();
      $scope.displayedCollection = [].concat($scope.cohortVal.subjects);
      console.log($scope.displayedCollection);
    }

    /**
    * Get the cohort selection in a formatted form for csv export
    */
    $scope.getCsvFormatted = function(){
      var formatted = [];
      $scope.cohortVal.subjects.forEach(function(subject){
        var cleanSubject = jQuery.extend(true, {}, subject);
        delete cleanSubject._links;
        delete cleanSubject.labels;
        delete cleanSubject.$$hashKey;
        formatted.push(cleanSubject);
      })
      if(formatted.length > 0) $scope.csvHeaders = Object.keys(formatted[0]);
      else $scope.csvHeaders = [];
      return formatted;
    }
    
    /**
    * Headers for csv export
    */
    $scope.csvHeaders = [];


    /**
     * Add node dropped from concept tree
     * @param node
     * @private
     */
    var _addCohort = function (node) {

      $scope.cohortUpdating = true;

      ChartService.addNodeToActiveCohortSelection(node).then(function (charts) {
        _updateCohortDisplay();

        // Update the selection value on filtering the charts
        charts.forEach(function (chart) {
          chart.on('postRedraw', function () {
            _updateCohortDisplay();
            $scope.$apply();
          });

          ChartService.renderAll(charts);
          $scope.cohortUpdating = false;
        });
      });
    }
  }]);
