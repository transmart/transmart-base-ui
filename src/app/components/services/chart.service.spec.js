'use strict';

describe('ChartService Unit Tests', function() {

  var ChartService, window, $rootScope;
  //--------------------------------------------------------------------------------------------------------------------
  // Setup
  beforeEach(function() {module('transmartBaseUi');});

  beforeEach(inject(function (_ChartService_, _$window_, _$rootScope_) {
    ChartService = _ChartService_;
    window = _$window_;
    $rootScope = _$rootScope_;
  }));

  it('should have ChartService and its attributes defined', function () {
    expect(ChartService).toBeDefined();
    expect(ChartService.nodes).toBeDefined();
  });

  it('should clear all nodes in ChartService', function () {
    ChartService.nodes = ['node1', 'node2', 'node3', 'node4', 'node5'];
    expect(ChartService.nodes.length).toEqual(5);
    ChartService.clearAllNodes();
    expect(ChartService.nodes.length).toEqual(0);
  });

  describe ('removeLabel', function () {

    beforeEach(function () {

      ChartService.reset();
      ChartService.cs.dims = [
        {dispose : function (){}}
      ];
      ChartService.cs.groups = [
        {dispose : function (){}}
      ];
      ChartService.cs.cross = {remove : function (){}};

      spyOn(ChartService, 'updateDimensions');
    });

    it('should invoke removeChartFromCharts', function () {
      spyOn(ChartService, 'removeChartFromCharts');
      ChartService.removeLabel({ids:0});
      expect(ChartService.removeChartFromCharts).toHaveBeenCalled();
    });

    it('should invoke removeLabelFromLabels', function () {
      spyOn(ChartService, 'removeLabelFromLabels').and.returnValue([1]);
      ChartService.removeLabel({ids:0});
      expect(ChartService.removeLabelFromLabels).toHaveBeenCalled();
    });

    it('should invoke filterSubjectsByLabel', function () {
      spyOn(ChartService, 'filterSubjectsByLabel');
      ChartService.removeLabel({ids:0});
      expect(ChartService.filterSubjectsByLabel).toHaveBeenCalled();
    });

    it('should invoke .cs.dims[0].dispose', function () {
      spyOn(ChartService.cs.dims[0], 'dispose');
      ChartService.removeLabel({ids:0});
      expect(ChartService.cs.dims[0].dispose).toHaveBeenCalled();
    });

    it('should invoke .cs.groups[0].dispose', function () {
      spyOn(ChartService.cs.groups[0], 'dispose');
      ChartService.removeLabel({ids:0});
      expect(ChartService.cs.groups[0].dispose).toHaveBeenCalled();
    });

    it('should invoke .cs.cross.remove', function () {
      spyOn(ChartService, 'removeLabelFromLabels').and.returnValue([]);
      spyOn(ChartService.cs.cross, 'remove');
      ChartService.removeLabel({ids:0});
      expect(ChartService.cs.cross.remove).toHaveBeenCalled();
    });

    it('should not invoke .cs.cross.remove', function () {
      spyOn(ChartService, 'removeLabelFromLabels').and.returnValue([0]);
      spyOn(ChartService.cs.cross, 'remove');
      ChartService.removeLabel({ids:0});
      expect(ChartService.cs.cross.remove).not.toHaveBeenCalled();
    });

    it('should invoke $broadcast', function () {
      spyOn($rootScope, '$broadcast');
      ChartService.removeLabel({ids:0});
      expect($rootScope.$broadcast).toHaveBeenCalled();
    });

    it('should invoke dc.redrawAll', function () {
      spyOn(dc, 'redrawAll');
      ChartService.removeLabel({ids:0});
      expect(dc.redrawAll).toHaveBeenCalled();
    });

    it('should invoke updateDimensions', function () {
      ChartService.removeLabel({ids:0});
      expect(ChartService.updateDimensions).toHaveBeenCalled();
    });

  });

  describe('filterSubjectsByLabel', function () {
    var _subjects, _label;

    beforeEach(function () {
      _subjects = [
        {labels : ['label1']}
      ];
      _label = {ids : 0};
    });

    it('should invoke updateDimensions', function () {
      ChartService.filterSubjectsByLabel(_subjects, _label);
      expect(_subjects.labels).toEqual(undefined)
    });
  });

});
