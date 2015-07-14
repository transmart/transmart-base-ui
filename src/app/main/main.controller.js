'use strict';

angular.module('transmartBaseUi').controller('MainCtrl',
  ['$scope', '$rootScope', 'Restangular', 'ChartService', 'AlertService',
  function ($scope, $rootScope, Restangular, ChartService, AlertService) {

    $scope.tuto = {openStep1: true, disableStep1: false, openStep2: false};

    $scope.$on('howManyStudiesLoaded', function(e, val){
      $scope.tuto = {openStep1: !val, disableStep1: val, openStep2: val};
    });

    $scope.summaryLoading = false;
    $scope.summaryOpen = false;

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    $scope.magicConcepts = ['sex', 'race', 'age', 'religion', 'maritalStatus'];
    $scope.titles = ['Sex', 'Race', 'Age', 'Religion', 'Marital Status'];

    $scope.csvHeaders = [];

    /**************************************************************************
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
      $scope.selectedStudy.title = study.id;
      ChartService.displaySummaryStatistics(study, $scope.magicConcepts)
        .then(function(){
          $scope.summaryLoading = false;
        });
    };

    /**************************************************************************
     * Cohort selection
     */
    $scope.gridsterOpts = {
      // whether to push other items out of the way on move or resize
      pushing: true,
      // whether to automatically float items up so they stack
      floating: false,
      // whether or not to have items of the same size switch places instead
      // of pushing down if they are the same size
      swapping: true,
      // the pixel distance between each widget
      margins: [10, 10],
      // whether margins apply to outer edges of the grid
      outerMargin: false,
      // the minimum columns the grid must have
      minColumns: 1,
      // the minimum height of the grid, in rows
      minRows: 2,
      // maximum number of rows
      maxRows: 100,
      // minimum column width of an item
      minSizeX: 2,
      // maximum column width of an item
      maxSizeX: null,
      // minumum row height of an item
      minSizeY: 2,
      // maximum row height of an item
      maxSizeY: null,
      resizable: {
        enabled: true,
        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
        resize: function(event, $element, widget) {
          // Resize chart container in an interactive way
          angular.element('#cohort-chart-panel-' + widget.ids)
            .width($element[0].clientWidth)
            .height($element[0].clientHeight);
        }
      },
      draggable: {
        enabled: true, // whether dragging items is supported
        handle: '.chart-drag-handle', // optional selector for resize handle
      }
    };

    // Values and subjects of the cohort selection
    $scope.cohortVal = {selected: 0, total: 0, subjects: []};
    // Every selected concept is represented by a label
    $scope.cohortChartContainerLabels = [];

    var _CONFIG = {
      // Base width for a gridster square, this value will be adapted to fit
      // exaclty an even number of squares in the grid according to window size
      G_BASE_WIDTH: 70,
      // Number of columns a gridster item will occupy by default
      G_ITEM_SPAN_X: 3,
      // Number of rows a gridster item will occupy by default
      G_ITEM_SPAN_Y: 3,
    };

    /**
     * Update quantity of containers necessary for displaying the graphs in
     * cohort selection.
     * @param event Unused
     * @param labels Corresponding to selected concepts
     */
    $scope.$on('prepareChartContainers', function (event, labels) {
      _resizeGridster(labels, false);
    });
    $scope.$on('gridster-resized', function (event, newS, obj) {
      if(newS[0] < obj.currentSize -20){
        _resizeGridster(false, true);
      }
    });

    var _resizeGridster = function (labels, reDistribute) {
      // Get width of the full gridster grid
      var _gWidth = angular.element('#main-chart-container').width();
      // Calculate the number of columns in the grid according to full gridster
      // grid size and the base square size. Adjust by -1 if number of columns
      // is not pair.
      var _gCols  = Math.floor(_gWidth/_CONFIG.G_BASE_WIDTH);
      _gCols  = _gCols%2 ? _gCols-1 : _gCols;
      $scope.gridsterOpts.columns = _gCols ;
      // For each label create a gridster item
      if (!labels) {labels = $scope.cohortChartContainerLabels;}
      labels.forEach(function(label, index){
        if(!label.sizeX || reDistribute){
          label.sizeX = _CONFIG.G_ITEM_SPAN_X;
          label.sizeY = _CONFIG.G_ITEM_SPAN_Y;
          // Spread items left to rigth
          label.col = (index*label.sizeX)%_gCols ;
          // And top to bottom
          label.row = Math.floor((index*label.sizeX)/_gCols )*label.sizeY;
        }
      });
      $scope.cohortChartContainerLabels = labels;
    };

    /**
     * Removes a label and thus a concept form the selection
     * @param label Corresponding to concept to be removed
     */
    $scope.removeLabel = function (label) {
      ChartService.removeLabel(label);
    };

    /**
     * Remove all the concepts from the cohort selection
     */
    $scope.resetActiveLabels = function () {
      ChartService.reset();
      _updateCohortDisplay(true);
    };

    /**
     * Updates the bar graph slection values and the subjects displayed by the
     * grid.
     * @private
     */
    var _updateCohortDisplay = function(noApply){
      $scope.cohortVal = ChartService.getSelectionValues();
      $scope.cohortLabels = ChartService.getLabels();
      if(!noApply){$scope.$apply();}
    };
    ChartService.registerFilterEvent(_updateCohortDisplay);

    /**
     * Callback for node drop
     * @param event
     * @param info
     * @param node Dropped node from the study tree
     */
    $scope.onNodeDropEvent = function (event, info, node) {
      // Makes the progress bar animated
      $scope.cohortUpdating = true;

      ChartService.addNodeToActiveCohortSelection(node).then(function () {
        $scope.cohortUpdating = false;
        _updateCohortDisplay(true);
      });
    };

  }]);
