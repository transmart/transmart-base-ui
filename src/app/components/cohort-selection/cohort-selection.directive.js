'use strict';

angular.module('transmartBaseUi')
/**
 * Represents the cohort-selection section inside the workspace,
 * the user can create multiple cohort-selection sections.
 * @memberof transmartBaseUi
 * @ngdoc directive
 * @name cohortSelection
 */
    .directive('cohortSelection', ['CohortSelectionService', '$window', function (CohortSelectionService, $window) {
        return {
            restrict: 'E',
            templateUrl: 'app/components/cohort-selection/cohort-selection.tpl.html',
            controller: 'CohortSelectionCtrl',
            controllerAs: 'cohortSelectionCtrl',
            link: function (scope, element, attrs, CohortSelectionCtrl) {
                var boxId = CohortSelectionCtrl.boxId;
                var box = CohortSelectionService.getBox(boxId);
                if(box) {
                    box.ctrl = CohortSelectionCtrl;
                }

            }
        };
    }]);
