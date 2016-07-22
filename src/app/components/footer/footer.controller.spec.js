'use strict';

describe('FooterCtrl', function () {
    beforeEach(module('transmartBaseUi'));

    var ctrl, scope;

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('FooterCtrl', {$scope: scope});
    }));

    describe('Footer', function () {
        it('expects version to be defined.', function () {
            expect(ctrl.version).toBeDefined();
        });

    });

});
