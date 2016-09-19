'use strict';

describe('CohortSelectionCtrl', function () {
    var $controller, AlertService, CohortSelectionService,
        DcChartsService, Restangular, CohortChartMocks, ctrl, scope;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _AlertService_, _$rootScope_, _CohortSelectionService_,
                                _DcChartsService_, _Restangular_, _CohortChartMocks_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        AlertService = _AlertService_;
        CohortSelectionService = _CohortSelectionService_;
        DcChartsService = _DcChartsService_;
        Restangular = angular.copy(_Restangular_, Restangular);
        CohortChartMocks = _CohortChartMocks_;
        scope.labels = CohortChartMocks.getMockLabels();
        scope.label = scope.labels[0];

        var ctrlElm = angular.element('<div></div>');
        ctrl = $controller('CohortSelectionCtrl', {$scope: scope, $element: ctrlElm});
        spyOn(AlertService, 'get');
        scope.$digest();

    }));

    describe('Initialization of controller', function () {
        it('should initialize the cs object', function () {
            expect(ctrl.cs).toBeDefined();
            expect(ctrl.cs.subjects).toBeDefined();
            expect(ctrl.cs.selectedSubjects).toBeDefined();
            expect(ctrl.cs.chartId).toBeDefined();
            expect(ctrl.cs.charts).toBeDefined();
            expect(ctrl.cs.crossfilter).toBeDefined();
            expect(ctrl.cs.dimensions).toBeDefined();
            expect(ctrl.cs.maxNoOfDimensions).toBeDefined();
            expect(ctrl.cs.groups).toBeDefined();
            expect(ctrl.cs.labels).toBeDefined();
            expect(ctrl.cs.selected).toBeDefined();
            expect(ctrl.cs.total).toBeDefined();
            expect(ctrl.cs.mainDimension).toBeDefined();

        });
    });

    describe('removeLabel', function () {
        beforeEach(function () {
            var filterFunc = function (filters) {
                return filters;
            }
            ctrl.cs.charts = [
                {id: 1, filter: filterFunc},
                {id: 2, filter: filterFunc},
                {id: 3, filter: filterFunc}
            ];
            ctrl.cs.labels = [
                {labelId: 1},
                {labelId: 2},
                {labelId: 3}
            ]
        });

        it('should be able to remove a label ', function () {
            spyOn(ctrl, 'removeLabel');
            ctrl.removeLabel(scope.label);
            expect(ctrl.removeLabel).toHaveBeenCalledWith(scope.label);
        });

        it('should remove chart from charts', function () {
            var _label = {
                labelId: 2
            }
            spyOn(ctrl, 'removeLabel').and.callThrough();
            spyOn(ctrl, 'filterSubjectsByLabel');
            ctrl.removeLabel(_label);
            expect(ctrl.cs.charts.length).toBe(2);
            expect(ctrl.cs.labels.length).toBe(2);
            expect(ctrl.filterSubjectsByLabel).toHaveBeenCalled();
        });
    });

    describe('clearSelection', function () {
        it('should be able to clear the current cohort selection', function () {
            spyOn(ctrl, 'reset');
            spyOn(ctrl, 'updateDimensions');

            ctrl.clearSelection();
            expect(ctrl.reset).toHaveBeenCalled();
            expect(ctrl.updateDimensions).toHaveBeenCalled();
        });
    });

    describe('onNodeDrop', function () {
        var pieNode = {}, node = {},
            chart = {
                filter: function (word) {
                },
                render: function () {
                }
            },
            chartName = "parent/restobj/fullname";

        var event = {};
        event.target = '<div class="chart-container-hover"></div>';
        var info = {};

        beforeEach(function () {
            pieNode.type = 'CATEGORICAL_OPTION';
            pieNode.parent = node;

            node.type = '';
            node.restObj = {};
            node.restObj.fullName = chartName;

            ctrl.cs = {};
            ctrl.cs.charts = [];
        });

        it('should invoke addNodeToActiveCohortSelection when a pieNode is newly dropped', function () {
            var filters = [{
                label: 'parent/restobj/fullname',
                filterWords: [undefined]
            }];

            spyOn(ctrl, 'onNodeDrop').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');
            ctrl.onNodeDrop(event, info, pieNode);
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(event, info, pieNode);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, filters);
        });

        it('should not invoke addNodeToActiveCohortSelection upon node-dropping when the pie-chart exists', function () {
            chart.tsLabel = {};
            chart.tsLabel.label = chartName;
            chart.filters = function () {
                return [];
            };
            ctrl.cs.charts.push(chart);

            spyOn(ctrl, 'onNodeDrop').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');
            spyOn(ctrl, 'updateDimensions');

            ctrl.onNodeDrop(event, info, pieNode);
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(event, info, pieNode);
            expect(ctrl.addNodeToActiveCohortSelection).not.toHaveBeenCalled();
        });

        it('should invoke addNodeToActiveCohortSelection with node when the node is dropped', function () {
            spyOn(ctrl, 'onNodeDrop').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');

            ctrl.onNodeDrop(event, info, node);
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(event, info, node);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalled();
        });

        it('should act on a node drop event', function () {
            var nodes = CohortChartMocks.getNodes();
            var dropEvent = CohortChartMocks.getDropEvent();

            spyOn(ctrl, 'onNodeDrop');
            angular.element(dropEvent.target).addClass('chart-container-hover');
            ctrl.onNodeDrop(dropEvent, {}, nodes);
            expect(ctrl.onNodeDrop).toHaveBeenCalledWith(dropEvent, {}, nodes);
            expect(!angular.element(dropEvent.target).hasClass('chart-container-hover'));
        });
    });

    describe('restoreCrossfilter', function () {
        var fullSubjects = [
            {
                id: 1, gender: 'male'
            },
            {
                id: 2, gender: 'female'
            },
            {
                id: 3, gender: 'male'
            },
            {
                id: 4, gender: 'female'
            },
            {
                id: 5, gender: 'unknown'
            }
        ];

        var partialSubjects = [
            {
                id: 1, gender: 'male'
            },
            {
                id: 2, gender: 'female'
            },
            {
                id: 5, gender: 'unknown'
            }
        ];

        it('should restore the crossfilter dimension(s)', function () {
            ctrl.cs.crossfilter = crossfilter(partialSubjects);
            var dimChanged = ctrl.cs.crossfilter.dimension(function (d) {
                return d.gender;
            });
            expect(dimChanged.top(Infinity).length).toEqual(3);

            var restorationPerformed = ctrl.restoreCrossfilter();
            expect(restorationPerformed).toEqual(false);

            ctrl.cs.subjects = fullSubjects;
            restorationPerformed = ctrl.restoreCrossfilter();
            var dimRestored = ctrl.cs.crossfilter.dimension(function (d) {
                return d.gender;
            });
            expect(restorationPerformed).toEqual(true);
            expect(dimRestored.top(Infinity).length).toEqual(5);
        });
    });

    describe('filterSubjectsByLabel', function () {
        var _subjects, _label, _labelNo;

        beforeEach(function () {
            _subjects = [
                {
                    subject: 1,
                    labels: ['label1', 'label2', 'label3']
                },
                {
                    subject: 2,
                    labels: ['label1']
                }
            ];
            _label = {labelId: 0};
            _labelNo = {labelId: 99};
        });

        it('should remove label from subject labels', function () {
            var _res = ctrl.filterSubjectsByLabel(_subjects, _label);
            expect(_res[0].labels[0]).not.toContain('label1');
        });

        it('should not remove subject from subject array if subject still has labels', function () {
            var _res = ctrl.filterSubjectsByLabel(_subjects, _label);
            expect(_res[0].subject).toEqual(1)
        });

        it('should remove subject from subject array if subject has empty labels', function () {
            var _subject2Tmp = _subjects[1],
                _res = ctrl.filterSubjectsByLabel(_subjects, _label);
            expect(_res).not.toContain(_subject2Tmp);
        });

        it('should not remove any subject labels nor subject if label does not exist in any subject labels', function () {
            var _res = ctrl.filterSubjectsByLabel(_subjects, _labelNo);
            expect(_res.length).toEqual(2);
            expect(_res[0].labels.length).toEqual(3);
            expect(_res[1].labels.length).toEqual(1);
        });

    });

    describe('clearChartFilterByLabel', function () {
        var _charts, _label, _labelNotExist, _filter = function (x) {
        };

        beforeEach(function () {
            var boxId = ctrl.boxId;
            ctrl.reset();
            _charts = [
                {id: 0, filter: _filter},
                {id: 1, filter: _filter},
                {id: 2, filter: _filter}
            ];
            _label = {labelId: 2, boxId: boxId};
            _labelNotExist = {labelId: 3, boxId: boxId};

            ctrl.cs.charts = _charts;

            spyOn(ctrl, 'updateDimensions');
        });

        it('should return undefined when label does not match with the charts', function () {
            var _res = ctrl.clearChartFilterByLabel(_labelNotExist);
            expect(_res).toEqual(undefined);
        });

        it('should clear filter on a chart by given label', function () {
            spyOn(_charts[2], 'filter');
            ctrl.clearChartFilterByLabel(_label);
            expect(_charts[2].filter).toHaveBeenCalledWith(null);
        });

        it('should invoke dc.redrawAll', function () {
            spyOn(dc, 'redrawAll');
            ctrl.clearChartFilterByLabel(_label);
            expect(dc.redrawAll).toHaveBeenCalled();
        });

        it('should invoke updateDimensions', function () {
            ctrl.clearChartFilterByLabel(_label);
            expect(ctrl.updateDimensions).toHaveBeenCalled();
        });

    });

    describe('addNodeToActiveCohortSelection', function () {
        var node = {};

        beforeEach(function () {
            node.restObj = Restangular;
        });

        it('should make restangular call when adding node to active cohort selection', function () {
            spyOn(ctrl, 'addNodeToActiveCohortSelection').and.callThrough();
            spyOn(node.restObj, 'one').and.callThrough();

            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, []);
            expect(node.restObj.one).toHaveBeenCalled();
        });
    });

    describe('createCohortChart', function () {
        var label, el, subjects;

        beforeEach(function () {
            label = {
                $$hashKey: "object:306",
                col: 0,
                row: 0,
                filter: undefined,
                label: "/Public Studies/AAA_TRANSLOCATION/Gender/",
                labelId: 0,
                name: "Gender",
                resolved: false,
                sizeX: 3,
                sizeY: 3,
                type: "string",
                boxId: ctrl.boxId
            };
            el = document.createElement('div');
            subjects = [{
                id: 1, gender: 'male', labels: {}
            }, {
                id: 2, gender: 'female', labels: {}
            }, {
                id: 3, gender: 'male', labels: {}
            }, {
                id: 4, gender: 'female', labels: {}
            }, {
                id: 5, gender: 'unknown', labels: {}
            }];
        });

        it('should listen to the filtered and renderlet events', function () {
            var _chart = jasmine.createSpyObj('_chart', ['on', 'render']);
            var _func = jasmine.any(Function);

            spyOn(DcChartsService, 'getPieChart').and.returnValue(_chart);
            ctrl.createCohortChart(label, el);

            expect(_chart.on).toHaveBeenCalledWith('filtered', _func);
            expect(_chart.on).toHaveBeenCalledWith('renderlet', _func);

        });
    });

});
