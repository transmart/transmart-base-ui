'use strict';

describe('CohortSelectionCtrl', function () {
    var $controller, AlertService, CohortSelectionService, TreeNodeService,
        DcChartsService, Restangular, CohortChartMocks, ctrl, scope, $timeout,
        reDistribution;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_$controller_, _AlertService_, _$rootScope_, _CohortSelectionService_,
                                _DcChartsService_, _Restangular_, _CohortChartMocks_, _TreeNodeService_,
                                _$timeout_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        scope = _$rootScope_.$new();
        $controller = _$controller_;
        AlertService = _AlertService_;
        CohortSelectionService = _CohortSelectionService_;
        TreeNodeService = _TreeNodeService_;
        DcChartsService = _DcChartsService_;
        $timeout = _$timeout_;

        Restangular = angular.copy(_Restangular_, Restangular);
        CohortChartMocks = _CohortChartMocks_;
        scope.labels = CohortChartMocks.getMockLabels();
        scope.label = scope.labels[0];

        var ctrlElm = angular.element('<div></div>');
        ctrl = $controller('CohortSelectionCtrl', {$scope: scope, $element: ctrlElm});
        spyOn(AlertService, 'get');
        scope.$digest();

        reDistribution = {
            sizeAndPosition: 'relayout the charts completely',
            position: 'only relayout the positions of the charts',
            none: 'detect gaps and insert the new chart(s)'
        }

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
            };
            spyOn(ctrl, 'removeLabel').and.callThrough();
            spyOn(ctrl, 'filterSubjectsByLabel');
            spyOn(dc.chartRegistry, 'deregister');
            ctrl.removeLabel(_label);
            expect(ctrl.cs.charts.length).toBe(2);
            expect(ctrl.cs.labels.length).toBe(2);
            expect(ctrl.filterSubjectsByLabel).toHaveBeenCalled();
            expect(dc.chartRegistry.deregister).toHaveBeenCalled();
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

    describe('addNodeWithFilters', function() {
        var node = {},
            chartName = "parent/restobj/fullname",
            dcFilters = [['category1'], ['category2']];

        beforeEach(function () {
            node.type = '';
            node.restObj = {};
            node.restObj.fullName = chartName;
        });

        it('should invoke addNodeToActiveCohortSelection when a cohort filter is added', function () {
            var filters = [{
                label: 'parent/restobj/fullname',
                dcFilters: dcFilters
            }];

            spyOn(ctrl, 'addNodeWithFilters').and.callThrough();
            spyOn(ctrl, 'addNodeToActiveCohortSelection');
            ctrl.addNodeWithFilters(node, dcFilters)
            expect(ctrl.addNodeWithFilters).toHaveBeenCalledWith(node, dcFilters);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, filters);
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
                dcFilters: [undefined]
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
            chart.tsLabel.conceptPath = chartName;
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
                    observations: {
                        label1: 'label1',
                        label2: 'label2',
                        label3: 'label3'
                    }

                },
                {
                    subject: 2,
                    observations: {
                        label1: 'label1'
                    }
                }
            ];
            _label = {labelId: 0, conceptPath: 'label1'};
            _labelNo = {labelId: 99, conceptPath: 'label99'};
        });

        it('should remove label from subject labels', function () {
            var _res = ctrl.filterSubjectsByLabel(_subjects, _label);
            expect(_res[0].observations['label1']).not.toBeDefined();
        });

        it('should not remove any subject observations if label does not exist in any subject observations',
            function () {
                var _res = ctrl.filterSubjectsByLabel(_subjects, _labelNo);
                expect(_res[0].observations['label1']).toBeDefined();
                expect(_res[0].observations['label2']).toBeDefined();
                expect(_res[0].observations['label3']).toBeDefined();
                expect(_res[1].observations['label1']).toBeDefined();
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
        var childNode = {};

        beforeEach(function () {
            node.restObj = Restangular;
            node.restObj._links = {
                children: undefined
            };
            node.nodes = [];
            node.observations = [{
                value:  ''
            }];

            childNode.observations = [{
                value: ''
            }];

        });

        it('should try to retrieve child nodes when node.nodes = []', function () {
            spyOn(TreeNodeService, 'getNodeChildren').and.callThrough();
            ctrl.addNodeToActiveCohortSelection(node, []);

            expect(TreeNodeService.getNodeChildren).toHaveBeenCalledWith(node);
        });

        it('should call addNode and iterate over observations when ' +
            'node.nodes is empty and has categorical leaf child nodes', function () {
            TreeNodeService.getNodeChildren = function (_node) {
                return {
                    then: function (func) {
                        func();
                    }
                }
            };
            TreeNodeService.isCategoricalLeafNode = function (_node) {
                return true;
            };

            spyOn(ctrl, 'addNode');
            spyOn(node.observations, 'forEach');
            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(ctrl.addNode).toHaveBeenCalledWith(node);
            expect(node.observations.forEach).toHaveBeenCalled();
        });

        it('should call addNode and iterate over observations when ' +
            'node.nodes is non-empty and has categorical leaf child nodes', function () {
            node.nodes = [{
                id: 'aNode'
            }]
            TreeNodeService.isCategoricalLeafNode = function (_node) {
                return true;
            };

            spyOn(ctrl, 'addNode');
            spyOn(node.observations, 'forEach');
            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(ctrl.addNode).toHaveBeenCalledWith(node);
            expect(node.observations.forEach).toHaveBeenCalled();
        });

        it('should iterate over child nodes, call addNode, and iterate over child observations ' +
            'when node.nodes is non-empty and has no categorical leaf child node', function () {
            node.nodes = [childNode];
            TreeNodeService.isCategoricalLeafNode = function (_node) {
                return false;
            };

            spyOn(node.nodes, 'forEach').and.callThrough();
            spyOn(ctrl, 'addNode');
            spyOn(childNode.observations, 'forEach');
            ctrl.addNodeToActiveCohortSelection(node, []);
            expect(node.nodes.forEach).toHaveBeenCalled();
            expect(ctrl.addNode).toHaveBeenCalledWith(childNode);
            expect(childNode.observations.forEach).toHaveBeenCalled();
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

    describe('resetCharts', function () {
        var chart1, chart2;
        beforeEach(function () {
            ctrl.cs.charts = [];
            chart1 = {
                id: 'c1',
                filter: function () {
                }
            }
            chart2 = {
                id: 'c2',
                filter: function () {
                }
            }
            ctrl.cs.charts.push(chart1);
            ctrl.cs.charts.push(chart2);
            spyOn(chart1, 'filter');
            spyOn(chart2, 'filter');
            spyOn(ctrl, 'updateDimensions');
            spyOn(ctrl, 'reSizeAndPosition');
            spyOn(dc, 'redrawAll');

            ctrl.resetCharts();
        });

        it('should clear the filters of the charts', function () {
            expect(chart1.filter).toHaveBeenCalledWith(null);
            expect(chart2.filter).toHaveBeenCalledWith(null);
        });

        it('should update dimensions and reSizeAndPosition charts', function () {
            expect(ctrl.updateDimensions).toHaveBeenCalled();
            expect(ctrl.reSizeAndPosition).toHaveBeenCalled();
            expect(dc.redrawAll).toHaveBeenCalled();
        });
    });

    describe('applyDuplication', function () {
        var chart = {
            tsLabel: {
                conceptPath: 'concept/path'
            }
        }
        var node = {
            restObj: {
                fulllName: 'concept/path'
            }
        }
        var dupBox = {
            ctrl: {
                cs: {
                    nodes: [],
                    charts: []
                }
            }
        }

        it('should call addNodeToActiveCohortSelection', function () {
            dupBox.ctrl.cs.nodes.push(node);
            spyOn(ctrl, 'addNodeToActiveCohortSelection').and.callFake(function () {
                return {
                    then: function () {}

                }
            });

            ctrl.applyDuplication(dupBox);
            expect(ctrl.addNodeToActiveCohortSelection).toHaveBeenCalled();
        });


    });

    describe('addNode', function () {

        beforeEach(function () {
            ctrl.cs = {
                nodes: []
            }
        });

        it('should add node when it is not already existent', function () {
            expect(ctrl.cs.nodes.length).toBe(0);
            var node = {id: 'a_node'};
            ctrl.addNode(node);
            expect(ctrl.cs.nodes.length).toBe(1);
        });

        it('should not add node when it exits', function () {
            ctrl.cs.nodes.push({
                id: 'a_node'
            });
            var node = {id: 'a_node'};
            ctrl.addNode(node);
            expect(ctrl.cs.nodes.length).toBe(1);
        });
    });

    describe('removeNode', function () {
        beforeEach(function () {
            ctrl.cs = {
                nodes: []
            }
        });

        it('should remove node when it exists', function () {
            var node = {
                id: 'a_node',
                restObj: {
                    fullName: 'a_node_fullname'
                }
            };
            var label = {
                label: 'a_node_fullname'
            };
            ctrl.cs.nodes.push(node);
            expect(ctrl.cs.nodes.length).toBe(1);
            var result = ctrl.removeNode(label);
            expect(result).toBe(true);
            expect(ctrl.cs.nodes.length).toBe(0);
        });
    });

    describe('reSizeAndPosition', function () {
        beforeEach(function () {
            ctrl.cs.labels = [
                {
                    conceptPath: 'a/path/1',
                    sizeX: 2,
                    sizeY: 2
                },
                {
                    conceptPath: 'a/path/2',
                }
            ];
        });

        it('should reSizeAndPosition only when there are labels', function () {
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reSizeAndPosition();
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
            expect(Math.floor).toHaveBeenCalled();
        });

        it('should not reSizeAndPosition when there is no label', function () {
            ctrl.cs.labels = [];
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reSizeAndPosition();
            expect(ctrl.cs.labels.forEach).not.toHaveBeenCalled();
            expect(Math.floor).not.toHaveBeenCalled();
        });

        it('should reset sizeX and sizeY of a label', function () {
            spyOn(ctrl.cs.labels, 'forEach').and.callThrough();
            ctrl.reSizeAndPosition();
            expect(ctrl.cs.labels[0].sizeX).toBe(1);
            expect(ctrl.cs.labels[0].sizeY).toBe(1);
            expect(ctrl.cs.labels[1].sizeX).toBe(1);
            expect(ctrl.cs.labels[1].sizeY).toBe(1);
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
        });

    });

    describe('rePosition', function () {
        beforeEach(function () {
            ctrl.cs.labels = [
                {
                    conceptPath: 'a/path/1',
                    sizeX: 2,
                    sizeY: 2
                },
                {
                    conceptPath: 'a/path/2',
                }
            ];
        });

        it('should rePosition only when there are labels', function () {
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.rePosition();
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
            expect(Math.floor).toHaveBeenCalled();
        });

        it('should not rePosition when there is no label', function () {
            ctrl.cs.labels = [];
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.rePosition();
            expect(ctrl.cs.labels.forEach).not.toHaveBeenCalled();
            expect(Math.floor).not.toHaveBeenCalled();
        });

        it('should not reset sizeX and sizeY of an existing label', function () {
            ctrl.rePosition();
            expect(ctrl.cs.labels[0].sizeX).toBe(2);
            expect(ctrl.cs.labels[0].sizeY).toBe(2);
            expect(ctrl.cs.labels[1].sizeX).toBe(1);
            expect(ctrl.cs.labels[1].sizeY).toBe(1);
        });
    });


    describe('reOrganize', function () {
        beforeEach(function () {
            ctrl.cs.labels = [
                {
                    conceptPath: 'a/path/1',
                    sizeX: 2,
                    sizeY: 2
                },
                {
                    conceptPath: 'a/path/2',
                }
            ];
        });

        it('should reOrganize only when there are labels', function () {
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reOrganize();
            expect(ctrl.cs.labels.forEach).toHaveBeenCalled();
            expect(Math.floor).toHaveBeenCalled();
        });

        it('should not reOrganize when there is no label', function () {
            ctrl.cs.labels = [];
            spyOn(ctrl.cs.labels, 'forEach');
            spyOn(Math, 'floor');
            ctrl.reOrganize();
            expect(ctrl.cs.labels.forEach).not.toHaveBeenCalled();
            expect(Math.floor).not.toHaveBeenCalled();
        });

        it('should not reset sizeX and sizeY of an existing label', function () {
            ctrl.reOrganize();
            expect(ctrl.cs.labels[0].sizeX).toBe(2);
            expect(ctrl.cs.labels[0].sizeY).toBe(2);
            expect(ctrl.cs.labels[1].sizeX).toBe(1);
            expect(ctrl.cs.labels[1].sizeY).toBe(1);
        });
    });


});
