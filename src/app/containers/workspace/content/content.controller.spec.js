'use strict';

describe('ContentCtrl', function () {
    var $controller, AlertService, CohortSelectionService, ctrl, ctrlElm, rootScope, scope;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _AlertService_, _CohortSelectionService_) {
        rootScope = _$rootScope_;
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        AlertService = _AlertService_;
        CohortSelectionService = _CohortSelectionService_;

        var params = {
            action: 'cohortGrid'
        }
        ctrlElm = angular.element('<div></div>');

        ctrl = $controller('ContentCtrl',
            {
                $scope: scope,
                $element: ctrlElm,
                $stateParams: params
            });
    }));

    describe('Initialization of controller', function () {

        it('should initialize the selectedSubjects and the labels arrays', function () {
            expect(ctrl.selectedSubjects).toBeDefined();
            expect(ctrl.selectedSubjects.length).toEqual(0);
            expect(ctrl.labels).toBeDefined();
            expect(ctrl.labels.length).toEqual(0);
        });

        it('should initialize the tabs configuration', function () {
            var tabs = [
                {title: 'Cohort Selection', active: false},
                {title: 'Cohort Grid', active: true},
                {title: 'Saved Cohorts', active: false}
            ];
            expect(ctrl.tabs).toBeDefined();
            expect(ctrl.tabs[0].title).toBe(tabs[0].title);
            expect(ctrl.tabs[0].active).toBe(tabs[0].active);
            expect(ctrl.tabs[1].title).toBe(tabs[1].title);
            expect(ctrl.tabs[1].active).toBe(tabs[1].active);
            expect(ctrl.tabs[2].title).toBe(tabs[2].title);
            expect(ctrl.tabs[2].active).toBe(tabs[2].active);
        });

        it('should change tab when params change', function () {
            var params = {
                action: 'cohortView'
            }
            ctrl = $controller('ContentCtrl',
                {
                    $scope: scope,
                    $element: ctrlElm,
                    $stateParams: params
                });
            expect(ctrl.tabs[0].active).toBe(false);
            expect(ctrl.tabs[1].active).toBe(false);
            expect(ctrl.tabs[2].active).toBe(true);

            params.action = 'cohortSelection';
            ctrl = $controller('ContentCtrl',
                {
                    $scope: scope,
                    $element: ctrlElm,
                    $stateParams: params
                });
            expect(ctrl.tabs[0].active).toBe(true);
            expect(ctrl.tabs[1].active).toBe(false);
            expect(ctrl.tabs[2].active).toBe(false);
        });

        it('should define activateTab function', function () {
            expect(ctrl.activateTab).toBeDefined();
        })

    });

    describe('updateCohortSelectionData', function () {
        var subject1, box1;

        beforeEach(function () {
            subject1 = {
                id: 'subjectId1',
                observations: {
                    'a/concept/path': 'a-concept-value'
                }
            }

            box1 = {
                boxId: 'boxid1',
                ctrl: {
                    cs: {
                        subjects: [subject1]
                    }
                }
            }

            CohortSelectionService.boxes = [box1];

        });

        it('should iterate over CohortSelectionService.boxes', function () {
            spyOn(CohortSelectionService.boxes, 'forEach').and.callThrough();
            spyOn(box1.ctrl.cs.subjects, 'forEach').and.callThrough();
            spyOn(_, 'find');
            ctrl.updateCohortSelectionData();
            expect(CohortSelectionService.boxes.forEach).toHaveBeenCalled();
            expect(box1.ctrl.cs.subjects.forEach).toHaveBeenCalled();
            expect(_.find).toHaveBeenCalled();
        });

        it('should return subject observation dictionary', function () {
            var subjectObs = ctrl.updateCohortSelectionData();
            expect(subjectObs[0].id).toBe(subject1.id);
            expect(subjectObs[0].observations).toBe(subject1.observations);
        });
    });
});
