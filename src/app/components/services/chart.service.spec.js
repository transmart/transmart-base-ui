'use strict';

describe('ChartService Unit Tests', function() {

  var ChartService, window;
  //--------------------------------------------------------------------------------------------------------------------
  // Setup
  beforeEach(function() {module('transmartBaseUi');});

  beforeEach(inject(function (_ChartService_, _$window_) {
    ChartService = _ChartService_;
    window = _$window_;
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

});
