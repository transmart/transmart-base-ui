'use strict';

describe('Unit testing for HomeCtrl', function () {

    beforeEach(module('transmartBaseUi'));

    var $scope, ctrl, $rootScope;

    beforeEach( inject(function (_$rootScope_, _$controller_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        ctrl = _$controller_('HomeCtrl', {$scope: $scope});
    }));

    describe('test cases', function () {
        it('should have the tutorial defaults defined', function() {
            expect(ctrl.tutorial).toBeDefined();
            expect(ctrl.tutorial.openStep1).toBeTruthy();
        });

        it('should listen to the studiesloaded event', function () {
            $rootScope.$broadcast('howManyStudiesLoaded', true);
            expect(ctrl.tutorial).toBeDefined();
            expect(ctrl.tutorial.openStep1).toBeFalsy();
            expect(ctrl.tutorial.openStep2).toBeTruthy();
        });

    });
});
