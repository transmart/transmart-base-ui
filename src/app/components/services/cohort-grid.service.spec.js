'use strict';
/* jshint undef: false */

describe('CohortGridService', function() {
  var CohortGridService, $timeout;

  // Setup
  beforeEach(function () {
    module('transmartBaseUi');
  });

  beforeEach(inject(function (_CohortGridService_, _$timeout_) {
    CohortGridService = _CohortGridService_;
    $timeout = _$timeout_;
  }));

  it ('should have predefined options', function () {
    expect(CohortGridService.options.paginationPageSizes).toEqual([10, 25, 50]);
    expect(CohortGridService.options.paginationPageSize).toEqual(10);
    expect(CohortGridService.options.columnDefs).toEqual([]);
    expect(CohortGridService.options.data).toEqual([]);
    expect(CohortGridService.options.enableFiltering).toEqual(true);
    expect(CohortGridService.options.paginationPageSize).toEqual(10);
  });

  xdescribe('updateCohortGridView', function () {
    var _subjects = [{id:10101010, labels : []}], _labels = [{name:'foo', ids:0}], _res;
    beforeEach(function () {
      _res = CohortGridService.updateCohortGridView(_subjects, _labels);
      CohortGridService.options.onRegisterApi()
    });
  });

});
