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
      ChartService.cs.labels = [{ids:0}];
      spyOn(ChartService.cs.cross, 'remove');
      ChartService.removeLabel({ids:0});
      expect(ChartService.cs.cross.remove).toHaveBeenCalled();
    });

    it('should not invoke .cs.cross.remove', function () {
      ChartService.cs.labels = [{ids:0}, {ids:1}];
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
    var _subjects, _label, _labelNo;

    beforeEach(function () {
      _subjects = [
        {
          subject: 1,
          labels : ['label1', 'label2', 'label3']
        },
        {
          subject: 2,
          labels : ['label1']
        }
      ];
      _label = {ids : 0};
      _labelNo = {ids : 99};
    });

    it('should remove label from subject labels' , function () {
      var _res = ChartService.filterSubjectsByLabel(_subjects, _label);
      expect(_res[0].labels[0]).not.toContain('label1');
    });

    it('should not remove subject from subject array if subject still has labels' , function () {
      var _res = ChartService.filterSubjectsByLabel(_subjects, _label);
      expect(_res[0].subject).toEqual(1)
    });

    it('should remove subject from subject array if subject has empty labels' , function () {
      var _subject2Tmp = _subjects[1],
          _res = ChartService.filterSubjectsByLabel(_subjects, _label);
      expect(_res).not.toContain(_subject2Tmp);
    });

    it('should not remove any subject labels nor subject if label does not exist in any subject labels' , function () {
      var _res = ChartService.filterSubjectsByLabel(_subjects, _labelNo);
      expect(_res.length).toEqual(2);
      expect(_res[0].labels.length).toEqual(3);
      expect(_res[1].labels.length).toEqual(1);
    });

  });

});
