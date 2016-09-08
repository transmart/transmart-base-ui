'use strict';

describe('ChartService Unit Tests', function () {

    var ChartService, DcChartsService, window, $rootScope, Restangular, httpBackend;
    var workspaceId = 'exampleId';
    //------------------------------------------------------------------------------------------------------------------
    // Setup
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_ChartService_, _DcChartsService_, _$window_, _$rootScope_, _Restangular_, _$httpBackend_) {
        ChartService = _ChartService_;
        DcChartsService = _DcChartsService_;
        window = _$window_;
        $rootScope = _$rootScope_;
        Restangular = angular.copy(_Restangular_, Restangular);
        httpBackend = _$httpBackend_;
    }));

    it('should have ChartService and its attributes defined', function () {
        expect(ChartService).toBeDefined();
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

        beforeEach(function () {
            ChartService.reset(workspaceId);
        });

        it('should restore the crossfilter dimension(s)', function () {
            ChartService.cs[workspaceId].crossfilter = crossfilter(partialSubjects);
            var dimChanged = ChartService.cs[workspaceId].crossfilter.dimension(function (d) {
                return d.gender;
            });
            expect(dimChanged.top(Infinity).length).toEqual(3);

            var restorationPerformed = ChartService.restoreCrossfilter(workspaceId);
            expect(restorationPerformed).toEqual(false);

            ChartService.cs[workspaceId].subjects = fullSubjects;
            restorationPerformed = ChartService.restoreCrossfilter(workspaceId);
            var dimRestored = ChartService.cs[workspaceId].crossfilter.dimension(function (d) {
                return d.gender;
            });
            expect(restorationPerformed).toEqual(true);
            expect(dimRestored.top(Infinity).length).toEqual(5);
        });
    });

    describe('removeLabel', function () {

        beforeEach(function () {
            ChartService.reset(workspaceId);
            ChartService.cs[workspaceId].charts = [{
                id: 0, filter: function () {
                }
            }, {
                id: 1, filter: function () {
                }
            }, {
                id: 2, filter: function () {
                }
            }];
            ChartService.cs[workspaceId].dimensions = [{d: 0}, {d: 1}, {d: 2}];
            ChartService.cs[workspaceId].groups = [{g: 0}, {g: 1}, {g: 2}];
            ChartService.cs[workspaceId].labels = [{labelId: 0}, {labelId: 1}, {labelId: 2}];

            spyOn(ChartService, 'updateDimensions');
            spyOn(ChartService, 'reset');
            spyOn($rootScope, '$broadcast');
        });

        it('remove chart from cs.charts', function () {
            ChartService.removeLabel({labelId: 2}, workspaceId);
            expect(_.find(ChartService.cs[workspaceId].charts, {id: 2})).toEqual(undefined);
            expect(_.find(ChartService.cs[workspaceId].labels, {id: 2})).toEqual(undefined);
            expect(_.find(ChartService.cs[workspaceId].subjects, {id: 2})).toEqual(undefined);
            expect(_.find(ChartService.cs[workspaceId].groups, {id: 2})).toEqual(undefined);
            expect(ChartService.updateDimensions).toHaveBeenCalled();
            expect($rootScope.$broadcast).toHaveBeenCalled();
            ChartService.removeLabel({labelId: 0}, workspaceId);
            ChartService.removeLabel({labelId: 1}, workspaceId);
            expect(ChartService.reset).toHaveBeenCalled();
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
            var _res = ChartService.filterSubjectsByLabel(_subjects, _label);
            expect(_res[0].labels[0]).not.toContain('label1');
        });

        it('should not remove subject from subject array if subject still has labels', function () {
            var _res = ChartService.filterSubjectsByLabel(_subjects, _label);
            expect(_res[0].subject).toEqual(1)
        });

        it('should remove subject from subject array if subject has empty labels', function () {
            var _subject2Tmp = _subjects[1],
                _res = ChartService.filterSubjectsByLabel(_subjects, _label);
            expect(_res).not.toContain(_subject2Tmp);
        });

        it('should not remove any subject labels nor subject if label does not exist in any subject labels', function () {
            var _res = ChartService.filterSubjectsByLabel(_subjects, _labelNo);
            expect(_res.length).toEqual(2);
            expect(_res[0].labels.length).toEqual(3);
            expect(_res[1].labels.length).toEqual(1);
        });

    });

    describe('clearChartFilter', function () {
        var _charts, _label, _labelNotExist, _filter = function (x) {
        };

        beforeEach(function () {
            ChartService.reset(workspaceId);
            _charts = [
                {id: 0, filter: _filter},
                {id: 1, filter: _filter},
                {id: 2, filter: _filter}
            ];
            _label = {labelId: 2, workspaceId: workspaceId};
            _labelNotExist = {labelId: 3, workspaceId: workspaceId};

            ChartService.cs[workspaceId].charts = _charts;

            spyOn(ChartService, 'updateDimensions');
        });

        it('should return undefined when label does not match with the charts', function () {
            var _res = ChartService.clearChartFilterByLabel(_labelNotExist);
            expect(_res).toEqual(undefined);
        });

        it('should clear filter on a chart by given label', function () {
            spyOn(_charts[2], 'filter');
            ChartService.clearChartFilterByLabel(_label);
            expect(_charts[2].filter).toHaveBeenCalledWith(null);
        });

        it('should invoke dc.redrawAll', function () {
            spyOn(dc, 'redrawAll');
            ChartService.clearChartFilterByLabel(_label);
            expect(dc.redrawAll).toHaveBeenCalled();
        });

        it('should invoke updateDimensions', function () {
            ChartService.clearChartFilterByLabel(_label);
            expect(ChartService.updateDimensions).toHaveBeenCalled();
        });

    });

    describe('addNodeToActiveCohortSelection', function () {
        var node = {};

        beforeEach(function () {
            node.restObj = Restangular;
        });

        it('should make restangular call when adding node to active cohort selection', function () {
            spyOn(ChartService, 'addNodeToActiveCohortSelection').and.callThrough();
            spyOn(node.restObj, 'one').and.callThrough();

            ChartService.addNodeToActiveCohortSelection(node, [], workspaceId);
            expect(ChartService.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, [], workspaceId);
            expect(node.restObj.one).toHaveBeenCalled();
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

        beforeEach(function () {
            pieNode.type = 'CATEGORICAL_OPTION';
            pieNode.parent = node;

            node.type = '';
            node.restObj = {};
            node.restObj.fullName = chartName;

            ChartService.reset(workspaceId);
        });

        it('should invoke addNodeToActiveCohortSelection when a pieNode is newly dropped', function () {
            var filters = [{
                label: 'parent/restobj/fullname',
                filterWords: [undefined]
            }];

            spyOn(ChartService, 'onNodeDrop').and.callThrough();
            spyOn(ChartService, 'addNodeToActiveCohortSelection');

            ChartService.onNodeDrop(pieNode, workspaceId);
            expect(ChartService.onNodeDrop).toHaveBeenCalledWith(pieNode, workspaceId);
            expect(ChartService.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, filters, workspaceId);
        });

        it('should not invoke addNodeToActiveCohortSelection upon node-dropping when the pie-chart exists', function () {
            chart.tsLabel = {};
            chart.tsLabel.label = chartName;
            chart.filters = function () {
                return [];
            };
            ChartService.cs[workspaceId].charts.push(chart);

            spyOn(ChartService, 'onNodeDrop').and.callThrough();
            spyOn(ChartService, 'addNodeToActiveCohortSelection');
            spyOn(ChartService, 'updateDimensions');

            ChartService.onNodeDrop(pieNode, workspaceId);
            expect(ChartService.onNodeDrop).toHaveBeenCalledWith(pieNode, workspaceId);
            expect(ChartService.addNodeToActiveCohortSelection).not.toHaveBeenCalled();
        });

        it('should invoke addNodeToActiveCohortSelection with node when the node is dropped', function () {
            spyOn(ChartService, 'onNodeDrop').and.callThrough();
            spyOn(ChartService, 'addNodeToActiveCohortSelection');

            ChartService.onNodeDrop(node, workspaceId);
            expect(ChartService.onNodeDrop).toHaveBeenCalledWith(node, workspaceId);
            expect(ChartService.addNodeToActiveCohortSelection).toHaveBeenCalled();
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
                workspaceId: workspaceId
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
            ChartService.reset(workspaceId);
            ChartService.cs[workspaceId].subjects = subjects;
            ChartService.cs[workspaceId].crossfilter = crossfilter(subjects);
        });

        it('should listen to the filtered and renderlet events', function () {
            var _chart = jasmine.createSpyObj('_chart', ['on', 'render']);
            var _func = jasmine.any(Function);

            spyOn(DcChartsService, 'getPieChart').and.returnValue(_chart);

            ChartService.createCohortChart(label, el);

            expect(_chart.on).toHaveBeenCalledWith('filtered', _func);
            expect(_chart.on).toHaveBeenCalledWith('renderlet', _func);

        });
    });

    describe('addWorkspace', function () {
        beforeEach(function () {
            ChartService.reset(workspaceId);
        });

        it('should assert that ChartService.workspaces is defined', function () {
            expect(ChartService.workspaces).toBeDefined();
        });

        it('should assert that ChartService.workspaces is an array containing only one workspaceId', function () {
            expect(ChartService.workspaces.length).toBe(1);
        });

        it('should expect the cs object to be defined', function () {
            expect(ChartService.cs[workspaceId]).toBeDefined();
        });

        it('should add a second workspaceId when addWorkspace is called', function () {
            var newWorkspaceId = 'newExampleId';
            ChartService.addWorkspace(newWorkspaceId);
            expect(ChartService.workspaces.length).toBe(2);
            expect(ChartService.cs[newWorkspaceId]).toBeDefined();
        });

    });

    describe('removeWorkspace', function () {
        var newWorkspaceId = 'newExampleId';

        beforeEach(function () {
            ChartService.reset(workspaceId);
            ChartService.addWorkspace(newWorkspaceId);
        });

        it('should remove a workspace when removeWorkspace is called', function () {
            expect(ChartService.workspaces.length).toBe(2);
            expect(ChartService.cs[newWorkspaceId]).toBeDefined();
            ChartService.removeWorkspace(newWorkspaceId);
            expect(ChartService.workspaces.length).toBe(1);
            expect(ChartService.cs[newWorkspaceId]).not.toBeDefined();
        });

    });

});
