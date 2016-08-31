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
            controller: ['$scope', '$timeout', '$q', 'CohortViewService', 'AlertService',
                function ($scope, $timeout, $q, CohortViewService, AlertService) {

                    $scope.cohorts = [];
                    var ctrl = this;
                    ctrl.gridOptions = CohortViewService.options;
                    ctrl.gridApi = null;
                    ctrl.isCohortSelected = false;

                    var updateSelection = function() {
                        ctrl.isCohortSelected = ctrl.gridApi.selection.getSelectedCount() > 0;
                    }

                    // Store a reference to the grid API when it becomes available
                    ctrl.gridOptions.onRegisterApi = function(gridApi) {
                        ctrl.gridApi = gridApi;

                        // Listen for changes in the selection
                        gridApi.selection.on.rowSelectionChanged($scope, updateSelection);
                        gridApi.selection.on.rowSelectionChangedBatch($scope, updateSelection);
                    };

                    /** Loads the list of cohorts.
                     */
                    ctrl.loadCohorts = function() {
                        CohortViewService.getCohorts().then(function(cohorts) {
                            $scope.cohorts = cohorts;
                        }, function(error) {
                            AlertService.add('danger', 'Failed to retrieve list of cohorts');
                        });
                    };

                    /** Removes the specified cohort and renders a message on success/failure.
                     */
                    ctrl.removeCohort = function(cohort) {
                        var deferred = $q.defer();
                        CohortViewService.removeCohort(cohort).then(function() {
                            AlertService.add('success', 'Successfully deleted cohort "' + cohort.name + '"');
                            deferred.resolve(cohort);
                        }, function(error) {
                            AlertService.add('danger', 'Failed to delete cohort "' + cohort.name + '"');
                            deferred.reject(error);
                        });
                        return deferred.promise;
                    };

                    /** Deletes the cohorts currently selected in the cohort grid.
                     */
                    ctrl.deleteSelectedCohorts = function() {
                        var selectedCohorts = ctrl.gridApi.selection.getSelectedRows();

                        // Remove all selected cohorts and reload the list after completing
                        $q.all(selectedCohorts.map(function(cohort) {
                            return ctrl.removeCohort(cohort);
                        })).then(function() {
                            ctrl.loadCohorts();
                        });
                    };

                    ctrl.loadCohorts();
                }
            ],
            controllerAs : 'ctrl'
        };
    });
