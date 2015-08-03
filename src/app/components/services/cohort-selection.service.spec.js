'use strict';

describe('CohortSelectionService Unit Tests', function() {

  var CohortSelectionService, window;
  //--------------------------------------------------------------------------------------------------------------------
  // Setup
  beforeEach(function() {module('transmartBaseUi');});

  beforeEach(inject(function (_CohortSelectionService_, _$window_) {
    CohortSelectionService = _CohortSelectionService_;
    window = _$window_;
  }));

  it('should have CohortSelectionService and its attributes defined', function () {
    expect(CohortSelectionService).toBeDefined();
    expect(CohortSelectionService.nodes).toBeDefined();
  });

  it('should clear all nodes in CohortSelectionService', function () {
    CohortSelectionService.nodes = ['node1', 'node2', 'node3', 'node4', 'node5'];
    expect(CohortSelectionService.nodes.length).toEqual(5);
    CohortSelectionService.clearAll();
    expect(CohortSelectionService.nodes.length).toEqual(0);
  });

});
