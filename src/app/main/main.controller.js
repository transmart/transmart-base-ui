'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
  ['$scope', '$rootScope', 'Restangular', 'ChartService', 'AlertService', function ($scope, $rootScope, Restangular, ChartService, AlertService) {

    $scope.tuto = {openStep1: true, disableStep1: false, openStep2: false};

    $scope.$on('howManyStudiesLoaded', function(e, val){
      $scope.tuto = {openStep1: !val, disableStep1: val, openStep2: val};
    })

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
      //$scope.summaryOpen = false;

      $scope.selectedStudy.title = study.id;
      ChartService.displaySummaryStatistics(study, $scope.magicConcepts).then(function(){
        $scope.summaryLoading = false;
        //$scope.summaryOpen = false;
        //$scope.$apply();
      });
    };

    /*******************************************************************************************************************
     * Cohort selection
     */

    $scope.gridsterOpts = {
      columns: 3, // the width of the grid, in columns
      pushing: true, // whether to push other items out of the way on move or resize
      floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
      swapping: false, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
      width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
      colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
      rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
      margins: [10, 10], // the pixel distance between each widget
      outerMargin: true, // whether margins apply to outer edges of the grid
      isMobile: false, // stacks the grid items if true
      mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
      mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
      minColumns: 1, // the minimum columns the grid must have
      minRows: 2, // the minimum height of the grid, in rows
      maxRows: 100,
      defaultSizeX: 2, // the default width of a gridster item, if not specifed
      defaultSizeY: 1, // the default height of a gridster item, if not specified
      minSizeX: 1, // minimum column width of an item
      maxSizeX: null, // maximum column width of an item
      minSizeY: 1, // minumum row height of an item
      maxSizeY: null, // maximum row height of an item
      resizable: {
        enabled: true,
        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
        start: function(event, $element, widget) {}, // optional callback fired when resize is started,
        resize: function(event, $element, widget) {
        }, // optional callback fired when item is resized,
        stop: function(event, $element, widget) {
        } // optional callback fired when item is finished resizing
      },
      draggable: {
        enabled: true, // whether dragging items is supported
        handle: '.chart-drag-handle', // optional selector for resize handle
        start: function(event, $element, widget) {}, // optional callback fired when drag is started,
        drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
        stop: function(event, $element, widget) {} // optional callback fired when item is finished dragging
      }
    };

    $scope.standardItems = [];

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
      var _gridsterBaseWidth = 140;
      var _gridsterWidth = angular.element('#main-chart-container').width();
      var _gridsterCols = Math.floor(_gridsterWidth/_gridsterBaseWidth)%2 ? Math.floor(_gridsterWidth/_gridsterBaseWidth)-1:Math.floor(_gridsterWidth/_gridsterBaseWidth);
      $scope.gridsterOpts.columns = _gridsterCols;

      labels.forEach(function(label, index){
        label.sizeX = 2;
        label.sizeY = 2;
        label.col = (index*label.sizeX)%_gridsterCols;
        label.row = Math.floor(index*label.sizeY/_gridsterCols);
      })
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
