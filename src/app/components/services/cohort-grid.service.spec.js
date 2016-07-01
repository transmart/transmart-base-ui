'use strict';
/* jshint undef: false */

describe('CohortGridService', function() {
  var CohortGridService, $timeout, $q, deferred;

  // Setup
  beforeEach(function () {
    module('transmartBaseUi');
  });

  beforeEach(inject(function (_CohortGridService_, _$timeout_, _$q_) {
    CohortGridService = _CohortGridService_;
    $timeout = _$timeout_;
    $q = _$q_;
    deferred = _$q_.defer();
  }));

  it ('should have predefined options', function () {
    expect(CohortGridService.options.enableGridMenu).toEqual(true);
    expect(CohortGridService.options.enableSelectAll).toEqual(true);
    expect(CohortGridService.options.exporterCsvFilename).toEqual('cohort.csv');
    expect(CohortGridService.options.exporterMenuPdf).toEqual(false);
    expect(CohortGridService.options.paginationPageSizes).toEqual([100, 200, 500]);
    expect(CohortGridService.options.paginationPageSize).toEqual(100);
    expect(CohortGridService.options.columnDefs).toEqual([]);
    expect(CohortGridService.options.data).toEqual([]);
    expect(CohortGridService.options.enableFiltering).toEqual(true);
  });

  describe('prepareColumnDefs', function () {
    var _colDefs,  _labels = [{name:'a'}, {name:'b'}, {name:'c'}];

    beforeEach(function () {
      _colDefs = CohortGridService.prepareColumnDefs(_labels);
    });

    it ('should define columns from given labels', function () {
      expect(_colDefs[0]).toEqual({field : 'id'});
    });

    it ('should define columns from given labels', function () {
      expect(_colDefs).toEqual([{field : 'id'}, {field : 'a'},  {field : 'b'},  {field : 'c'}]);
    });

  });

  xdescribe('convertToTable', function () {
    var _formatted,
      _labels = [{name:'a', ids:1}, {name:'b', ids:2}, {name:'c', ids:3}],
      _subjects = [{id:1111, labels:[]}];

    beforeEach(function () {
      _formatted = CohortGridService.convertToTable(_subjects, _labels);
    });

    it('', function () {
        console.log(_formatted);
    });
  });

  describe('updateCohortGridView', function () {
    var _subjects = [{id:10101010, labels : []}], _labels = [{name:'foo', ids:0}], _res;

    beforeEach(function () {
      spyOn(CohortGridService, 'updateCohortGridView').and.returnValue(deferred.promise);
    });

    it ('should return resolved value', function () {
      deferred.resolve(999);
      _res = CohortGridService.updateCohortGridView(_subjects, _labels);
      expect(_res.$$state.value).toEqual(999);
    });

  });

});
