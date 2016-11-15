'use strict'

describe('Unit testing for cohort-export directive', function () {

    var $compile, rootScope, scope, elm;

    beforeEach(function () {
        module('transmartBaseUi');
    });
    beforeEach(module('transmartBaseUIHTML'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        rootScope = _$rootScope_;
        scope = rootScope.$new();

        var cohortSelectionHtml = '<cohort-export></cohort-export>';
        elm = $compile(cohortSelectionHtml)(scope);
        scope.$digest();
    }));

    it('should initialize cohort-export element', function () {
        //TODO: add tests
    });

});
