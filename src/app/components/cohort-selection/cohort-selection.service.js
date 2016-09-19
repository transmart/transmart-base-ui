'use strict'

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortSelectionService
 * @description handles cohort chart creation and user-interaction
 */
angular.module('transmartBaseUi')
    .factory('CohortSelectionService', [function () {
        var service = {
            boxes: [],
            MAX_NUM_BOXES: 10
        }

        service.currentBoxId = '';

        /** Add box to workspace
         * @param cohortSelectionCtrl - The controller instance of the box
         * @returns {String} - The new box id
         * @memberof CohortSelectionService
         */
        service.addBox = function () {
            var boxId = undefined;
            if(service.boxes.length < service.MAX_NUM_BOXES) {
                boxId = 'cohort-selection-box-id-' + service.boxes.length;
                service.currentBoxId = boxId;
                var obj = {
                    boxId: boxId
                }
                service.boxes.push(obj);
            }
            return boxId;
        };

        /**
         * Remove box to workspace
         * @param boxId - The Id of the box to be removed
         * @returns {Boolean} - To indicate if the box to be removed is found
         * @memberof CohortSelectionService
         */
        service.removeBox = function (boxId) {
            if (service.boxes.length > 1) {
                var removed = _.remove(service.boxes, {boxId: boxId});
                if (removed.length > 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else return false;
        };

        /**
         * Find the box with id
         * @param boxId
         * @memberof CohortSelectionService
         * @returns {*}
         */
        service.getBox = function (boxId) {
            return _.find(service.boxes, {boxId: boxId});
        };

        /** Set the ids and classes of the cohort selection container and its main container
         * @param elm - The element of the cohort selection box
         * @param boxId - The Id of the cohort selection
         * @returns {String} - The main container Id
         * @memberof CohortSelectionService
         */
        service.setElementAttrs = function (elm, boxId) {
            /*
             * HTML hierarchy:
             * cohortSelectionBox
             *      |_ btn toolbar
             *      |_ progress container
             *      |_ main container
             */
            elm.attr('id', boxId);
            var children = elm.children();
            var mainContainer = null;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (angular.element(child).hasClass('main-chart-container')) {
                    mainContainer = angular.element(child);
                    break;
                }
            }
            var id = boxId + '-main-container';
            if (mainContainer !== null) {
                mainContainer.attr('id', id);
            }
            return id;
        };

        return service;
    }]);
