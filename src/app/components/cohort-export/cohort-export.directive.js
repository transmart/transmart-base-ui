'use strict';

angular.module('transmartBaseUi')
    /**
     * Represents the data-export section inside the workspace,
     * the user can drag in nodes to see data types, with numbers of subjects,
     * and export data
     * @memberof transmartBaseUi
     * @ngdoc directive
     * @name cohortExport
     */
    .directive('cohortExport', [function () {
        return {
            restrict: 'E',
            templateUrl: 'app/components/cohort-export/cohort-export.tpl.html',
            controller: 'CohortExportCtrl',
            controllerAs: 'cohortExportCtrl',
            link: function (scope, element, attrs, cohortExportCtrl) {
                //directive link function, to be utilized
            }
        };
    }]);
