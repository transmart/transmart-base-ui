'use strict';

describe('NavbarCtrl', function () {

    beforeEach(module('transmartBaseUi'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));


    describe('$scope', function () {
        var $scope;

        beforeEach(inject(function (_$controller_) {
            $scope = {};
            var controller = $controller('NavbarCtrl', {$scope: $scope});
        }));

        it('should define navigations', function () {
            expect($scope.navigations).toBeDefined();
        });
    });

});
