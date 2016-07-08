'use strict';

angular.module('transmartBaseUi')
  .controller('MainCtrl',
    ['$scope', '$rootScope', 'Restangular', 'ChartService', 'AlertService', '$location', '$stateParams', '$log',
      '$state', 'StudyListService', 'CohortSelectionService', 'GridsterService', '$uibModal',
      function ($scope, $rootScope, Restangular, ChartService, AlertService, $location, $stateParams, $log,
                $state, StudyListService, CohortSelectionService,  GridsterService, $uibModal)
  {

    // Alerts
    $scope.close = AlertService.remove;
    $scope.alerts = AlertService.get();

    // Gridster
    $scope.gridsterOpts = GridsterService.options;

    // Cohort summary data
    $scope.cohortVal = {selected: 0, total: 0, subjects: []};

    // Charts
    $scope.cs = ChartService.cs;

    $scope.$watchCollection('cs', function(newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        $scope.cohortVal = ChartService.summary();
      }

    });

    // Tabs
    $scope.tabs = [
      {title: 'Cohort Selection', active: true},
      {title: 'Cohort Grid', active: false},
      {title: 'Analysis', active: false}
    ];

    /**
     * Activate tab
     * @param tabTitle
     * @param tabAction
       */
    $scope.activateTab = function (tabTitle, tabAction) {
        $scope.tabs.forEach(function (tab) {
            tab.active = tab.title === tabTitle;
        });
        $state.go('workspace', {action:tabAction});
    };

    // Every selected concept is represented by a label
    $scope.cohortChartContainerLabels = GridsterService.cohortChartContainerLabels;

    // Watch labels container
    $scope.$watch(function () {
      return GridsterService.cohortChartContainerLabels;
    }, function (newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        $scope.cohortChartContainerLabels = newVal;
      }
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
      $scope.$broadcast('collectionUpdated', [[], []]);
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
        $scope.cohortUpdating = false;
      });
    };

    /**
     * Saves the cohort by asking for a name, saving it to the backend
     * and showing the resulting id
     */
    $scope.openSaveCohortModal = function() {
      $uibModal.open({
        templateUrl: 'app/components/savecohort/savecohortdialog.tpl.html',
        controller: 'SaveCohortDialogCtrl',
        animation:false
      });
    }

    /**
     * When this controller is loaded, check the query params if it contains some actions.
     * If it is, do the necessities.
     * @private
     */
    var _initLoad = function () {
      var findURLQueryParams = $location.search();

      if (findURLQueryParams !== undefined) {
        if (findURLQueryParams.action === 'cohortGrid') {
          $scope.activateTab($scope.tabs[1].title, 'cohortGrid');
        } else {
          $scope.activateTab($scope.tabs[0].title, 'cohortSelection');
        }
      }
      // register update cohort display function to be invoked when filter changed
      ChartService.registerFilterEvent(ChartService.summary);
    };

    _initLoad();

  }]);
