/**
 * Created by bo on 8/30/16.
 */
'use strict';

describe('DcChartsService Unit Tests', function () {
    var DcChartsService;

    // Setup
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_DcChartsService_) {
        DcChartsService = _DcChartsService_;
    }));

    describe('emphasizeChartLegend', function () {
        var divWithoutDcItems = '<div class="panel-body inner-chart dc-chart"><svg width="194.31" height="183"><g transform="translate(97.16,91.5)"><g class="pie-slice _0"><path fill="#1f77b4" d="M0,-82.351A82.351,82.351 0 1,1 -63.4,52.49L0,0Z"></path><title>female: 32</title></g><g class="pie-slice _1"><path fill="#aec7e8" d="M-63.4,52.49A82.351,82.351 0 0,1 0,-82.351L0,0Z"></path><title>male: 18</title></g></g></svg></div>';

        var divWithDcItems = '<div class="panel-body inner-chart dc-chart"><svg width="194.31" height="183"><g transform="translate(97.16,91.5)"><g class="pie-slice _0"><path fill="#1f77b4" d="M0,-82.351A82.351,82.351 0 1,1 -63.4,52.49L0,0Z"></path><title>female: 32</title></g><g class="pie-slice _1"><path fill="#aec7e8" d="M-63.4,52.49A82.351,82.351 0 0,1 0,-82.351L0,0Z"></path><title>male: 18</title></g></g><g class="dc-legend" transform="translate(0,9.15)"><g class="dc-legend-item" transform="translate(0,0)"><rect width="9.49" height="9.49" fill="#1f77b4"></rect><text x="11.49" y="8.7451" class="pie-legend-normal">female</text></g><g class="dc-legend-item" transform="translate(0,13.15)"><rect width="9.49" height="9.49" fill="#aec7e8"></rect><text x="11.49" y="8.7451" class="pie-legend-normal">male</text></g></g></svg></div>';

        var chart = {
            tsLabel: {
                filters: []
            },
            data: function () {
                return [1, 2];
            }
        }

        it('should add "pie-legend-bold" class to text tags with filters and "dc-legend-item" tags', function () {
            chart.tsLabel.filters = ['female'];
            chart.el = divWithDcItems;
            var items = DcChartsService.emphasizeChartLegend(chart);
            expect(items.length).toEqual(1);
            expect(items[0].hasClass('pie-legend-bold')).toBe(true);
        });

        it('should not add "pie-legend-bold" class to text tags without filters or "dc-legend-item" tags', function () {
            chart.tsLabel.filters = [];
            chart.el = divWithDcItems;
            var items = DcChartsService.emphasizeChartLegend(chart);
            expect(items.length).toEqual(0);

            chart.tsLabel.filters = ['male'];
            chart.el = divWithoutDcItems;
            items = DcChartsService.emphasizeChartLegend(chart);
            expect(items.length).toEqual(0);
        });

    });

});
