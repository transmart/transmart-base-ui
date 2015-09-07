'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
    ['$scope', '$rootScope', 'Restangular', 'ChartService', 'AlertService', '$location', '$stateParams',
      '$state', 'StudyListService', 'CohortSelectionService', 'SummaryStatsService', 'GridsterService',
      function ($scope, $rootScope, Restangular, ChartService, AlertService, $location, $stateParams,
                $state, StudyListService, CohortSelectionService, SummaryStatsService, GridsterService)
  {

    $scope.summaryStatistics = SummaryStatsService;

    $scope.gridsterOpts = GridsterService.options;

    $scope.cohortVal = {selected: 0, total: 0, subjects: []};

    $scope.cs = ChartService.cs;

    $scope.tabs = [
      {title: 'Cohort Selection', active: true},
      {title: 'Cohort Grid', active: false},
      {title: 'Summary Statistics', active: false},
      {title: 'Analysis', active: false}
    ];

    $scope.activateTab = function (tabTitle, tabAction) {
        $scope.tabs.forEach(function (tab) {
            if (tab.title !== tabTitle) {
                tab.active = false;
            } else {
                tab.active = true;
            }
        });
        $state.go('workspace', {action:tabAction});
    };

    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    /**
     * Display summary statisctics for the selected study
     * @param study
     */
    $scope.displayStudySummaryStatistics = function (study) {
      $scope.summaryStatistics.isLoading = true;
      $scope.summaryStatistics.selectedStudy.title = study.id;
      SummaryStatsService.displaySummaryStatistics(study,
        $scope.summaryStatistics.magicConcepts).then(function() {
        $scope.summaryStatistics.isLoading = false;
      });
    };

    /**
     * Updates the bar graph selection values and the subjects displayed by the
     * grid.
     * @private
     */
    var _updateCohortDisplay = function () {
      $scope.cohortVal.selected = $scope.cs.cross.groupAll().value();
      $scope.cohortVal.total = $scope.cs.cross.size();
      $scope.cohortVal.subjects =  $scope.cs.mainDim.top(Infinity);
      $scope.cohortVal.dimensions = $scope.cs.numDim;
      $scope.cohortVal.maxdim = $scope.cs.maxDim;
      $scope.cohortLabels = $scope.cs.labels;
    };

    $scope.$watchCollection('cs', function() {
      _updateCohortDisplay();
    });

    // Every selected concept is represented by a label
    $scope.cohortChartContainerLabels = GridsterService.cohortChartContainerLabels;

    $scope.$watch(function (x) {
      return GridsterService.cohortChartContainerLabels;
    }, function (r) {
      $scope.cohortChartContainerLabels = GridsterService.cohortChartContainerLabels;
      console.log('im watching cohort chart container labels', r);
      ChartService.reapplyFilters();
    });

    /**
     * Update quantity of containers necessary for displaying the graphs in
     * cohort selection.
     * @param event Unused
     * @param labels Corresponding to selected concepts
     */
    $scope.$on('prepareChartContainers', function (event, labels) {
      $scope.cohortChartContainerLabels = GridsterService.resize('#main-chart-container', labels, false);
    });

    $scope.$on('gridster-resized', function (event, newS, obj) {
      if(newS[0] < obj.currentSize -20){
        $scope.cohortChartContainerLabels  = GridsterService.resize('#main-chart-container', false, true);
      }
    });

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
      CohortSelectionService.clearAll();
      ChartService.reset();
    };

    /**
     * Callback for node drop
     * @param event
     * @param info
     * @param node Dropped node from the study tree
     */
    $scope.onNodeDropEvent = function (event, info, node) {
      // Makes the progress bar animated
      $scope.cohortUpdating = true;
      CohortSelectionService.nodes.push(node);
      ChartService.addNodeToActiveCohortSelection(node).then(function () {
        //$scope.cohortChartContainerLabels = GridsterService.cohortChartContainerLabels;
        $scope.cohortUpdating = false;
      });
    };

    /**
     * When this controller is loaded, check the query params if it contains some actions.
     * If it is, do the necessities.
     * @private
     */
    var _initLoad = function () {

      var findURLQueryParams = $location.search();

      if (findURLQueryParams !== undefined) {
        if (findURLQueryParams.action === 'summaryStats') {
          if (findURLQueryParams.study) {

            // check if study by id already loaded in existing array
            var _study = _.findWhere(StudyListService.getAll(),
              {id: findURLQueryParams.study}
            );

            // display summary statistics if the study is existing
            if (_study) {
              $scope.displayStudySummaryStatistics(_study);
            } else {
              console.log('Cannot find study in existing loaded studies');
            }
          }
          $scope.activateTab($scope.tabs[2].title, 'summaryStats');
        } else if (findURLQueryParams.action === 'cohortGrid') {
          $scope.activateTab($scope.tabs[1].title, 'cohortGrid');
        } else {
          $scope.activateTab($scope.tabs[0].title, 'cohortSelection');
        }
      }
      // register update cohort display function to be invoked when filter changed
      ChartService.registerFilterEvent(_updateCohortDisplay);
    };

    _initLoad();

  }]);
