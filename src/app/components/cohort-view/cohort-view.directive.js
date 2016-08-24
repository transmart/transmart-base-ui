'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc directive
 * @name cohortView
 */
angular.module('transmartBaseUi')
    .directive('cohortView', function () {
        return {
            restrict: 'E',
            templateUrl: 'app/components/cohort-view/cohort-view.tpl.html',
            controller: ['$scope', '$timeout', 'CohortViewService', 'AlertService',
                function ($scope, $timeout, CohortViewService, AlertService) {

                    $scope.cohorts = [];
                    var ctrl = this;

                    ctrl.gridOptions = CohortViewService.options;

                    ctrl.loadCohorts = function() {
                        CohortViewService.getCohorts().then(function (cohorts) {
                            $scope.cohorts = cohorts;
                        });
                    }

                    ctrl.removeCohort = function(cohort) {
                        CohortViewService.removeCohort(cohort).then(function() {
                            AlertService.add('success', 'Successfully deleted cohort "' + cohort.name + '"');
                            ctrl.loadCohorts();
                        });
                    }

                    ctrl.loadCohorts();
                }
            ],
            controllerAs : 'ctrl'
        };
    });
