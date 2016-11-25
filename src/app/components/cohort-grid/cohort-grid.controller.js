'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc controller
 * @name cohortGrid
 */
angular.module('transmartBaseUi')
    .controller('CohortGridCtrl',
        ['$scope', '$timeout', 'CohortGridService', 'CohortSelectionService',
            function ($scope, $timeout, CohortGridService, CohortSelectionService) {

                var ctrl = this;
                ctrl.boxes = CohortSelectionService.boxes;
                ctrl.allChecked = true;

                ctrl.gridOptions = CohortGridService.options;
                ctrl.style_modifiers = {'height': CohortGridService.HEIGHT};

                ctrl.cohortCheckChange = function (box) {
                    if(!box) {
                        ctrl.boxes.forEach(function (_box) {
                            _box.checked = ctrl.allChecked;
                        });
                    }
                    else {
                        if(!box.checked) {
                            ctrl.allChecked = false;
                        }
                        else {
                            ctrl.allChecked = true;
                            ctrl.boxes.forEach(function (_box) {
                                if(!_box.checked) {
                                    ctrl.allChecked = false;
                                }
                            });
                        }
                    }
                    $scope.$emit('cohortSelectionUpdateEvent');
                };

                $scope.$watchCollection('headers', function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        CohortGridService.updateCohortGridView($scope.cohort, newValue);
                    }
                });

                $scope.$watchCollection('cohort', function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        CohortGridService.updateCohortGridView(newValue, $scope.headers);
                    }
                });

            }]);
