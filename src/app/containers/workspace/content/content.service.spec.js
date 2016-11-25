'use strict';

describe('ContentService', function () {
    var ContentService;

    beforeEach(module('transmartBaseUi'));

    beforeEach(inject(function (_ContentService_) {
        ContentService = _ContentService_;
    }));

    describe('Initialization of ContentService', function () {

        it('should contain tabs definition', function () {
            var tabs = [
                {title: 'Cohort Selection', active: true},
                {title: 'Cohort Grid', active: false},
                {title: 'Saved Cohorts', active: false},
                {title: 'Data Export', active: false},
                {title: 'Data Export Jobs', active: false}
            ];
            expect(ContentService.tabs).toEqual(tabs);
        });

        it('should call ContentCtrl activateTab function when calling ContenService.activateTab', function () {
            ContentService.ctrl = {
                activateTab: function (tabTitle, tabAction) {
                }
            }
            spyOn(ContentService.ctrl, 'activateTab');
            ContentService.activateTab('tabTitle', 'tabAction');
            expect(ContentService.ctrl.activateTab).toHaveBeenCalled();
        });
    });
});
