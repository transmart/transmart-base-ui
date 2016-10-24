'use strict'

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name CohortSelectionService
 * @description handles cohort chart creation and user-interaction
 */
angular.module('transmartBaseUi')
    .factory('CohortSelectionService', ['UtilityService', function (UtilityService) {
        var service = {
            boxes: [],
            MAX_NUM_BOXES: 2,
            DEFAULT_BOX_SIZE: 500
        };

        service.currentBoxId = '';

        /**
         * Add box to workspace
         * @returns {Object} - The new box id
         * @memberof CohortSelectionService
         */
        service.addBox = function () {
            var boxId = undefined;
            if (service.boxes.length < service.MAX_NUM_BOXES) {
                boxId = UtilityService.guid();
                service.currentBoxId = boxId;
                var obj = {
                    boxId: boxId,
                    //default ng-model value for the checkbox in cohort grid
                    checked: true
                };
                service.boxes.push(obj);

                var boxsetContainer = angular.element('#cohort-selection-ui-layout-div');
                var boxsetContainerWidth = boxsetContainer.width();
                if (service.boxes.length > 2) {
                    boxsetContainerWidth += service.DEFAULT_BOX_SIZE;
                    boxsetContainer.width(boxsetContainerWidth);
                }
            }

            return boxId;
        };

        /**
         * Duplicate the box based the given, existing box,
         * which is identified by boxId
         * @param boxId
         * @memberof CohortSelectionService
         */
        service.duplicateBox = function (boxId) {
            var currBox = service.getBox(boxId);
            var newBoxId = service.addBox();
            if(currBox && newBoxId) {
                service.getBox(newBoxId).duplication = currBox;
            }
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
                    var boxsetContainer = angular.element('#cohort-selection-ui-layout-div');
                    var boxsetContainerWidth = boxsetContainer.width();
                    if (service.boxes.length > 2) {
                        boxsetContainerWidth -= service.DEFAULT_BOX_SIZE;
                        boxsetContainer.width(boxsetContainerWidth);
                    }

                    var sumWidth = 0;
                    service.boxes.forEach(function (box) {
                        var boxContainer = box.ctrl.boxElm.parent();
                        var width = boxContainer.width();
                        sumWidth += width;
                    });

                    service.boxes.forEach(function (box) {
                        var boxContainer = box.ctrl.boxElm.parent();
                        var width = boxContainer.width();
                        var proportion = width / sumWidth;
                        var newWidth = proportion * boxsetContainerWidth;
                        boxContainer.width(newWidth);
                    });

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
            var id = boxId + '-main-chart-container';
            if (mainContainer !== null) {
                mainContainer.attr('id', id);
            }
            return id;
        };

        /**
         * @memberof CohortSelectionService
         * @param {String} path - conceptPath
         * @param {Array} charts - the array of charts to be searched
         * @returns {*} - The found chart in CohortSelectionCtrl.cs.charts,
         *      with matching name chartName, if not found, return null
         */
        service.findChartByConceptPath = function (path, charts) {
            var foundChart = null;
            charts.forEach(function (_chart) {
                if (_chart.tsLabel.conceptPath === path) {
                    foundChart = _chart;
                }
                else if (_chart.tsLabel.type === 'combination'
                    && _chart.tsLabel.name === path) {
                    foundChart = _chart;
                }
            });
            return foundChart;
        };

        return service;
    }]);
