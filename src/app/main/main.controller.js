'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', '$rootScope', 'Restangular', 'ChartService', 'AlertService', '$location',
    function ($scope, $rootScope, Restangular, ChartService, AlertService, $location) {

    $scope.summaryStatistics = {
      isLoading : false,
      magicConcepts : ['sex', 'race', 'age', 'religion', 'maritalStatus'],
      titles : ['Sex', 'Race', 'Age', 'Religion', 'Marital Status']
    };

    $scope.tutorial = {
      openStep1: true,
      disableStep1: false,
      openStep2: false
    };

    $scope.$on('howManyStudiesLoaded', function(e, val) {
      $scope.tutorial.openStep1 = !val;
      $scope.tutorial.disableStep1 = val;
      $scope.tutorial.openStep2 = val;
    });

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();


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
      $scope.summaryStatistics.isLoading = true;

      $scope.selectedStudy.title = study.id;
      ChartService.displaySummaryStatistics(study, $scope.summaryStatistics.magicConcepts).then(function(){
        $scope.summaryStatistics.isLoading = false;
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
      console.log("as", node);
      $location.search('cohorts',node.title);
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
      });
      if(formatted.length > 0) $scope.csvHeaders = Object.keys(formatted[0]);
      else $scope.csvHeaders = [];
      return formatted;
    };

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
