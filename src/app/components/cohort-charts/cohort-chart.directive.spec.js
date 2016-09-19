'use strict';

describe('Unit testing cohort-chart directive', function () {
    var ctrl, $controller, $compile, rootScope, ctrlScope, scope, chartElm, CohortChartMocks, CohortSelectionMocks;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });
    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$controller_, _$compile_, _$rootScope_, _CohortChartMocks_, _CohortSelectionMocks_) {
        // The injector unwraps the underscores (_) from around the parameter
        // names when matching
        $controller = _$controller_;
        $compile = _$compile_;
        rootScope = _$rootScope_;
        scope = rootScope.$new();
        ctrlScope = rootScope.$new();
        CohortSelectionMocks = _CohortSelectionMocks_;
        CohortChartMocks = _CohortChartMocks_;

        scope.gridsterOpts = CohortSelectionMocks.getGridsterOptions();
        scope.gridsterItem = CohortSelectionMocks.getGridsterItem();
        scope.gridster = CohortSelectionMocks.getGridster();
        scope.labels = CohortChartMocks.getMockLabels();
        scope.label = scope.labels[0];

        var boxId = CohortChartMocks.getBoxId();
        var ctrlElm = angular.element('<div id='+boxId+'></div>');
        ctrl = $controller('CohortSelectionCtrl', {$scope: ctrlScope, $element: ctrlElm});
        ctrlElm.scope = function () {
            return {
                box: {
                    ctrl: ctrl
                }
            }
        }

        spyOn(angular, 'element').and.returnValue(ctrlElm);

        var chartHtml = '<ts-cohort-chart class="chart-container" ts-gridster-item="gridsterItem" ts-label="label" ts-gridster="gridster"></ts-cohort-chart>';
        chartElm = $compile(chartHtml)(scope);

        scope.$digest();
    }));

    it('should contain ts-cohort-chart-container', function () {
        expect(chartElm.html()).toContain('chart-container');
    });

    it('should group charts', function() {
        spyOn(ctrl, 'groupCharts');

        // Call group action from isolated directive scope
        chartElm.isolateScope().groupAction();
        expect(ctrl.groupCharts).toHaveBeenCalled();
    });

    it('should have the correct title set', function() {
        expect(chartElm.isolateScope().title).toEqual('Age - GSE8581');
    });

    it('should be able to remove a label ', function() {
        spyOn(ctrl, 'removeLabel');

        // Use beforeEach scoped label
        var label = scope.label;
        chartElm.isolateScope().removeChart(label);
        expect(ctrl.removeLabel).toHaveBeenCalledWith(label);
    });

    it('should be able to clear a filter ', function() {
        spyOn(ctrl, 'clearChartFilterByLabel');

        // Use beforeEach scoped label
        var label = scope.label;
        chartElm.isolateScope().clearFilter(label);
        expect(ctrl.clearChartFilterByLabel).toHaveBeenCalledWith(label);
    });
});
