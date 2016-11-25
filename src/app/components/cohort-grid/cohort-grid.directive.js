'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc directive
 * @name cohortGrid
 */
angular.module('transmartBaseUi')
    .directive('cohortGrid', function () {
        return {
            restrict: 'E',
            templateUrl: 'app/components/cohort-grid/cohort-grid.tpl.html',
            scope: {
                cohort: '=',
                headers: '='
            },
            controller: 'CohortGridCtrl',
            controllerAs: 'ctrl'
        };
    });
