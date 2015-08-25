'use strict';

describe('Summary Statistics Service Unit Tests', function() {

  var SummaryStatsService, window;
  //--------------------------------------------------------------------------------------------------------------------
  // Setup
  beforeEach(function() {module('transmartBaseUi');});

  beforeEach(inject(function (_SummaryStatsService_, _$window_) {
    SummaryStatsService = _SummaryStatsService_;
    window = _$window_;
  }));


});
