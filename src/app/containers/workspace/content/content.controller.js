'use strict';

angular.module('transmartBaseUi')
    .controller('ContentCtrl',
        ['$scope', '$window', '$element', 'CohortSelectionService', 'AlertService', '$stateParams', '$state',
            function ($scope, $window, $element, CohortSelectionService, AlertService, $stateParams, $state) {
                var vm = this;
                vm.selectedSubjects = [];
                vm.labels = [];
                CohortSelectionService.addBox();
                vm.boxes = CohortSelectionService.boxes;
                vm.el = $element;

                // Tabs
                vm.tabs = [
                    {title: 'Cohort Selection', active: true},
                    {title: 'Cohort Grid', active: false},
                    {title: 'Saved Cohorts', active: false}
                ];

                // Alerts
                vm.close = AlertService.remove;
                vm.alerts = AlertService.get();

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

                var _mergeCohortSelectionData = function () {
                    vm.selectedSubjects = [];
                    vm.labels = [];

                    //for each cohort-selection box
                    CohortSelectionService.boxes.forEach(function (box) {
                        box.ctrl.cs.selectedSubjects.forEach(function (subject) {
                            if(vm.selectedSubjects.indexOf(subject) == -1) {
                                vm.selectedSubjects.push(subject);
                            }
                        });
                        box.ctrl.cs.labels.forEach(function (label) {
                            if(vm.labels.indexOf(label) == -1) {
                                vm.labels.push(label);
                            }
                        });
                    });
                }

                $scope.$on('cohortSelectionUpdateEvent', function (event) {
                    _mergeCohortSelectionData();
                });

                angular.element($window).bind('resize', function () {
                    CohortSelectionService.boxes.forEach(function (box) {
                        box.ctrl.resize(true);
                    });
                });

            }]);
