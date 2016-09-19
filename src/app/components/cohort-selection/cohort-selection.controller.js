'use strict';

angular.module('transmartBaseUi')
    .controller('CohortSelectionCtrl',
        ['$q', '$element', '$scope', 'CohortSelectionService', 'StudyListService', 'DcChartsService',
            'AlertService', '$uibModal',
            function ($q, $element, $scope, CohortSelectionService, StudyListService, DcChartsService,
                      AlertService, $uibModal) {
                var cohortSelectionCtrl = this;

                cohortSelectionCtrl.boxId = CohortSelectionService.currentBoxId;
                cohortSelectionCtrl.domElement = $element;
                cohortSelectionCtrl.mainContainerId =
                    CohortSelectionService.setElementAttrs($element, cohortSelectionCtrl.boxId);

                cohortSelectionCtrl.cs = {};
                cohortSelectionCtrl.gridsterOpts = {
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
                    mobileBreakPoint: 200, // if the screen is not wider that this, remove the grid layout and stack the items
                    mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
                    resizable: {
                        enabled: true,
                        handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw']
                    },
                    draggable: {
                        enabled: true, // whether dragging items is supported
                        handle: '.chart-drag-handle' // optional selector for resize handle
                    }
                };
                cohortSelectionCtrl.gridsterConfig = {
                    // Base width for a gridster square, this value will be adapted to fit
                    // exaclty an even number of squares in the grid according to window size
                    G_BASE_WIDTH: 200,
                    // Number of columns a gridster item will occupy by default
                    G_ITEM_SPAN_X: 1,
                    // Number of rows a gridster item will occupy by default
                    G_ITEM_SPAN_Y: 1
                }
                cohortSelectionCtrl.el = $element;

                /**
                 * Reset the cohort chart service to initial state
                 * @memberof CohortSelectionCtrl
                 */
                cohortSelectionCtrl.reset = function () {
                    cohortSelectionCtrl.cs = {};
                    cohortSelectionCtrl.cs.subjects = [];
                    cohortSelectionCtrl.cs.selectedSubjects = [];
                    cohortSelectionCtrl.cs.chartId = 0;
                    cohortSelectionCtrl.cs.charts = [];
                    cohortSelectionCtrl.cs.crossfilter = crossfilter();
                    cohortSelectionCtrl.cs.dimensions = [];
                    cohortSelectionCtrl.cs.maxNoOfDimensions = 20;
                    cohortSelectionCtrl.cs.groups = [];
                    cohortSelectionCtrl.cs.labels = [];
                    cohortSelectionCtrl.cs.selected = 0;
                    cohortSelectionCtrl.cs.total = 0;
                    cohortSelectionCtrl.cs.mainDimension = cohortSelectionCtrl.cs.crossfilter.dimension(function (d) {
                        return d.labels;
                    });
                };

                cohortSelectionCtrl.resize = function (reDistribute) {
                    var elId = '#' + cohortSelectionCtrl.mainContainerId;
                    var labels = cohortSelectionCtrl.cs.labels;
                    if(labels.length > 0) {
                        // Get width of the full gridster grid
                        var _gWidth = angular.element(elId).width();

                        // Calculate the number of columns in the grid according to full gridster
                        // grid size and the base square size. Adjust by -1 if number of columns
                        // is not pair.
                        var _gCols = Math.floor(_gWidth / cohortSelectionCtrl.gridsterConfig.G_BASE_WIDTH);
                        cohortSelectionCtrl.gridsterOpts.columns = _gCols;

                        // For each label create a gridster item
                        labels.forEach(function (label, index) {
                            if (!label.sizeX || reDistribute) {
                                label.sizeX = cohortSelectionCtrl.gridsterConfig.G_ITEM_SPAN_X;
                                label.sizeY = cohortSelectionCtrl.gridsterConfig.G_ITEM_SPAN_Y;
                                // Spread items left to right
                                label.col = (index * label.sizeX) % _gCols;
                                // And top to bottom
                                label.row = Math.floor((index * label.sizeX) / _gCols) * label.sizeY;
                            }
                        });
                    }

                    return labels;
                };

                /**
                 * Restore the data of the crossfilter to full set
                 * @memberOf CohortSelectionCtrl
                 */
                cohortSelectionCtrl.restoreCrossfilter = function () {
                    if (cohortSelectionCtrl.cs.subjects && cohortSelectionCtrl.cs.subjects.length > 0) {
                        cohortSelectionCtrl.cs.crossfilter = crossfilter(cohortSelectionCtrl.cs.subjects);
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                /**
                 * Get summary data
                 * @memberof CohortSelectionCtrl
                 */
                cohortSelectionCtrl.updateDimensions = function () {
                    cohortSelectionCtrl.cs.selected = cohortSelectionCtrl.cs.crossfilter.groupAll().value(); // # of selected subjects
                    cohortSelectionCtrl.cs.selectedSubjects = cohortSelectionCtrl.cs.mainDimension.top(Infinity);
                    cohortSelectionCtrl.cs.total = cohortSelectionCtrl.cs.crossfilter.size(); // # of total of subjects
                    cohortSelectionCtrl.cs.cohortLabels = cohortSelectionCtrl.cs.labels;
                };

                cohortSelectionCtrl.restoreCrossfilter();
                // Initialize the chart service only if uninitialized
                if (!cohortSelectionCtrl.cs.mainDimension) {
                    cohortSelectionCtrl.reset();
                }

                $scope.$watchCollection(function () {
                    return cohortSelectionCtrl.cs;
                }, function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        $scope.$emit('cohortSelectionUpdateEvent');
                    }
                });

                /**
                 * Clear all the charts from the current cohort selection
                 */
                cohortSelectionCtrl.clearSelection = function () {
                    cohortSelectionCtrl.reset();
                    cohortSelectionCtrl.updateDimensions();
                };

                var _numDisplay = function (cDimension, cGroup, el) {
                    var _number = dc.numberDisplay(el);
                    _number.group(cGroup)
                        .html({
                            one: '%number',
                            some: '%number',
                            none: '%number'
                        })
                        .formatNumber(d3.format('f'));
                    return _number;
                };

                var _groupCharts = function (chart1, chart2) {
                    var _combinationLabel = {
                        labelId: cohortSelectionCtrl.cs.chartId++,
                        label: [chart1.tsLabel, chart2.tsLabel],
                        name: chart1.tsLabel.name + ' - ' + chart2.tsLabel.name,
                        resolved: false,
                        study: chart1.tsLabel.study,
                        type: 'combination',
                        boxId: cohortSelectionCtrl.boxId
                    };
                    cohortSelectionCtrl.cs.subjects.forEach(function (subject) {
                        if (subject.labels[chart1.tsLabel.labelId] || subject.labels[chart2.tsLabel.labelId]) {
                            subject.labels[_combinationLabel.labelId] = [subject.labels[chart1.tsLabel.labelId],
                                subject.labels[chart2.tsLabel.labelId]];
                        }
                    });
                    cohortSelectionCtrl.cs.labels.push(_combinationLabel);
                };

                var _groupingChart = {};

                cohortSelectionCtrl.groupCharts = function (newChart, turnOff) {
                    // If a first chart was already selected, group them together
                    if (_groupingChart.chartOne) {
                        _groupCharts(newChart, _groupingChart.chartOne);
                        // Turn off both selection lights
                        _groupingChart.turnOff();
                        turnOff();
                        _groupingChart = {};
                        // If this is the first chart selected
                    } else {
                        _groupingChart.chartOne = newChart;
                        _groupingChart.turnOff = turnOff;
                    }
                };

                /**
                 * Get the last token when requested model is a string path
                 * @memberof CohortSelectionCtrl
                 * @param {String} what
                 * @returns {*}
                 */
                var _getLastToken = function (what) {
                    var _t = what.split('\\').slice(1);
                    return what.indexOf('\\') === -1 ? what : _t[_t.length - 2];
                };

                var _getType = function (value) {
                    var _type = typeof value;
                    if (_type === 'string') {
                        if (value === 'E' || value === 'MRNA') {
                            _type = 'highdim';
                        }
                    } else if (_type === 'number') {
                        if ((value % 1) !== 0) {
                            _type = 'float';
                        }
                    }
                    return _type;
                };

                /**
                 * Add new label to list and check data type
                 * @param obs
                 * @param node
                 * @param filterObj
                 * @returns {int} labelId
                 * @private
                 */
                var _addLabel = function (obs, node, filterObj) {
                    // Check if label has already been added
                    var label = _.find(cohortSelectionCtrl.cs.labels, {label: obs.label});
                    var filters;

                    if (filterObj) {
                        filters = filterObj.filterWords;
                    }

                    if (!label) {

                        //Check that the maximum number of dimensions has not been reached
                        if (cohortSelectionCtrl.cs.labels.length < cohortSelectionCtrl.cs.maxNoOfDimensions) {
                            // Create the new label object

                            label = {
                                label: obs.label,
                                type: _getType(obs.value),
                                name: _getLastToken(obs.label),
                                labelId: cohortSelectionCtrl.cs.chartId++,
                                study: node.study,
                                resolved: false,
                                filters: filters,
                                boxId: cohortSelectionCtrl.boxId
                            };
                            cohortSelectionCtrl.cs.labels.push(label);

                        } else {
                            AlertService.add('danger', 'Max number of dimensions reached !', 2000);
                        }
                    } else {
                        // if label already exists check its type
                        label.type = label.type === 'float' ? label.type : _getType(obs.value);
                    }

                    if (label.type === 'float') {
                        var precision = (obs.value + '').split('.');
                        precision = precision[1] ? precision[1].length : 0;
                        label.precision = label.precision ? Math.min(label.precision, precision) : precision;
                    }

                    return label.labelId;
                };

                /**
                 * @memberof CohortSelectionCtrl
                 * @param {String} chartName -
                 *      The chart name as the search word for the chart with tsLabel with the same string
                 * @returns {*} - The found chart in CohortSelectionCtrl.cs.charts,
                 *      with matching name chartName, if not found, return null
                 */
                var _findChartByName = function (chartName) {
                    var foundChart = null;
                    cohortSelectionCtrl.cs.charts.forEach(function (_chart) {
                        if (_chart.tsLabel.label == chartName) {
                            foundChart = _chart;
                        }
                    });
                    return foundChart;
                }

                /**
                 * Give a chart instance (normally a pie chart), filter it based on an array of words
                 * @memberof CohortSelectionCtrl
                 * @param {Object} chart - The chart instance in CohortSelectionCtrl.cs.charts
                 * @param {Array} filters - The filtering words or criteria that filter the chart
                 */
                function _filterChart(chart, filters) {
                    if (_.isArray(filters) && filters.length > 0) {
                        filters.forEach(function (_f) {
                            chart.filter(_f);
                        });
                        cohortSelectionCtrl.updateDimensions();
                        dc.renderAll();
                    }
                }

                /**
                 * Fetch the data for the selected node
                 * @memberof CohortSelectionCtrl
                 * @param {Object} node
                 * @param {Array} filters
                 * @returns {*}
                 */
                cohortSelectionCtrl.addNodeToActiveCohortSelection = function (node, filters) {
                    var _filter, _deferred = $q.defer();

                    var _getFilter = function (label, filters) {
                        return _.find(filters, {label: label});
                    };

                    // Get all observations under the selected concept
                    node.restObj.one('observations').get().then(function (observations) {
                        observations = observations._embedded.observations;

                        observations.forEach(function (obs) {
                            if (obs.value !== null) {

                                if (filters) {
                                    _filter = _getFilter(obs.label, filters);
                                }

                                // Add the concept to the list of chart labels
                                var _newLabelId = _addLabel(obs, node, _filter);

                                // Check if the subject of the observation is already present
                                var foundSubject = _.find(cohortSelectionCtrl.cs.subjects,
                                    {id: obs._embedded.subject.id});

                                if (foundSubject) {
                                    foundSubject.labels[_newLabelId] = obs.value;
                                } else {
                                    obs._embedded.subject.labels = {};
                                    obs._embedded.subject.labels[_newLabelId] = obs.value;
                                    cohortSelectionCtrl.cs.subjects.push(obs._embedded.subject);
                                    cohortSelectionCtrl.cs.crossfilter.add([obs._embedded.subject]);
                                }
                            }
                        });

                        // Notify the applicable controller that the chart directive instances
                        // can be created
                        cohortSelectionCtrl.resize(true);
                        cohortSelectionCtrl.updateDimensions();
                        _deferred.resolve();
                    }, function (err) {
                        _deferred.reject('Cannot get data from the end-point.' + err);
                    });

                    return _deferred.promise;
                };


                /**
                 * Remove label from subjects and remove subjects no longer associated with any given label
                 * @memberof CohortSelectionCtrl
                 * @param {Array} subjects
                 * @param {String} label
                 * @returns {*}
                 */
                cohortSelectionCtrl.filterSubjectsByLabel = function (subjects, label) {
                    subjects.forEach(function (subject, subjectIdx) {
                        subject.labels = _.filter(subject.labels, function (subjectLabel, subjectLabelIdx) {
                            return subjectLabelIdx !== label.labelId;
                        });
                        if (subject.labels.length < 1) {
                            subjects.splice(subjectIdx, 1);
                        }
                    });
                    return subjects;
                };

                /**
                 * Remove a label from label collection
                 * @memberof CohortSelectionCtrl
                 * @param {Array} labels
                 * @param {Object} label
                 * @returns {Array}
                 */
                var _removeLabelFromLabels = function (labels, label) {
                    return _.reject(labels, function (el) {
                        return el.labelId === label.labelId;
                    });
                };

                /**
                 * Remove a chart from chart collection
                 * @memberof CohortSelectionCtrl
                 * @param {Array} charts
                 * @param {Object} label
                 * @returns {Array}
                 */
                var _removeChartFromCharts = function (charts, label) {
                    return _.filter(charts, function (chartToBeRemoved) {
                        if (chartToBeRemoved.id === label.labelId) {
                            chartToBeRemoved.filter(null); // clear filter
                        }
                        return chartToBeRemoved.id !== label.labelId;
                    });
                };

                /**
                 * Clear chart's filter
                 * @memberof CohortSelectionCtrl
                 * @param {Object} label
                 * @returns {Object} chart
                 */
                cohortSelectionCtrl.clearChartFilterByLabel = function (label) {
                    var chart;
                    chart = _.find(cohortSelectionCtrl.cs.charts, {id: label.labelId});
                    if (chart) {
                        chart.filter(null);
                        dc.redrawAll();
                        cohortSelectionCtrl.updateDimensions();
                    }
                    return chart;
                };

                /**
                 * Remove label from cohort selection
                 * @memberof CohortSelectionCtrl
                 * @param {Object} label
                 */
                cohortSelectionCtrl.removeLabel = function (label) {
                    if (label) {
                        // Remove associated chart from cs.charts
                        cohortSelectionCtrl.cs.charts = _removeChartFromCharts(cohortSelectionCtrl.cs.charts, label);

                        // Remove label from cs.labels
                        cohortSelectionCtrl.cs.labels = _removeLabelFromLabels(cohortSelectionCtrl.cs.labels, label);

                        // Remove label from cs.subjects and remove subjects no longer associated
                        // with any label
                        cohortSelectionCtrl.cs.subjects =
                            cohortSelectionCtrl.filterSubjectsByLabel(cohortSelectionCtrl.cs.subjects, label);

                        // Remove dimension and group associated with the label
                        cohortSelectionCtrl.cs.dimensions.splice(label.labelId);
                        cohortSelectionCtrl.cs.groups.splice(label.labelId);
                        // Remove data in crossfilter if no more label is selected
                        if (cohortSelectionCtrl.cs.labels.length < 1) {
                            // Removes all records that match the current filter
                            cohortSelectionCtrl.cs.crossfilter.remove();
                        }
                        // Update dimension summary
                        if (cohortSelectionCtrl.cs.labels.length > 0) {
                            cohortSelectionCtrl.updateDimensions();
                        } else {
                            cohortSelectionCtrl.reset();
                        }
                    }
                };

                var _createMultidimensionalChart = function (label, el) {
                    var _chart, _min, _max;
                    var boxId = label.boxId;

                    // Check if label0 or label1 has categorical values
                    if (label.label[0].type === 'string' || label.label[1].type === 'string') {

                        // Check if one of them is not categorical
                        if (label.label[0].type !== 'string' || label.label[1].type !== 'string') {

                            // Always categorical on X axis
                            var _valueX = label.label[0].type === 'string' ? 0 : 1;
                            var _valueY = _valueX === 0 ? 1 : 0;

                            cohortSelectionCtrl.cs.dimensions[label.labelId] =
                                cohortSelectionCtrl.cs.crossfilter.dimension(function (d) {
                                    return d.labels[label.labelId] ? d.labels[label.labelId][_valueX] : undefined;
                                });
                            cohortSelectionCtrl.cs.groups[label.labelId] =
                                cohortSelectionCtrl.cs.dimensions[label.labelId].group().reduce(
                                    function (p, v) {
                                        p.push(v.labels[label.labelId] ? +v.labels[label.labelId][_valueY] : undefined);
                                        return p;
                                    },
                                    function (p, v) {
                                        p.splice(p.indexOf(v.labels[label.labelId] ? +v.labels[label.labelId][_valueY] : undefined), 1);
                                        return p;
                                    },
                                    function () {
                                        return [];
                                    }
                                );

                            _max = cohortSelectionCtrl.cs.dimensions[label.label[_valueY].labelId]
                                .top(1)[0].labels[label.label[_valueY].labelId];
                            _min = cohortSelectionCtrl.cs.dimensions[label.label[_valueY].labelId]
                                .bottom(1)[0].labels[label.label[_valueY].labelId];

                            _chart = DcChartsService.getBoxPlot(cohortSelectionCtrl.cs.dimensions[label.labelId],
                                cohortSelectionCtrl.cs.groups[label.labelId], el, {
                                    xLab: label.label[_valueX].name,
                                    yLab: label.label[_valueY].name,
                                    min: _min,
                                    max: _max
                                });

                            _chart.type = 'BOXPLOT';

                        } else {
                            // Both labels are categorical
                            cohortSelectionCtrl.cs.dimensions[label.labelId] =
                                cohortSelectionCtrl.cs.crossfilter.dimension(function (d) {
                                    return [d.labels[label.labelId] ? d.labels[label.labelId][0] : undefined,
                                        d.labels[label.labelId] ? d.labels[label.labelId][1] : undefined];
                                });
                            cohortSelectionCtrl.cs.groups[label.labelId] =
                                cohortSelectionCtrl.cs.dimensions[label.labelId].group();

                            _chart = DcChartsService.getHeatMap(cohortSelectionCtrl.cs.dimensions[label.labelId],
                                cohortSelectionCtrl.cs.groups[label.labelId], el, {
                                    xLab: label.label[0].name,
                                    yLab: label.label[1].name
                                });

                            _chart.type = 'HEATMAP';

                        }
                    } else {
                        // Both labels are numerical, create a scatter plot
                        cohortSelectionCtrl.cs.dimensions[label.labelId] =
                            cohortSelectionCtrl.cs.crossfilter.dimension(function (d) {
                                return [d.labels[label.labelId] ? d.labels[label.labelId][0] : undefined,
                                    d.labels[label.labelId] ? d.labels[label.labelId][1] : undefined];
                            });

                        cohortSelectionCtrl.cs.groups[label.labelId] =
                            cohortSelectionCtrl.cs.dimensions[label.labelId].group();

                        _max = cohortSelectionCtrl.cs.dimensions[label.label[0].labelId]
                            .top(1)[0].labels[label.label[0].labelId];
                        _min = cohortSelectionCtrl.cs.dimensions[label.label[0].labelId]
                            .bottom(1)[0].labels[label.label[0].labelId];

                        _chart = DcChartsService.getScatterPlot(
                            cohortSelectionCtrl.cs.dimensions[label.labelId],
                            cohortSelectionCtrl.cs.groups[label.labelId],
                            el,
                            {
                                min: _min,
                                max: _max,
                                xLab: label.label[0].name,
                                yLab: label.label[1].name
                            }
                        );

                        _chart.type = 'SCATTER';
                    }

                    return _chart;
                };

                /**
                 * Create the charts for each selected label
                 * @memberof CohortSelectionCtrl
                 * @param {Object} label
                 * @param {Object} el
                 */
                cohortSelectionCtrl.createCohortChart = function (label, el) {
                    var _chart;

                    /**
                     * @param _missingLabelId
                     * @private
                     */
                    var _defaultDim = function (_missingLabelId) {
                        cohortSelectionCtrl.cs.dimensions[label.labelId] =
                            cohortSelectionCtrl.cs.crossfilter.dimension(function (d) {
                                var lbl = _missingLabelId || undefined;
                                return d.labels[label.labelId] === undefined ? lbl : d.labels[label.labelId];
                            });
                        cohortSelectionCtrl.cs.groups[label.labelId] =
                            cohortSelectionCtrl.cs.dimensions[label.labelId].group();
                    };

                    if (label.type === 'combination') {
                        _chart = _createMultidimensionalChart(label, el);
                    } else {
                        // Create a number display if highdim
                        if (label.type === 'highdim') {
                            _defaultDim();
                            _chart = _numDisplay(cohortSelectionCtrl.cs.dimensions[label.labelId],
                                cohortSelectionCtrl.cs.groups[label.labelId], el);
                            _chart.type = 'NUMBER';

                            // Create a PIECHART if categorical
                        } else if (label.type === 'string' || label.type === 'object') {
                            _defaultDim("N/A");
                            _chart = DcChartsService.getPieChart(cohortSelectionCtrl.cs.dimensions[label.labelId],
                                cohortSelectionCtrl.cs.groups[label.labelId], el);
                            _chart.type = 'PIECHART';

                            // Create a BARCHART if numerical
                        } else if (label.type === 'number') {
                            _defaultDim(Infinity);
                            var group = cohortSelectionCtrl.cs.dimensions[label.labelId].group();
                            // Filter out all records that do not have a value (which are set to Infinity in the dimension)
                            // To do this, we clone the group (we want to keep the methods) and override all().
                            var filteredGroup = {};
                            angular.copy(group, filteredGroup);
                            filteredGroup.all = function () {
                                return group.all().filter(function (d) {
                                    return d.key != Infinity;
                                });
                            };
                            cohortSelectionCtrl.cs.groups[label.labelId] = filteredGroup;
                            _chart = DcChartsService.getBarChart(cohortSelectionCtrl.cs.dimensions[label.labelId],
                                filteredGroup, el, {nodeTitle: label.name});
                            _chart.type = 'BARCHART';

                            // Create a BARCHART WITH BINS if floating point values
                        } else if (label.type === 'float') {
                            cohortSelectionCtrl.cs.dimensions[label.labelId] =
                                cohortSelectionCtrl.cs.crossfilter.dimension(function (d) {
                                return d.labels[label.labelId] ===
                                    undefined ? undefined : d.labels[label.labelId].toFixed(label.precision === 0 ? 0 : label.precision);
                            });
                            cohortSelectionCtrl.cs.groups[label.labelId] =
                                cohortSelectionCtrl.cs.dimensions[label.labelId].group();
                            _chart = DcChartsService.getBarChart(cohortSelectionCtrl.cs.dimensions[label.labelId],
                                cohortSelectionCtrl.cs.groups[label.labelId],
                                el, {nodeTitle: label.name, float: true, precision: label.precision});
                            _chart.type = 'BARCHART';
                        }
                    }

                    _chart.id = label.labelId;//update id
                    _chart.tsLabel = label;//update tsLabel
                    _chart.el = el;//update html obj

                    /*
                     * when a sub-categorical label is dropped and the corresponding (parent) pie-chart is created,
                     * apply the filter of the sub-category on the chart
                     */
                    if (label.filters !== undefined) {
                        _filterChart(_chart, label.filters);
                    }

                    //this listener function will be invoked after a filter is applied, added or removed.
                    _chart.on('filtered', _handleChartFilteredEvent);

                    //this listener function will be invoked after transitions after redraw and render.
                    _chart.on('renderlet', _handleChartRenderletEvent);

                    _chart.render(); // render chart here

                    this.cs.charts.push(_chart);

                    return _chart;
                };

                function _handleChartFilteredEvent(chart, filter) {
                    /*
                     * keep the tsLabel.filters to be in sync with chart.filters()
                     */
                    chart.tsLabel.filters = chart.filters();
                    cohortSelectionCtrl.updateDimensions();
                }

                function _handleChartRenderletEvent(chart, filter) {
                    DcChartsService.emphasizeChartLegend(chart);
                }


                /**
                 * Return active filters
                 * @memberof CohortSelectionCtrl
                 */
                cohortSelectionCtrl.getCohortFilters = function () {
                    var _filters = [];

                    if (cohortSelectionCtrl.cs.charts) {
                        _.each(cohortSelectionCtrl.cs.charts, function (c, _index) {
                            _filters.push({
                                name: cohortSelectionCtrl.cs.labels[_index].name,
                                label: cohortSelectionCtrl.cs.labels[_index].label,
                                type: cohortSelectionCtrl.cs.labels[_index].type,
                                study: cohortSelectionCtrl.cs.labels[_index].study,
                                filters: c.filters()
                            });
                        });
                    }

                    return _filters;
                };

                /**
                 * Handle node drop from study-accordion to cohort-selection panel.
                 * Remark: node.restObj.fullName is equivalent to chart.tsLabel.label
                 * @memberof CohortSelectionCtrl
                 * @param event
                 * @param info
                 * @param node Dropped node from the study tree
                 */
                cohortSelectionCtrl.onNodeDrop = function (event, info, node) {
                    if (node.type === 'CATEGORICAL_OPTION') { //leaf node for pie chart
                        var chart = _findChartByName(node.parent.restObj.fullName);
                        if (chart == null) {
                            var filters = [{
                                label: node.parent.restObj.fullName,
                                filterWords: [node.title]
                            }];
                            cohortSelectionCtrl.addNodeToActiveCohortSelection(node.parent, filters);
                        }
                        else {
                            _filterChart(chart, [node.title]);
                        }
                    }
                    else {
                        cohortSelectionCtrl.addNodeToActiveCohortSelection(node, []);
                    }
                    angular.element(event.target).removeClass('chart-container-hover');
                };

                /**
                 * Add class when on node over the chart container
                 * @param e
                 */
                cohortSelectionCtrl.onNodeOver = function (e) {
                    return angular.element(e.target).addClass('chart-container-hover');
                };

                /**
                 * Remove class when on node over the chart container
                 * @param e
                 */
                cohortSelectionCtrl.onNodeOut = function (e) {
                    angular.element(e.target).removeClass('chart-container-hover');
                };

                /**
                 * Saves the cohort by asking for a name, saving it to the backend
                 * and showing the resulting id
                 */
                cohortSelectionCtrl.openSaveCohortModal = function () {
                    CohortSelectionService.currentBoxId = cohortSelectionCtrl.boxId;
                    $uibModal.open({
                        templateUrl: 'app/components/save-cohort/save-cohort-dialog.tpl.html',
                        controller: 'SaveCohortDialogCtrl as vm',
                        animation: false
                    });
                };

                /**
                 * Add cohort-selection box
                 */
                cohortSelectionCtrl.addBox = function () {
                    CohortSelectionService.addBox();
                    // var s = angular.element('#'+ cohortSelectionCtrl.mainContainerId).scope();
                    // console.log(s);
                };

                /**
                 * Remove the current cohort-selection box
                 */
                cohortSelectionCtrl.removeBox = function () {
                    cohortSelectionCtrl.clearSelection();
                    CohortSelectionService.removeBox(cohortSelectionCtrl.boxId);
                };

            }]);
