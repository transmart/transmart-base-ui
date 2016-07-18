'use strict';

describe('Unit testing for HomeCtrl', function () {

    beforeEach(module('transmartBaseUi'));

    var $scope, $rootScope, controller, CreateTarget;

    beforeEach(function () {
        inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();

            var $controller = $injector.get('$controller');

            CreateTarget = function () {
                $controller('HomeCtrl', {$scope: $scope});
            };
        });
    });

    describe('test cases', function () {

        it('should define tutorial', function () {
            controller = new CreateTarget();
            $rootScope.$broadcast('howManyStudiesLoaded', true);
            expect($scope.tutorial).toBeDefined();
        });

    });
});
