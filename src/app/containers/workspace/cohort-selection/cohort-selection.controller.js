'use strict';

angular.module('transmartBaseUi')
    .controller('CohortSelectionCtrl',
        ['$scope', 'ChartService', 'AlertService', '$stateParams', '$log',
            '$state', 'StudyListService', 'GridsterService', '$uibModal',
            function ($scope, ChartService, AlertService, $stateParams, $log,
                      $state, StudyListService, GridsterService, $uibModal) {
                var vm = this;
                vm.workspaceId = 'workspace_0';

                ChartService.addWorkspace(vm.workspaceId);
                ChartService.restoreCrossfilter(vm.workspaceId);
                // Initialize the chart service only if uninitialized
                if (!ChartService.cs[vm.workspaceId].mainDimension) {
                    ChartService.reset(vm.workspaceId);
                }

                // Alerts
                vm.close = AlertService.remove;
                vm.alerts = AlertService.get();

                // Gridster
                vm.gridsterOpts = GridsterService.options;

                // Charts
                vm.cs = ChartService.cs[vm.workspaceId];
                vm.selectedSubjects = ChartService.cs[vm.workspaceId].selectedSubjects;

                $scope.$watchCollection(function () {
                   return ChartService.cs[vm.workspaceId].selectedSubjects;
                }, function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        vm.selectedSubjects = newValue;
                    }
                });

                $scope.$watchCollection(function () {
                    return ChartService.cs[vm.workspaceId].labels;
                }, function (newV, oldV) {
                    if (!_.isEqual(newV, oldV)) {
                        ChartService.updateDimensions(vm.workspaceId);
                    }
                });

                // Tabs
                vm.tabs = [
                    {title: 'Cohort Selection', active: true},
                    {title: 'Cohort Grid', active: false},
                    {title: 'Saved Cohorts', active: false}
                ];

                /**
                 * Activate tab
                 * @param tabTitle
                 * @param tabAction
                 */
                vm.activateTab = function (tabTitle, tabAction) {
                    vm.tabs.forEach(function (tab) {
                        tab.active = tab.title === tabTitle;
                    });
                    $state.go('workspace', {action: tabAction});
                };

                if ($stateParams !== undefined) {
                    switch ($stateParams.action) {
                        case 'cohortGrid':
                            vm.activateTab(vm.tabs[1].title, 'cohortGrid');
                            break;
                        case 'cohortView':
                            vm.activateTab(vm.tabs[2].title, 'cohortView');
                            break;
                        default:
                            vm.activateTab(vm.tabs[0].title, 'cohortSelection');
                    }
                }

                // Every selected concept is represented by a label
                vm.cohortChartContainerLabels = GridsterService.cohortChartContainerLabels;

                // Watch labels container
                $scope.$watchCollection(function () {
                    return GridsterService.cohortChartContainerLabels;
                }, function (newVal, oldVal) {
                    if (!_.isEqual(newVal, oldVal)) {
                        vm.cohortChartContainerLabels = newVal;
                    }
                });

                /**
                 * Update quantity of containers necessary for displaying the graphs in
                 * cohort selection.
                 * @param event Unused
                 * @param labels Corresponding to selected concepts
                 */
                $scope.$on('prepareChartContainers', function (event, labels) {
                    vm.cohortChartContainerLabels = GridsterService.resize('#main-chart-container', labels, false);
                });

                /**
                 * Removes a label and thus a concept form the selection
                 * @param label Corresponding to concept to be removed
                 */
                vm.removeLabel = function (label) {
                    ChartService.removeLabel(label);
                };

                /**
                 * Remove all the concepts from the cohort selection
                 */
                vm.resetActiveLabels = function () {
                    ChartService.reset(vm.workspaceId);
                    ChartService.updateDimensions(vm.workspaceId);
                };

                /**
                 * Callback for node drop
                 * @param event
                 * @param info
                 * @param node Dropped node from the study tree
                 */
                vm.onNodeDropEvent = function (event, info, node) {
                    ChartService.onNodeDrop(node, vm.workspaceId);
                    angular.element(event.target).removeClass('chart-container-hover');
                };

                /**
                 * Add class when on node over the chart container
                 * @param e
                 */
                vm.onNodeOver = function (e) {
                    return angular.element(e.target).addClass('chart-container-hover');
                };

                /**
                 * Remove class when on node over the chart container
                 * @param e
                 */
                vm.onNodeOut = function (e) {
                    angular.element(e.target).removeClass('chart-container-hover');
                };

                /**
                 * Saves the cohort by asking for a name, saving it to the backend
                 * and showing the resulting id
                 */
                vm.openSaveCohortModal = function () {
                    $uibModal.open({
                        templateUrl: 'app/components/save-cohort/save-cohort-dialog.tpl.html',
                        controller: 'SaveCohortDialogCtrl as vm',
                        animation: false
                    });
                };

            }]);
