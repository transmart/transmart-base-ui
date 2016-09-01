'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name GridsterService
 */
angular.module('transmartBaseUi').factory('GridsterService', ['$q', function ($q) {

    var _CONF = {
        //the numer of iterations for layout adjustment
        elId: null
    }

    var _isRangeWithin = function (targetRange, refRange) {
        var _is = false;
        if (targetRange.min >= refRange.min &&
            targetRange.max <= refRange.max) {
            _is = true;
        }
        return _is;
    }

    var _isRangeOverlapping = function (targetRange, refRange) {
        var _is = true;
        if (targetRange.min > refRange.max ||
            targetRange.max < refRange.min) {
            _is = false;
        }
        return _is;
    }

    var _moveToLeft = function (labels, targetLabel) {
        var move = null;
        //if there is room to move left
        if (targetLabel.col > 0) {
            move = {
                refLabel: null,
                steps: 1
            }
            var colRange = {
                min: 0,
                max: targetLabel.col - 1
            }
            var rowRange = {
                min: targetLabel.row,
                max: targetLabel.row + targetLabel.sizeY - 1
            }

            console.log('---------- targetLabel: ', targetLabel.name);
            console.log('row, col: ', targetLabel.row, targetLabel.col);
            console.log('targetLabel.colRange: ', colRange);
            console.log('targetLabel.rowRange: ', rowRange);

            var isBlockerFound = false;
            var isNeighborFound = false;

            labels.forEach(function (label) {
                if (!isNeighborFound && label.labelId !== targetLabel.labelId) {
                    var cRange = {
                        min: label.col,
                        max: label.col + label.sizeX - 1
                    }
                    var rRange = {
                        min: label.row,
                        max: label.row + label.sizeY - 1
                    }
                    console.log(' *** check ', label.name, ' with cRange: ', cRange, ', and rRange: ', rRange);

                    if (_isRangeWithin(cRange, colRange) &&
                        _isRangeOverlapping(rRange, rowRange)) {
                        isBlockerFound = true;
                        var steps = targetLabel.col - cRange.max;
                        console.log('!!! range within and range overlapping! steps = ', steps);
                        if(move.refLabel === null && steps > 1) {
                            console.log('$$$ a. steps = ', steps);
                            move.refLabel = label;
                            move.steps = steps;
                        }
                        else if(move.refLabel !== null && steps < move.steps) {
                            if(steps > 1) {
                                console.log('$$$ b. steps = ', steps);
                                move.refLabel = label;
                                move.steps = steps;
                            }
                            else{
                                move.refLabel = null;
                                move.steps = 1;
                                isNeighborFound = true;
                                console.log('isNeighborFound');
                            }
                        }
                    }
                }
            });//forEach

            if(isBlockerFound && move.refLabel !== null) {
                console.log('label col from ', targetLabel.col);
                targetLabel.col = targetLabel.col - move.steps + 1;
                console.log('a. move ', targetLabel, ' with move = ', move);
                console.log('label col to ', targetLabel.col);
            }
            else if(!isBlockerFound && move.refLabel === null) {
                move.steps = targetLabel.col;
                targetLabel.col = targetLabel.col - move.steps;
                console.log('b. move ', targetLabel, ' with move = ', move);
            }
            else {
                console.log('not moving');
            }

        }

        return move;
    }

    var _adjustLayout = function () {
        var labels = service.cohortChartContainerLabels;
        var _gWidth = angular.element(_CONF.elId).width();

        // Calculate the number of columns in the grid according to full gridster
        // grid size and the base square size. Adjust by -1 if number of columns
        // is not pair.
        var _gCols = Math.floor(_gWidth / service.config.G_BASE_WIDTH);
        _gCols = _gCols % 3 ? (_gCols % 3 === 1 ? _gCols - 1 : _gCols + 1) : _gCols;
        service.options.columns = _gCols;

        // For each label create a gridster item
        if (!labels) {
            labels = service.cohortChartContainerLabels;
        }

        labels.forEach(function (label, index) {
            // Spread items left to rigth
            label.col = (index * label.sizeX) % _gCols;
            // And top to bottom
            label.row = Math.floor((index * label.sizeX) / _gCols) * label.sizeY;
        });
    }

    var printInfo = function () {
        var labels = service.cohortChartContainerLabels;

        var test = _.map(labels, function (_l) {
            // console.log('name: ', _l.name, ', index: ', _l.labelId);
            console.log(_l.labelId, _l.name, ' ---------------------------- ');
            console.log('row:', _l.row, ', col:', _l.col, ', sizeX: ', _l.sizeX, ', sizeY: ', _l.sizeY);
            return {
                row: _l.row,
                col: _l.col,
                sizeX: _l.sizeX,
                sizeY: _l.sizeY
            }
        });
    }

    var _gridsterItemResizeStop = function (event, $element, targetLabel) {
        console.log('resize stop');
        // printInfo();
        // _adjustLayout();
    }

    var _gridsterItemDragStop = function (event, $element, targetLabel) {
        console.log('drag stop');
        // printInfo();
        // _adjustLayout();
    }

    var service = {
        options: {
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
            minSizeX: 1,
            // maximum column width of an item
            maxSizeX: null,
            // minumum row height of an item
            minSizeY: 1,
            // maximum row height of an item
            maxSizeY: null,
            resizable: {
                enabled: true,
                handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
                stop: _gridsterItemResizeStop
            },
            draggable: {
                enabled: true, // whether dragging items is supported
                handle: '.chart-drag-handle', // optional selector for resize handle
                stop: _gridsterItemDragStop
            }
        },
        config: {
            // Base width for a gridster square, this value will be adapted to fit
            // exaclty an even number of squares in the grid according to window size
            G_BASE_WIDTH: 230,
            // Number of columns a gridster item will occupy by default
            G_ITEM_SPAN_X: 1,
            // Number of rows a gridster item will occupy by default
            G_ITEM_SPAN_Y: 1
        },
        cohortChartContainerLabels: []
    };

    service.resize = function (elId, labels, reDistribute) {
        _CONF.elId = elId;
        // Get width of the full gridster grid
        var _gWidth = angular.element(elId).width();

        // Calculate the number of columns in the grid according to full gridster
        // grid size and the base square size. Adjust by -1 if number of columns
        // is not pair.
        var _gCols = Math.floor(_gWidth / service.config.G_BASE_WIDTH);
        _gCols = _gCols % 3 ? (_gCols % 3 === 1 ? _gCols - 1 : _gCols + 1) : _gCols;
        service.options.columns = _gCols;

        // For each label create a gridster item
        if (!labels) {
            labels = service.cohortChartContainerLabels;
        }

        labels.forEach(function (label, index) {
            if (!label.sizeX || reDistribute) {
                label.sizeX = service.config.G_ITEM_SPAN_X;
                label.sizeY = service.config.G_ITEM_SPAN_Y;
                // Spread items left to rigth
                label.col = (index * label.sizeX) % _gCols;
                // And top to bottom
                label.row = Math.floor((index * label.sizeX) / _gCols) * label.sizeY;
            }
        });

        service.cohortChartContainerLabels = labels;

        return labels;
    };

    return service;
}]);
