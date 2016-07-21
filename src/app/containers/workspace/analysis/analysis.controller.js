'use strict';

angular.module('transmartBaseUi')
    .controller('AnalysisCtrl',
        ['$scope', '$rootScope', 'Restangular', 'ChartService', 'AlertService', '$stateParams', '$log',
            '$state', 'StudyListService', 'GridsterService', '$uibModal',
            function ($scope, $rootScope, Restangular, ChartService, AlertService, $stateParams, $log,
                      $state, StudyListService, GridsterService, $uibModal) {

                // Initialize the chart service only if uninitialized
                if (!ChartService.cs.isInitialized) {
                    ChartService.reset();
                }

                // Alerts
                $scope.close = AlertService.remove;
                $scope.alerts = AlertService.get();

                // Gridster
                $scope.gridsterOpts = GridsterService.options;

                // Charts
                $scope.cs = ChartService.cs;

                $scope.$watchCollection(function () {
                    return ChartService.cs.labels;
                }, function (newV, oldV) {
                    if (!_.isEqual(newV, oldV)) {
                        ChartService.updateDimensions();
                    }
                });

                // Tabs
                $scope.tabs = [
                    {title: 'Cohort Selection', active: true},
                    {title: 'Cohort Grid', active: false},
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
                    $state.go('workspace', {action: tabAction});
                };

                if ($stateParams !== undefined) {
                    if ($stateParams.action === 'cohortGrid') {
                        $scope.activateTab($scope.tabs[1].title, 'cohortGrid');
                    } else {
                        $scope.activateTab($scope.tabs[0].title, 'cohortSelection');
                    }
                }

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
                    ChartService.reset();
                    ChartService.updateDimensions();
                };

                /**
                 * Callback for node drop
                 * @param event
                 * @param info
                 * @param node Dropped node from the study tree
                 */
                $scope.onNodeDropEvent = function (event, info, node) {
                    ChartService.onNodeDrop(node);
                };

                /**
                 * Saves the cohort by asking for a name, saving it to the backend
                 * and showing the resulting id
                 */
                $scope.openSaveCohortModal = function () {
                    $uibModal.open({
                        templateUrl: 'app/components/save-cohort/save-cohort-dialog.tpl.html',
                        controller: 'SaveCohortDialogCtrl',
                        animation: false
                    });
                };

            }]);
