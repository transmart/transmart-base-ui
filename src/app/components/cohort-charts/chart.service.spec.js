'use strict';

describe('ChartService Unit Tests', function () {

    var ChartService, window, $rootScope, Restangular, httpBackend;
    //------------------------------------------------------------------------------------------------------------------
    // Setup
    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_ChartService_, _$window_, _$rootScope_, _Restangular_, _$httpBackend_) {
        ChartService = _ChartService_;
        window = _$window_;
        $rootScope = _$rootScope_;
        Restangular = angular.copy(_Restangular_, Restangular);
        httpBackend = _$httpBackend_;
    }));

    it('should have ChartService and its attributes defined', function () {
        expect(ChartService).toBeDefined();
    });

    describe('removeLabel', function () {

        beforeEach(function () {

            ChartService.reset();
            ChartService.cs.dims = [
                {
                    dispose: function () {
                    }
                }
            ];
            ChartService.cs.groups = [
                {
                    dispose: function () {
                    }
                }
            ];
            ChartService.cs.cross = {
                remove: function () {
                }
            };

            spyOn(ChartService, 'updateDimensions');
        });

        it('should invoke filterSubjectsByLabel', function () {
            spyOn(ChartService, 'filterSubjectsByLabel');
            ChartService.removeLabel({ids: 0});
            expect(ChartService.filterSubjectsByLabel).toHaveBeenCalled();
        });

        it('should invoke .cs.dims[0].dispose', function () {
            spyOn(ChartService.cs.dims[0], 'dispose');
            ChartService.removeLabel({ids: 0});
            expect(ChartService.cs.dims[0].dispose).toHaveBeenCalled();
        });

        it('should invoke .cs.groups[0].dispose', function () {
            spyOn(ChartService.cs.groups[0], 'dispose');
            ChartService.removeLabel({ids: 0});
            expect(ChartService.cs.groups[0].dispose).toHaveBeenCalled();
        });

        it('should invoke .cs.cross.remove', function () {
            ChartService.cs.labels = [{ids: 0}];
            spyOn(ChartService.cs.cross, 'remove');
            ChartService.removeLabel({ids: 0});
            expect(ChartService.cs.cross.remove).toHaveBeenCalled();
        });

        it('should not invoke .cs.cross.remove', function () {
            ChartService.cs.labels = [{ids: 0}, {ids: 1}];
            spyOn(ChartService.cs.cross, 'remove');
            ChartService.removeLabel({ids: 0});
            expect(ChartService.cs.cross.remove).not.toHaveBeenCalled();
        });

        it('should invoke $broadcast', function () {
            spyOn($rootScope, '$broadcast');
            ChartService.removeLabel({ids: 0});
            expect($rootScope.$broadcast).toHaveBeenCalled();
        });

        it('should invoke dc.redrawAll', function () {
            spyOn(dc, 'redrawAll');
            ChartService.removeLabel({ids: 0});
            expect(dc.redrawAll).toHaveBeenCalled();
        });

        it('should invoke updateDimensions', function () {
            ChartService.removeLabel({ids: 0});
            expect(ChartService.updateDimensions).toHaveBeenCalled();
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
            _label = {ids: 0};
            _labelNo = {ids: 99};
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
            _charts = [
                {id: 0, filter: _filter},
                {id: 1, filter: _filter},
                {id: 2, filter: _filter}
            ];
            _label = {ids: 2};
            _labelNotExist = {ids: 3};

            ChartService.cs.charts = _charts;

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

            ChartService.addNodeToActiveCohortSelection(node);
            expect(ChartService.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node);
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

            ChartService.cs.charts = [];
        });

        it('should invoke addNodeToActiveCohortSelection when a pieNode is newly dropped', function () {
            var filters = [{
                label: 'parent/restobj/fullname',
                filterWords: [undefined]
            }];

            spyOn(ChartService, 'onNodeDrop').and.callThrough();
            spyOn(ChartService, 'addNodeToActiveCohortSelection');

            ChartService.onNodeDrop(pieNode);
            expect(ChartService.onNodeDrop).toHaveBeenCalledWith(pieNode);
            expect(ChartService.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node, filters);
        });

        it('should not invoke addNodeToActiveCohortSelection upon when the pie-chart exists', function () {
            chart.tsLabel = {};
            chart.tsLabel.label = chartName;
            ChartService.cs.charts.push(chart);

            spyOn(ChartService, 'onNodeDrop').and.callThrough();
            spyOn(ChartService, 'addNodeToActiveCohortSelection');
            spyOn(ChartService, 'updateDimensions');

            ChartService.onNodeDrop(pieNode);
            expect(ChartService.onNodeDrop).toHaveBeenCalledWith(pieNode);
            expect(ChartService.addNodeToActiveCohortSelection).not.toHaveBeenCalled();
        });

        it('should invoke addNodeToActiveCohortSelection with node when the node is dropped', function () {
            spyOn(ChartService, 'onNodeDrop').and.callThrough();
            spyOn(ChartService, 'addNodeToActiveCohortSelection');

            ChartService.onNodeDrop(node);
            expect(ChartService.onNodeDrop).toHaveBeenCalledWith(node);
            expect(ChartService.addNodeToActiveCohortSelection).toHaveBeenCalledWith(node);
        });

    });
});
