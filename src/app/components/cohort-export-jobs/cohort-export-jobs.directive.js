'use strict';

angular.module('transmartBaseUi')
    /**
     * Represents the data-export-jobs section inside the workspace,
     * showing the data exporting progresses
     * @memberof transmartBaseUi
     * @ngdoc directive
     * @name cohortExportJobs
     */
    .directive('cohortExportJobs', [function () {
        return {
            restrict: 'E',
            templateUrl: 'app/components/cohort-export-jobs/cohort-export-jobs.tpl.html',
            controller: 'CohortExportJobsCtrl',
            controllerAs: 'cohortExportJobsCtrl',
            link: function (scope, element, attrs, cohortExportJobsCtrl) {
                //directive link function, to be utilized
            }
        };
    }]);
