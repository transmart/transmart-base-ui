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

    describe('resizeChart', function () {

        var chart;

        beforeEach(function () {
            chart = {
                _width: undefined,
                _height: undefined,
                length: undefined,
                width: function () {
                },
                height: function () {
                },
                radius: function () {
                },
                slicesCap: function () {
                },
                legend: function () {
                },
                legendText: function () {
                },
                margins: function () {
                },
                group: function () {
                },
                tickValues: function () {
                },
                ticks: function () {
                },
                keyAccessor: function () {
                },
                valueAccessor: function () {
                },
                colorAccessor: function () {
                },
                symbolSize: function () {
                },
                all: function () {
                },
                rescale: function () {
                },
                redraw: function () {
                },
                render: function () {
                },
                xAxis: function () {
                },
                yAxis: function () {
                },
                _opt: {},
                gridInfo: {
                    sizeX: 1,
                    sizeY: 1,
                    curColWidth: 250,
                    curRowHeight: 260
                }
            };
            spyOn(chart, 'width').and.callFake(function (_w) {
                if (_w) {
                    chart._width = _w;
                    return chart;
                }
                else {
                    return chart._width;
                }
            });
            spyOn(chart, 'height').and.callFake(function (_h) {
                if (_h) {
                    chart._height = _h;
                    return chart;
                }
                else {
                    return chart._height;
                }
            });
            spyOn(chart, 'radius').and.callFake(function () {
                return chart;
            });
            spyOn(chart, 'xAxis').and.callFake(function () {
                return chart;
            });
            spyOn(chart, 'yAxis').and.callFake(function () {
                return chart;
            });
            spyOn(chart, 'group').and.callFake(function () {
                return chart;
            });
            spyOn(chart, 'all').and.callFake(function () {
                return chart;
            });
            spyOn(chart, 'keyAccessor').and.callFake(function () {
                return chart;
            });
            spyOn(chart, 'valueAccessor').and.callFake(function () {
                return chart;
            });
            spyOn(chart, 'colorAccessor').and.callFake(function () {
                return chart;
            });
        });

        it('should calculate the right width and height', function () {
            DcChartsService.resizeChart(chart);
            expect(chart.width).toHaveBeenCalled();
            expect(chart.height).toHaveBeenCalled();
            expect(chart._width).toBe(200);
            expect(chart._height).toBe(200);
        });

        it('should call pie-chart-related functions if it is a pie chart', function () {
            chart.type = 'PIECHART';
            chart._opt.nolegend = false;
            spyOn(chart, 'slicesCap');
            spyOn(chart, 'legend');
            spyOn(chart, 'redraw');

            DcChartsService.resizeChart(chart);
            expect(chart.radius).toHaveBeenCalled();
            expect(chart.slicesCap).toHaveBeenCalled();
            expect(chart.legend).toHaveBeenCalled();
            expect(chart.redraw).toHaveBeenCalled();

        });

        it('should not call legend for pie chart when the flag is on', function () {
            chart.type = 'PIECHART';
            spyOn(chart, 'legend');
            chart._opt.nolegend = true;
            DcChartsService.resizeChart(chart);
            expect(chart.legend).not.toHaveBeenCalled();
        });

        it('should call bar-chart-related functions if it is a bar chart', function () {
            chart.type = 'BARCHART';
            spyOn(chart, 'rescale');
            spyOn(chart, 'redraw');

            DcChartsService.resizeChart(chart);
            expect(chart.xAxis).toHaveBeenCalled();
            expect(chart.yAxis).toHaveBeenCalled();
            expect(chart.rescale).toHaveBeenCalled();
            expect(chart.redraw).toHaveBeenCalled();
        });

        it('should call boxplot-related functions if it is a boxplot', function () {
            chart.type = 'BOXPLOT';
            spyOn(chart, 'margins');
            spyOn(chart, 'tickValues');
            spyOn(chart, 'ticks');
            spyOn(chart, 'render');

            DcChartsService.resizeChart(chart);
            expect(chart.margins).toHaveBeenCalled();
            expect(chart.group).toHaveBeenCalled();
            expect(chart.all).toHaveBeenCalled();
            expect(chart.tickValues).toHaveBeenCalled();
            expect(chart.ticks).toHaveBeenCalled();
            expect(chart.render).toHaveBeenCalled();
        });

        it('should call heatmap-related functions if it is a heatmap', function () {
            chart.type = 'HEATMAP';
            spyOn(chart, 'margins');
            spyOn(chart, 'redraw');

            DcChartsService.resizeChart(chart);
            expect(chart.keyAccessor).toHaveBeenCalled();
            expect(chart.valueAccessor).toHaveBeenCalled();
            expect(chart.colorAccessor).toHaveBeenCalled();
            expect(chart.redraw).toHaveBeenCalled();
        });

        it('should call scatterplot-related functions if it is a scatterplot', function () {
            chart.type = 'SCATTER';
            spyOn(chart, 'ticks');
            spyOn(chart, 'symbolSize');
            spyOn(chart, 'rescale');
            spyOn(chart, 'redraw');

            DcChartsService.resizeChart(chart);
            expect(chart.xAxis).toHaveBeenCalled();
            expect(chart.yAxis).toHaveBeenCalled();
            expect(chart.ticks).toHaveBeenCalled();
            expect(chart.symbolSize).toHaveBeenCalled();
            expect(chart.rescale).toHaveBeenCalled();
            expect(chart.redraw).toHaveBeenCalled();
        });

    });

});
