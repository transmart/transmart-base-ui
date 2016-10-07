'use strict';

angular.module('transmartBaseUi')
    .controller('CohortSelectionCtrl',
        ['$q', '$element', '$scope', 'CohortSelectionService', 'StudyListService', 'DcChartsService',
            'AlertService', '$uibModal',
            function ($q, $element, $scope, CohortSelectionService, StudyListService, DcChartsService,
                      AlertService, $uibModal) {
                var vm = this;
                vm.isRecordingHistory = true;
                vm.boxId = CohortSelectionService.currentBoxId;
                vm.boxName = 'Cohort-' + (+$scope.index+1);
                vm.boxElm = $element;
                vm.boxes = CohortSelectionService.boxes;
                vm.domElement = $element;
                vm.mainContainerId =
                    CohortSelectionService.setElementAttrs($element, vm.boxId);
                vm.history = [];

                vm.cs = {};
                vm.gridsterOpts = {
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
                vm.gridsterConfig = {
                    // Base width for a gridster square, this value will be adapted to fit
                    // exaclty an even number of squares in the grid according to window size
                    G_BASE_WIDTH: 200,
                    // Number of columns a gridster item will occupy by default
                    G_ITEM_SPAN_X: 1,
                    // Number of rows a gridster item will occupy by default
                    G_ITEM_SPAN_Y: 1
                };

                /**
                 * Reset the cohort chart service to initial state
                 * @memberof CohortSelectionCtrl
                 */
                vm.reset = function () {
                    vm.cs = {};
                    vm.cs.subjects = [];
                    vm.cs.selectedSubjects = [];
                    vm.cs.chartId = 0;
                    vm.cs.charts = [];
                    vm.cs.crossfilter = crossfilter();
                    vm.cs.dimensions = [];
                    vm.cs.maxNoOfDimensions = 20;
                    vm.cs.groups = [];
                    vm.cs.labels = [];
                    vm.cs.nodes = [];
                    vm.cs.selected = 0;
                    vm.cs.total = 0;
                    vm.cs.mainDimension = vm.cs.crossfilter.dimension(function (d) {
                        return d.labels;
                    });
                    vm.history = [];
                };

                /**
                 * Rearrange the gridster layout of the charts
                 * @param {boolean} if redistribute
                 * @memberof CohortSelectionCtrl
                 */
                vm.resize = function (reDistribute) {
                    var elId = '#' + vm.mainContainerId;
                    var labels = vm.cs.labels;
                    if (labels.length > 0) {
                        // Get width of the full gridster grid
                        var _gWidth = angular.element(elId).width();

                        // Calculate the number of columns in the grid according to full gridster
                        // grid size and the base square size. Adjust by -1 if number of columns
                        // is not pair.
                        var _gCols = Math.floor(_gWidth / vm.gridsterConfig.G_BASE_WIDTH);
                        vm.gridsterOpts.columns = _gCols;

                        // For each label create a gridster item
                        labels.forEach(function (label, index) {
                            if (!label.sizeX || reDistribute) {
                                label.sizeX = vm.gridsterConfig.G_ITEM_SPAN_X;
                                label.sizeY = vm.gridsterConfig.G_ITEM_SPAN_Y;
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
                vm.restoreCrossfilter = function () {
                    if (vm.cs.subjects && vm.cs.subjects.length > 0) {
                        vm.cs.crossfilter = crossfilter(vm.cs.subjects);
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
                vm.updateDimensions = function () {
                    vm.cs.selected = vm.cs.crossfilter.groupAll().value(); // # of selected subjects
                    vm.cs.selectedSubjects = vm.cs.mainDimension.top(Infinity);
                    vm.cs.total = vm.cs.crossfilter.size(); // # of total of subjects
                    vm.cs.cohortLabels = vm.cs.labels;
                };

                vm.restoreCrossfilter();
                // Initialize the chart service only if uninitialized
                if (!vm.cs.mainDimension) {
                    vm.reset();
                }

                $scope.$watchCollection(function () {
                    return vm.cs;
                }, function (newValue, oldValue) {
                    if (!_.isEqual(newValue, oldValue)) {
                        $scope.$emit('cohortSelectionUpdateEvent');
                    }
                });

                /**
                 * Clear all the charts from the current cohort selection
                 */
                vm.clearSelection = function () {
                    vm.reset();
                    vm.updateDimensions();
                };

                var _numDisplay = function (label, cGroup, el) {

                    cGroup.reduce(
                        function (p, v) {
                            return v.observations[label.conceptPath] ? p + 1 : p;
                        },
                        function (p, v) {
                            return v.observations[label.conceptPath] ? p - 1 : p;
                        },
                        function () {
                            return 0;
                        }
                    );

                    return dc.numberDisplay(el)
                        .group(cGroup)
                        .html({
                            one: '%number',
                            some: '%number',
                            none: '%number'
                        })
                        .formatNumber(d3.format('.0'));
                };

                var _groupCharts = function (chart1, chart2) {
                    var _combinationLabel = {
                        labelId: vm.cs.chartId++,
                        label: [chart1.tsLabel, chart2.tsLabel],
                        name: chart1.tsLabel.name + ' - ' + chart2.tsLabel.name,
                        resolved: false,
                        study: chart1.tsLabel.study,
                        type: 'combination',
                        boxId: vm.boxId,
                        box: CohortSelectionService.getBox(vm.boxId)
                    };

                    vm.cs.subjects.forEach(function (subject) {
                        if (subject.observations[chart1.tsLabel.conceptPath] ||
                            subject.observations[chart2.tsLabel.conceptPath]) {

                            subject.observations[_combinationLabel.name] = [
                                subject.observations[chart1.tsLabel.conceptPath],
                                subject.observations[chart2.tsLabel.conceptPath]
                            ];

                        }
                    });

                    vm.cs.labels.push(_combinationLabel);
                };

                var _groupingChart = {};

                vm.groupCharts = function (newChart, turnOff) {
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
                    var label = _.find(vm.cs.labels, {label: obs.label});
                    var filters;

                    if (filterObj) {
                        filters = filterObj.filterWords;
                    }

                    if (!label) {

                        //Check that the maximum number of dimensions has not been reached
                        if (vm.cs.labels.length < vm.cs.maxNoOfDimensions) {
                            // Create the new label object
                            label = {
                                label: obs.label,
                                conceptPath: obs.label,
                                type: _getType(obs.value),
                                name: _getLastToken(obs.label),
                                labelId: vm.cs.chartId++,
                                study: node.study,
                                resolved: false,
                                filters: filters,
                                boxId: vm.boxId,
                                box: CohortSelectionService.getBox(vm.boxId)
                            };
                            vm.cs.labels.push(label);

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
                    return label;
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
                    vm.cs.charts.forEach(function (_chart) {
                        if (_chart.tsLabel.label == chartName) {
                            foundChart = _chart;
                        }
                    });
                    return foundChart;
                };

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
                        vm.updateDimensions();
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
                vm.addNodeToActiveCohortSelection = function (node, filters) {
                    var _filter, _deferred = $q.defer();

                    var _getFilter = function (label, filters) {
                        return _.find(filters, {label: label});
                    };

                    // Get all observations under the selected concept
                    node.restObj.one('observations').get().then(function (observations) {
                        vm.addNode(node);
                        observations = observations._embedded.observations;

                        observations.forEach(function (obs) {
                            if (obs.value !== null) {

                                if (filters) {
                                    _filter = _getFilter(obs.label, filters);
                                }

                                // Add the concept to the list of chart labels
                                var _newLabel = _addLabel(obs, node, _filter);

                                // Check if the subject of the observation is already present
                                var foundSubject = _.find(vm.cs.subjects,
                                    {id: obs._embedded.subject.id});

                                if (foundSubject) {
                                    foundSubject.observations[_newLabel.conceptPath] = obs.value;
                                } else {
                                    obs._embedded.subject.observations = {};
                                    obs._embedded.subject.observations[_newLabel.conceptPath] = obs.value;
                                    vm.cs.subjects.push(obs._embedded.subject);
                                    vm.cs.crossfilter.add([obs._embedded.subject]);
                                }
                            }
                        });
                        // Notify the applicable controller that the chart directive instances
                        // can be created
                        vm.resize(false);
                        vm.updateDimensions();
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
                vm.filterSubjectsByLabel = function (subjects, label) {
                    subjects.forEach(function (subject, subjectIdx) {
                        delete subject.observations[label.conceptPath];
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
                vm.clearChartFilterByLabel = function (label) {
                    var chart;
                    chart = _.find(vm.cs.charts, {id: label.labelId});
                    if (chart) {
                        chart.filter(null);
                        dc.redrawAll();
                        vm.updateDimensions();
                    }
                    return chart;
                };

                /**
                 * Clear the filters of the charts and reset their gridster layout
                 * @memberof CohortSelectionCtrl
                 */
                vm.resetCharts = function () {
                    vm.cs.charts.forEach(function (_chart) {
                        _chart.filter(null);
                    });
                    vm.updateDimensions();
                    vm.resize(true);
                    dc.redrawAll();
                };

                /**
                 * Remove label from cohort selection
                 * @memberof CohortSelectionCtrl
                 * @param {Object} label
                 */
                vm.removeLabel = function (label) {
                    var _deferred = $q.defer();

                    if (label) {
                        vm.removeNode(label);
                        // Remove associated chart from cs.charts
                        vm.cs.charts = _removeChartFromCharts(vm.cs.charts, label);

                        // Remove label from cs.labels
                        vm.cs.labels = _removeLabelFromLabels(vm.cs.labels, label);

                        // Remove label from cs.subjects and remove subjects no longer associated
                        // with any label
                        vm.cs.subjects =
                            vm.filterSubjectsByLabel(vm.cs.subjects, label);

                        // Remove dimension and group associated with the label
                        vm.cs.dimensions.splice(label.labelId);
                        vm.cs.groups.splice(label.labelId);
                        // Remove data in crossfilter if no more label is selected
                        if (vm.cs.labels.length < 1) {
                            // Removes all records that match the current filter
                            vm.cs.crossfilter.remove();
                        }
                        // Update dimension summary
                        if (vm.cs.labels.length > 0) {
                            vm.updateDimensions();
                        } else {
                            vm.reset();
                        }

                        vm.addHistory('removeLabel', [label]);
                        _deferred.resolve();
                    }
                    else {
                        _deferred.reject('label is not defined');
                    }

                    dc.renderAll();
                    return _deferred.promise;
                };

                var _createMultidimensionalChart = function (label, el) {
                    var _chart, _min, _max, label1 = label.label[0], label2 = label.label[1];

                    // Check if label0 or label1 has categorical values
                    if (label.label[0].type === 'string' || label.label[1].type === 'string') {

                        // Check if one of them is not categorical
                        if (label.label[0].type !== 'string' || label.label[1].type !== 'string') {

                            // Always categorical on X axis
                            var _valueX = label.label[0].type === 'string' ? 0 : 1;
                            var _valueY = _valueX === 0 ? 1 : 0;

                            vm.cs.dimensions[label.labelId] =
                                vm.cs.crossfilter.dimension(function (d) {
                                    return d.observations[label.label[_valueX].conceptPath] ?
                                        d.observations[label.label[_valueX].conceptPath] : undefined;
                                });

                            vm.cs.groups[label.labelId] =
                                vm.cs.dimensions[label.labelId].group().reduce(
                                    function (p, v) {
                                        p.push(v.observations[label.label[_valueY].conceptPath] ?
                                            +v.observations[label.label[_valueY].conceptPath] : undefined);
                                        return p;
                                    },
                                    function (p, v) {
                                        p.splice(p.indexOf(v.observations[label.label[_valueY].conceptPath] ?
                                            +v.observations[label.label[_valueY].conceptPath] : undefined), 1);
                                        return p;
                                    },
                                    function () {
                                        return [];
                                    }
                                );

                            _max = vm.cs.dimensions[label.label[_valueY].labelId]
                                .top(1)[0].observations[label.label[_valueY].conceptPath];
                            _min = vm.cs.dimensions[label.label[_valueY].labelId]
                                .bottom(1)[0].observations[label.label[_valueY].conceptPath];

                            _chart = DcChartsService.getBoxPlot(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId], el, {
                                    xLab: label.label[_valueX].name,
                                    yLab: label.label[_valueY].name,
                                    min: _min,
                                    max: _max
                                });

                            _chart.type = 'BOXPLOT';

                        } else {
                            // Both labels are categorical
                            vm.cs.dimensions[label.labelId] =
                                vm.cs.crossfilter.dimension(function (d) {
                                    return [
                                        d.observations[label.label[0].conceptPath] ?
                                            d.observations[label.label[0].conceptPath] : undefined,
                                        d.observations[label.label[1].conceptPath] ?
                                            d.observations[label.label[1].conceptPath] : undefined
                                    ];
                                });
                            vm.cs.groups[label.labelId] = vm.cs.dimensions[label.labelId].group();

                            _chart = DcChartsService.getHeatMap(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId], el, {
                                    xLab: label.label[0].name,
                                    yLab: label.label[1].name
                                });
                            _chart.type = 'HEATMAP';

                        }
                    } else {
                        // Both labels are numerical, create a scatter plot
                        vm.cs.dimensions[label.labelId] =
                            vm.cs.crossfilter.dimension(function (d) {
                                return [
                                    d.observations[label.label[0].conceptPath] ?
                                        d.observations[label.label[0].conceptPath] : undefined,
                                    d.observations[label.label[1].conceptPath] ?
                                        d.observations[label.label[1].conceptPath] : undefined
                                ];
                            });

                        vm.cs.groups[label.labelId] =
                            vm.cs.dimensions[label.labelId].group();

                        _max = vm.cs.dimensions[label.label[0].labelId]
                            .top(1)[0].observations[label.label[0].conceptPath];
                        _min = vm.cs.dimensions[label.label[0].labelId]
                            .bottom(1)[0].observations[label.label[0].conceptPath];

                        _chart = DcChartsService.getScatterPlot(
                            vm.cs.dimensions[label.labelId],
                            vm.cs.groups[label.labelId],
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
                vm.createCohortChart = function (label, el) {
                    var _chart;
                    /**
                     * @param _missingLabelId
                     * @private
                     */
                    var _defaultDim = function (_missingLabelId) {
                        var lbl = _missingLabelId || undefined;
                        vm.cs.dimensions[label.labelId] =
                            vm.cs.crossfilter.dimension(function (d) {
                                var lbl = _missingLabelId || undefined;
                                return d.observations[label.conceptPath] === undefined ? lbl : d.observations[label.conceptPath];
                            });
                        vm.cs.groups[label.labelId] =
                            vm.cs.dimensions[label.labelId].group();
                    };

                    if (label.type === 'combination') {
                        _chart = _createMultidimensionalChart(label, el);
                    } else {
                        // Create a number display if highdim
                        if (label.type === 'highdim') {
                            _defaultDim();
                            _chart = _numDisplay(label, vm.cs.groups[label.labelId], el);
                            _chart.type = 'NUMBER';

                            // Create a PIECHART if categorical
                        } else if (label.type === 'string' || label.type === 'object') {
                            _defaultDim("N/A");
                            _chart = DcChartsService.getPieChart(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId], el);
                            _chart.type = 'PIECHART';

                            // Create a BARCHART if numerical
                        } else if (label.type === 'number') {
                            _defaultDim(Infinity);
                            var group = vm.cs.dimensions[label.labelId].group();
                            // Filter out all records that do not have a value (which are set to Infinity in the dimension)
                            // To do this, we clone the group (we want to keep the methods) and override all().
                            var filteredGroup = {};
                            angular.copy(group, filteredGroup);
                            filteredGroup.all = function () {
                                return group.all().filter(function (d) {
                                    return d.key != Infinity;
                                });
                            };
                            vm.cs.groups[label.labelId] = filteredGroup;
                            _chart = DcChartsService.getBarChart(vm.cs.dimensions[label.labelId],
                                filteredGroup, el, {nodeTitle: label.name});
                            _chart.type = 'BARCHART';

                            // Create a BARCHART WITH BINS if floating point values
                        } else if (label.type === 'float') {
                            vm.cs.dimensions[label.labelId] =
                                vm.cs.crossfilter.dimension(function (d) {
                                return d.observations[label.conceptPath] === undefined ?
                                    undefined : d.observations[label.conceptPath].toFixed(
                                    label.precision === 0 ? 0 : label.precision
                                );
                            });
                            vm.cs.groups[label.labelId] =
                                vm.cs.dimensions[label.labelId].group();
                            _chart = DcChartsService.getBarChart(vm.cs.dimensions[label.labelId],
                                vm.cs.groups[label.labelId],
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

                    /*
                     * this listener function will be invoked after a filter is applied, added or removed.
                     * filtered.monitor is the event emitted during filtering
                     */
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
                    vm.updateDimensions();
                }

                function _handleChartRenderletEvent(chart, filter) {
                    if(chart.type === 'PIECHART') {
                        DcChartsService.emphasizeChartLegend(chart);
                    }

                }

                /**
                 * Return active filters
                 * @memberof CohortSelectionCtrl
                 */
                vm.getCohortFilters = function () {
                    var _filters = [];

                    if (vm.cs.charts) {
                        _.each(vm.cs.charts, function (c, _index) {
                            _filters.push({
                                name: vm.cs.labels[_index].name,
                                label: vm.cs.labels[_index].label,
                                type: vm.cs.labels[_index].type,
                                study: vm.cs.labels[_index].study,
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
                vm.onNodeDrop = function (event, info, node) {
                    var promise = undefined;

                    if (node.type === 'CATEGORICAL_OPTION') { //leaf node for pie chart
                        var chart = _findChartByName(node.parent.restObj.fullName);
                        if (chart == null) {
                            var filters = [{
                                label: node.parent.restObj.fullName,
                                filterWords: [node.title]
                            }];
                            promise = vm.addNodeToActiveCohortSelection(node.parent, filters);
                        }
                        else {
                            _filterChart(chart, [node.title]);
                        }
                    }
                    else {
                        promise = vm.addNodeToActiveCohortSelection(node, []);
                    }
                    angular.element(event.target).removeClass('chart-container-hover');

                    vm.addHistory('onNodeDrop', [event, info, node]);

                    return promise;
                };

                /**
                 * Add class when on node over the chart container
                 * @param e
                 * @memberof CohortSelectionCtrl
                 */
                vm.onNodeOver = function (e) {
                    return angular.element(e.target).addClass('chart-container-hover');
                };

                /**
                 * Remove class when on node over the chart container
                 * @param e
                 * @memberof CohortSelectionCtrl
                 */
                vm.onNodeOut = function (e) {
                    angular.element(e.target).removeClass('chart-container-hover');
                };

                /**
                 * Saves the cohort by asking for a name, saving it to the backend
                 * and showing the resulting id
                 * @memberof CohortSelectionCtrl
                 */
                vm.openSaveCohortModal = function () {
                    CohortSelectionService.currentBoxId = vm.boxId;
                    $uibModal.open({
                        templateUrl: 'app/components/save-cohort/save-cohort-dialog.tpl.html',
                        controller: 'SaveCohortDialogCtrl as vm',
                        animation: false
                    });
                };

                /**
                 * Add cohort-selection cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.addBox = function () {
                    CohortSelectionService.addBox();
                };

                /**
                 * Duplicate the current cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.duplicateBox = function () {
                    CohortSelectionService.duplicateBox(vm.boxId);
                };

                /**
                 * Remove the current cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.removeBox = function () {
                    vm.clearSelection();
                    CohortSelectionService.removeBox(vm.boxId);
                    $scope.$emit('cohortSelectionUpdateEvent');
                };


                /**
                 * Add history records (i.e. which functions to be called with what params)
                 * @param funcName - The name of the function to be called
                 * @param paramsArr - The parameters of the function
                 * @memberof CohortSelectionCtrl
                 */
                vm.addHistory = function (funcName, paramsArr) {
                    if (vm.isRecordingHistory) {
                        vm.history.push({
                            func: funcName,
                            params: paramsArr
                        });
                    }
                };

                /**
                 * reApply the history, i.e. past user interactions
                 * to the current cohort-selection box
                 * @memberof CohortSelectionCtrl
                 */
                vm.applyHistory = function () {
                    if (vm.history.length > 0) {
                        var index = 0;
                        _applyHistory(index);
                    }
                };

                function _applyHistory(index) {
                    if (index < vm.history.length) {
                        vm.isRecordingHistory = false;
                        var historyObj = vm.history[index];
                        var promise = vm[historyObj.func].apply(vm, historyObj.params);
                        if (promise) {
                            promise.then(function () {
                                index++;
                                _applyHistory(index);
                            });
                        }
                    } else {
                        vm.isRecordingHistory = true;
                    }
                }

                /**
                 * Add a node to the node collection of this cohort-selection
                 * @param node
                 * @memberof CohortSelectionCtrl
                 */
                vm.addNode = function (node) {
                    var found = _.find(vm.cs.nodes, node);
                    if (!found) {
                        vm.cs.nodes.push(node);
                    }
                };

                /**
                 * Remove a node from the node collection of this cohort-selection
                 * @param label
                 * @returns {boolean} - Indicating removal of node is successful or not
                 * @memberof CohortSelectionCtrl
                 */
                vm.removeNode = function (label) {
                    var removed = _.remove(vm.cs.nodes, {
                        restObj: {
                            fullName: label.label
                        }
                    });

                    if(removed.length > 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                /**
                 * Automatically 'drop' the given nodes to this cohort-selection,
                 * for the duplication of cohort-selection
                 * @param nodes
                 * @memberof CohortSelectionCtrl
                 */
                vm.applyNodes = function (nodes) {
                    nodes.forEach(function (node) {
                        vm.addNodeToActiveCohortSelection(node, []);
                    });
                };

                $scope.$watch(function () {
                    return $element.parent().width();
                }, function (newVal, oldVal) {
                    vm.boxSize = newVal;
                    if (Math.abs(newVal - oldVal) > 3) {
                        vm.resize(true);
                    }
                });

                $scope.$watch(function () {
                    return $scope.index;
                }, function (newVal, oldVal) {
                    if(!_.isEqual(newVal, oldVal)) {
                        vm.boxName = 'Cohort-' + (+newVal+1);
                    }
                });

            }]);
