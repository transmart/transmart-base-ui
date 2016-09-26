'use strict';

angular.module('transmartBaseUi')
/**
 * Represents the cohort-selection section inside the workspace,
 * the user can create multiple cohort-selection sections.
 * @memberof transmartBaseUi
 * @ngdoc directive
 * @name cohortSelection
 */
    .directive('cohortSelection', ['CohortSelectionService', function (CohortSelectionService) {
        return {
            restrict: 'E',
            scope: {
                box: '='
            },
            templateUrl: 'app/components/cohort-selection/cohort-selection.tpl.html',
            controller: 'CohortSelectionCtrl',
            controllerAs: 'cohortSelectionCtrl',
            link: function (scope, element, attrs, CohortSelectionCtrl) {
                var box = scope.box;
                box.ctrl = CohortSelectionCtrl;

                /*
                 * Two ways to duplicate a cohort-selection box
                 */
                if(box.duplication) {
                    /*
                     * 1. copy and apply history of one workspace to another
                     */
                    // box.ctrl.history = _.cloneDeep(box.duplication.ctrl.history);
                    // box.ctrl.applyHistory();

                    /*
                     * 2. copy and apply nodes of one workspace to another
                     */
                    box.ctrl.applyNodes(box.duplication.ctrl.cs.nodes);
                }
            }
        };
    }]);
