'use strict';

describe('ContentCtrl', function () {
    var $controller, AlertService, ctrl, ctrlElm, rootScope, scope;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _AlertService_, _$rootScope_) {
        rootScope = _$rootScope_;
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        AlertService = _AlertService_;
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

});
