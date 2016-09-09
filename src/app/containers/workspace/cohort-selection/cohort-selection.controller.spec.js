'use strict';

describe('CohortSelectionCtrl', function () {
    var $controller, AlertService, ChartService, CohortChartMocks, ctrl, scope;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _AlertService_, _$rootScope_, _ChartService_, _CohortChartMocks_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        AlertService = _AlertService_;
        ChartService = _ChartService_;
        CohortChartMocks = _CohortChartMocks_;
        spyOn(ChartService, 'reset');
        spyOn(ChartService, 'restoreCrossfilter');
        spyOn(AlertService, 'get');

        scope.labels = CohortChartMocks.getMockLabels();
        scope.label = scope.labels[0];

        ctrl = $controller('CohortSelectionCtrl', {$scope: scope});
    }));

    describe('Initialization of controller', function() {
        it('should restore the cross filter by default ', function() {
            expect(ChartService.restoreCrossfilter).toHaveBeenCalled();
        });

        it('should initialize / reset the ChartService when no dimensions have been defined. ', function() {
            ChartService.cs.mainDimension = null;
            expect(ChartService.reset).toHaveBeenCalled();
        });

        it('should retrieve all the active alerts ', function() {
           expect(AlertService.get).toHaveBeenCalled();
        });
    });

    describe('controller functions ', function() {
        it('should be able to remove a label ', function() {
            spyOn(ChartService, 'removeLabel');
            ctrl.removeLabel(scope.label);
            expect(ChartService.removeLabel).toHaveBeenCalledWith(scope.label);
        });

        it('should be able to reset all active labels', function() {
            spyOn(ChartService, 'updateDimensions');

            ctrl.resetActiveLabels();
            expect(ChartService.reset).toHaveBeenCalled();
            expect(ChartService.updateDimensions).toHaveBeenCalled();
        });

        it('should act on a node drop event', function() {
            var nodes = CohortChartMocks.getNodes();
            var dropEvent = CohortChartMocks.getDropEvent();

            spyOn(ChartService, 'onNodeDrop');
            angular.element(dropEvent.target).addClass('chart-container-hover');
            ctrl.onNodeDropEvent(dropEvent, {}, nodes);
            expect(ChartService.onNodeDrop).toHaveBeenCalledWith(nodes, 'workspace_0');
            expect(!angular.element(dropEvent.target).hasClass('chart-container-hover'));
        });

        it('should add a css class when hovering a node over the drop box ', function() {
            // To Be Implemented
        });

        it('should remove a css class when the node is moved out of the drop box', function() {
            // To Be Implemented
        });

        it('should be able to open the save cohort modal', function() {
            // To Be Implemented
        });
    });
});
