'use strict';

describe('cohort-selection directive', function () {

    var $compile, rootScope, scope, cohortSelectionElm;

    // Load the transmartBaseUi module, which contains the directive
    beforeEach(function () {
        module('transmartBaseUi');
    });
    // load all angular templates (a.k.a html files)
    beforeEach(module('transmartBaseUIHTML'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function (_$compile_, _$rootScope_) {
        // The injector unwraps the underscores (_) from around the parameter
        // names when matching
        $compile = _$compile_;
        rootScope = _$rootScope_;
        scope = rootScope.$new();

        var cohortSelectionHtml = '<cohort-selection></cohort-selection>';

        // Compile a piece of HTML containing the directive
        cohortSelectionElm = $compile(cohortSelectionHtml)(scope);

        scope.$digest();
    }));

    it('should contain cohort selection', function () {
        expect(cohortSelectionElm.html()).toContain('btn-toolbar');
        expect(cohortSelectionElm.html()).toContain('progress-container');
        expect(cohortSelectionElm.html()).toContain('text-center main-chart-container');
    });

});
