'use strict';
/**
 * @Service CohortSelectionMocks
 * @Description Service layer exposing mocks for gridster and cohort charts
 */
angular.module('transmartBaseUi')
    .factory('CohortSelectionMocks',
        function () {
            var service = {};

            service.getGridsterOptions = function() {
                var options = {
                    // whether to push other items out of the way on move or resize
                    pushing: true,
                    /*
                     * floating: whether to automatically float items up so they stack --
                     * this option, if set to true, will alleviate the problem where
                     * dragging one item pushes the others away and produces wasted empty spaces
                     */
                    floating: true,
                    // whether or not to have items of the same size switch places instead
                    // of pushing down if they are the same size
                    swapping: true,
                    // the pixel distance between each widget
                    margins: [10, 10],
                    // whether margins apply to outer edges of the grid
                    outerMargin: false,
                    // the minimum columns the grid must have
                    minColumns: 1,
                    // the minimum height of the grid, in rows
                    minRows: 1,
                    // maximum number of rows
                    maxRows: 100,
                    // minimum column width of an item
                    minSizeX: 2,
                    // maximum column width of an item
                    maxSizeX: null,
                    // minumum row height of an item
                    minSizeY: 2,
                    // maximum row height of an item
                    maxSizeY: null,
                    resizable: {
                        enabled: true,
                        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                        resize: function (event, $element, widget) {
                            // Resize chart container in an interactive way
                            angular.element('#cohort-chart-panel-' + widget.ids)
                                .width($element[0].clientWidth)
                                .height($element[0].clientHeight);
                        }
                    },
                    draggable: {
                        enabled: true, // whether dragging items is supported
                        handle: '.chart-drag-handle' // optional selector for resize handle
                    }
                };

                return options;
            };

            service.getGridsterItem = function() {
                var gridsterItem = {
                    col: 0,
                    row: 0,
                    minSizeX: 0,
                    minSizeY: 0,
                    maxSizeX: 50,
                    maxSizeY: 50,
                    oldColumn: 0,
                    oldRow: 0,
                    oldSizeX: 3,
                    oldSizeY: 3
                };

                return gridsterItem;
            };

            service.getGridster = function() {
                var gridster = {
                    curColWidth: 89,
                    curRowHeight: 89,
                    curWidth: 1050,
                    colWidth: 'auto',
                    rowHeight: 'match'
                };

                return gridster;
            };

            return service;
        });
