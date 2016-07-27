'use strict';

describe('Unit testing for HomeCtrl', function () {

    beforeEach(module('transmartBaseUi'));

    var $scope, ctrl, $rootScope, controller;

    beforeEach(function () {
        inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();

            var $controller = $injector.get('$controller');

            ctrl = $controller('HomeCtrl', {$scope: $scope});
        });
    });

    describe('test cases', function () {

        it('should define tutorial', function () {
            $rootScope.$broadcast('howManyStudiesLoaded', true);
            expect(ctrl.tutorial).toBeDefined();
        });

    });
});
