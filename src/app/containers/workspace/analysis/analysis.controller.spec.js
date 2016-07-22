'use strict';

describe('MainCtrl', function () {
    beforeEach(module('transmartBaseUi'));

    var $controller, AlertService;

    beforeEach(inject(function (_$controller_, _AlertService_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
        AlertService = _AlertService_;
    }));

    describe('MainPage', function () {
        var $scope, controller;

        beforeEach(function () {
            $scope = {};
            controller = $controller('AnalysisCtrl', {$scope: $scope});
        });
    });

});
