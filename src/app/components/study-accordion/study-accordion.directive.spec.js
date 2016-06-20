'use strict';

describe('Unit testing study accordion', function() {
  var $compile, scope, element;

  // Load the transmartBaseUi module, which contains the directive
  beforeEach(function() {module('transmartBaseUi');});
  // load all angular templates (a.k.a html files)
  beforeEach(module('transmartBaseUIHTML'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    scope = _$rootScope_;
    scope.studies = [];
  }));

  beforeEach(function() {
    // Compile a piece of HTML containing the directive
    element = $compile('<study-accordion></study-accordion>')(scope);
    scope.$digest();
  });

  it('should renders study-accordion template', function() {
    // Check that the compiled element contains the templated content
    expect(element.html()).toContain('<script type="text/ng-template" id="tree-tooltip-metadata.html">');
    expect(element.html()).toContain('<script type="text/ng-template" id="nodes_renderer.html">');
  });

});
