'use strict';

describe('Unit testing cohort-grid directive', function() {
  var $compile, scope, element;

  // Load the transmartBaseUi module, which contains the directive
  beforeEach(function() {module('transmartBaseUi');});
  // load all angular templates (a.k.a html files)
  beforeEach(module('gulpAngular'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_){
    // The injector unwraps the underscores (_) from around the parameter
    // names when matching
    $compile = _$compile_;
    scope = _$rootScope_;
  }));

  describe('Empty template', function () {
    beforeEach(function() {
      // Compile a piece of HTML containing the directive
      element = $compile('<cohort-grid></cohort-grid>')(scope);
      scope.$digest();
    });

    it('should render cohort-grid template', function() {
      // Check that the compiled element contains the templated content
      expect(element.html()).toContain('st-table=');
    });
  });

  describe('Template containing data', function () {
    beforeEach(function() {
      scope.subjects = [
        {
          id: 1,
          labels: {
            age: 45,
            sex: 'MALE'
          }
        },
        {
          id: 2,
          labels: {
            age: 55,
            sex: 'FEMALE'
          }
        },
        {
          id: 3,
          labels: {
            age: 65,
            sex: 'FEMALE'
          }
        },
        {
          id: 4,
          labels: {
            age: 75,
            sex: 'MALE'
          }
        },
        {
          id: 5,
          labels: {
            age: 85,
            sex: 'MALE'
          }
        },
      ];
      scope.headers = [
        {
          name: 'Age',
          ids: 'age'
        },
        {
          name: 'Sex',
          ids: 'sex'
        }
      ];
      // Compile a piece of HTML containing the directive
      element = $compile(
        '<cohort-grid cohort="subjects" headers="headers"></cohort-grid>')
        (scope);
      scope.$digest();
    });

    it('contain the correct number of rows', function() {
      // 1 Header row
      // 5 Subjects rows
      // 1 Footer row
      expect(element.find('tr').length).toEqual(7);
    });

    it('renders the header names correctly', function() {
      expect(element.find('tr').eq(0).find('th').eq(0).text()).toEqual('ID');
      expect(element.find('tr').eq(0).find('th').eq(1).text()).toContain('Age');
      expect(element.find('tr').eq(0).find('th').eq(2).text()).toContain('Sex');
    });

    it('renders some row values correctly', function() {
      expect(element.find('tr').eq(1).find('td').eq(0).text()).toContain('1');
      expect(element.find('tr').eq(1).find('td').eq(1).text()).toContain('45');
      expect(element.find('tr').eq(1).find('td').eq(2).text()).toContain('MALE');
    });

    it('refreshes with updated data', function() {

      scope.subjects = [
        {
          id: 999,
          labels: {
            age: 20
          }
        }
      ];

      scope.headers = [
        {
          name: 'Age',
          ids: 'age'
        }
      ];

      scope.$apply();

      expect(element.find('tr').length).toEqual(3);

      expect(element.find('tr').eq(1).find('td').eq(0).text()).toContain('999');
      expect(element.find('tr').eq(1).find('td').eq(1).text()).toContain('20');
    });

  });

});
