'use strict';

describe('Unit testing cohort-chart directive', function () {
    var $compile, rootScope, scope, chartElm, CohortChartMocks, broadcastOnRootScope, ChartService, GridsterServiceMocks;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });
    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_, _CohortChartMocks_, _ChartService_, _GridsterServiceMocks_) {
        // The injector unwraps the underscores (_) from around the parameter
        // names when matching
        $compile = _$compile_;
        rootScope = _$rootScope_;
        scope = rootScope.$new();
        GridsterServiceMocks = _GridsterServiceMocks_;
        ChartService = _ChartService_;
        CohortChartMocks = _CohortChartMocks_;

        if (!ChartService.cs.mainDimension) {
            ChartService.reset();
        }

        scope.gridsterOpts = GridsterServiceMocks.getGridsterOptions();
        scope.gridsterItem = GridsterServiceMocks.getGridsterItem();
        scope.gridster = GridsterServiceMocks.getGridster();

        scope.labels = CohortChartMocks.getMockLabels();
        scope.label = scope.labels[0];

        var chartHtml = '<ts-cohort-chart class="chart-container" ts-gridster-item="gridsterItem" ts-label="label" ts-gridster="gridster"></ts-cohort-chart>';

        // Compile a piece of HTML containing the directive
        chartElm = $compile(chartHtml)(scope);

        scope.$digest();
    }));

    it('should contain ts-cohort-chart-container', function () {
        expect(chartElm.html()).toContain('chart-container');
    });

    it('should group charts', function() {
        spyOn(ChartService, 'groupCharts');

        // Call group action from isolated directive scope
        chartElm.isolateScope().groupAction();
        expect(ChartService.groupCharts).toHaveBeenCalled();
    });

    it('should have the correct title set', function() {
        expect(chartElm.isolateScope().title).toEqual('Age - GSE8581');
    });

    it('should be able to remove a label ', function() {
        spyOn(ChartService, 'removeLabel');

        // Use beforeEach scoped label
        var label = scope.label;
        chartElm.isolateScope().removeChart(label);
        expect(ChartService.removeLabel).toHaveBeenCalledWith(label);
    });

    it('should be able to clear a filter ', function() {
        spyOn(ChartService, 'clearChartFilterByLabel');

        // Use beforeEach scoped label
        var label = scope.label;
        chartElm.isolateScope().clearFilter(label);
        expect(ChartService.clearChartFilterByLabel).toHaveBeenCalledWith(label);
    });
});
