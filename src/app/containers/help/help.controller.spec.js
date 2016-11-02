'use strict';


describe('HelpCtrl', function () {
    var scope, ctrl, ctrlElm, $controller;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
        scope = _$rootScope_.$new();
        $controller = _$controller_;

        ctrlElm = angular.element('<div></div>');
        ctrl = $controller('HelpCtrl', {$scope: scope, $element: ctrlElm});
        scope.$digest();
    }));

    it('Initialization', function () {
        expect(ctrl.gitInfo).toBeDefined();
    })
});
