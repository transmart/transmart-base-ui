'use strict';

angular.module('transmartBaseUi')
    .controller('ContentCtrl',
        ['$scope', '$window', '$element', 'CohortSelectionService', 'ContentService',
            'AlertService', '$state', '$stateParams',
            function ($scope, $window, $element, CohortSelectionService, ContentService,
                      AlertService, $state, $stateParams) {
                var vm = this;
                vm.selectedSubjects = [];
                vm.labels = [];

                if(CohortSelectionService.boxes.length > 0) {
                    var oldBoxes = _.clone(CohortSelectionService.boxes);
                    CohortSelectionService.boxes = [];
                    oldBoxes.forEach(function (oldBox) {
                        var box = CohortSelectionService.addBox();
                        box.checked = oldBox.checked;
                        box.duplication = oldBox;
                    });
                } else {
                    CohortSelectionService.addBox();
                }

                // Alerts
                vm.close = AlertService.remove;
                vm.alerts = AlertService.get();

                vm.boxes = CohortSelectionService.boxes;
                vm.el = $element;
                vm.tabs = ContentService.tabs;
                vm.activeTabIndex = 0;

                /**
                 * Activate tab
                 * @param tabTitle
                 * @param tabAction
                 * @param el - the content's element
                 */
                vm.activateTab = function (tabTitle, tabAction) {
                    vm.tabs.forEach(function (tab, index) {
                        tab.active = (tab.title === tabTitle);
                        if (tab.active) {
                            vm.activeTabIndex = index;
                        }
                    });

                    var cohortSelectionBox =
                        angular.element(vm.el).find(document.querySelector('.cohort-selection-box'));
                    if (cohortSelectionBox.hasClass('ui-layout-hidden')) {
                        cohortSelectionBox.removeClass('ui-layout-hidden');
                    }
                };


                if ($stateParams !== undefined) {
                    switch ($stateParams.action) {
                        case 'cohortGrid':
                            vm.activateTab(vm.tabs[1].title, 'cohortGrid');
                            break;
                        case 'cohortView':
                            vm.activateTab(vm.tabs[2].title, 'cohortView');
                            break;
                        case 'dataExport':
                            vm.activateTab(vm.tabs[3].title, 'dataExport');
                            break;
                        case 'dataExportJobs':
                            vm.activateTab(vm.tabs[4].title, 'dataExportJobs');
                            break;
                        default:
                            vm.activateTab(vm.tabs[0].title, 'cohortSelection');
                    }
                }

                vm.updateCohortSelectionData = function () {
                    /*
                     * Create dictionary array
                     * each element: {id: subjectId, observations: observations}
                     */
                    var subjectObs = [];
                    CohortSelectionService.boxes.forEach(function (box) {
                        box.ctrl.cs.subjects.forEach(function (subject) {
                            var _subject = _.find(subjectObs, {id: subject.id});
                            if (!_subject) {
                                subjectObs.push({
                                    id: subject.id,
                                    observations: subject.observations
                                });
                            }
                            else {
                                for (var key in subject.observations) {
                                    _subject.observations[key] = subject.observations[key];
                                }
                            }
                        });
                    });

                    /*
                     * merge selected subjects and labels in multiple cohort-panels
                     */
                    vm.selectedSubjects = [];
                    vm.labels = [];
                    var uniqueSubjects = [];

                    //for each cohort-selection box
                    CohortSelectionService.boxes.forEach(function (box) {
                        if (box.checked) {
                            box.ctrl.cs.selectedSubjects.forEach(function (subject) {
                                var uSubject = _.find(uniqueSubjects, {id: subject.id});
                                if (!uSubject) {
                                    uSubject = _.clone(subject);
                                    uSubject.boxes = [box];
                                    uniqueSubjects.push(uSubject);
                                }
                                else {
                                    uSubject.boxes.push(box);
                                }
                                subject.boxes = uSubject.boxes;

                                var obs = _.find(subjectObs, {id: subject.id});
                                if (obs) {
                                    for (var key in obs.observations) {
                                        uSubject.observations[key] = obs.observations[key];
                                    }
                                }
                            });
                            box.ctrl.cs.labels.forEach(function (label) {
                                var foundLabel = _.find(vm.labels, {conceptPath: label.conceptPath});
                                if (!foundLabel) {
                                    vm.labels.push(label);
                                }
                            });
                        }
                    });

                    vm.selectedSubjects = uniqueSubjects;

                    return subjectObs;
                };

                $scope.$on('cohortSelectionUpdateEvent', function (event) {
                    vm.updateCohortSelectionData();
                });

                ContentService.ctrl = vm;

            }]);
