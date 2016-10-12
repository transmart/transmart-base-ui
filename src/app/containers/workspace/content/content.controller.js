'use strict';

angular.module('transmartBaseUi')
    .controller('ContentCtrl',
        ['$scope', '$window', '$element', 'CohortSelectionService', 'AlertService', '$stateParams', '$state',
            function ($scope, $window, $element, CohortSelectionService, AlertService, $stateParams, $state) {
                var vm = this;
                vm.selectedSubjects = [];
                vm.labels = [];

                CohortSelectionService.boxes = [];
                CohortSelectionService.addBox();

                vm.boxes = CohortSelectionService.boxes;
                vm.el = $element;

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

                    var cohortSelectionBox =
                        angular.element($element).find(document.querySelector('.cohort-selection-box'));
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
                            if(!_subject) {
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
                                if(obs) {
                                    for(var key in obs.observations) {
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

            }]);
