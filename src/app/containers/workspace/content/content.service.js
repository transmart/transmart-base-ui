'use strict'

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ContentService
 * @description handle services such as tab-switching
 */
angular.module('transmartBaseUi')
    .factory('ContentService', [function () {
        var service = {};

        service.ctrl = undefined;

        service.tabs = [
            {title: 'Cohort Selection', active: true},
            {title: 'Cohort Grid', active: false},
            {title: 'Saved Cohorts', active: false},
            {title: 'Data Export', active: false},
            {title: 'Data Export Jobs', active: false}
        ];

        /**
         * Activate tab
         * @param tabTitle
         * @param tabAction
         */
        service.activateTab = function (tabTitle, tabAction) {
            if (service.ctrl) {
                service.ctrl.activateTab(tabTitle, tabAction);
            }
        };

        return service;
    }]);
