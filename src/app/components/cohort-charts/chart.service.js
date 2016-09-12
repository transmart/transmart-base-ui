'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ChartService
 * @description handles cohort chart creation and user-interaction
 */
angular.module('transmartBaseUi').factory('ChartService',
    ['$q', '$rootScope', '$timeout', 'AlertService', 'DcChartsService', 'GridsterService',
        function ($q, $rootScope, $timeout, AlertService, DcChartsService, GridsterService) {

            var chartService = {
                workspaces: [], //list of workspace IDs
                cs: {}
            };

            chartService.addWorkspace = function (workspaceId) {
                var index = chartService.workspaces.indexOf(workspaceId);
                if(index == -1) {
                    chartService.workspaces.push(workspaceId);
                    chartService.cs[workspaceId] = {};
                }
            }

            chartService.removeWorkspace = function (workspaceId) {
                var index = chartService.workspaces.indexOf(workspaceId);
                if(index > -1) {
                    chartService.workspaces.splice(index, 1);
                    chartService.cs[workspaceId] = undefined;
                }
            }

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

            /**
             * Get the last token when requested model is a string path
             * @memberof ChartService
             * @param {String} what
             * @returns {*}
             */
            var _getLastToken = function (what) {
                var _t = what.split('\\').slice(1);
                return what.indexOf('\\') === -1 ? what : _t[_t.length - 2];
            };

            var _groupCharts = function (chart1, chart2) {
                var workspaceId1 = chart1.tsLabel.workspaceId;
                var workspaceId2 = chart2.tsLabel.workspaceId;
                if(workspaceId1 === workspaceId2) {
                    var workspaceId = workspaceId1;
                    var _combinationLabel = {
                        labelId: chartService.cs[workspaceId].chartId++,
                        label: [chart1.tsLabel, chart2.tsLabel],
                        name: chart1.tsLabel.name + ' - ' + chart2.tsLabel.name,
                        resolved: false,
                        study: chart1.tsLabel.study,
                        type: 'combination',
                        workspaceId: workspaceId
                    };
                    chartService.cs[workspaceId].subjects.forEach(function (subject) {
                        if (subject.labels[chart1.tsLabel.labelId] || subject.labels[chart2.tsLabel.labelId]) {
                            subject.labels[_combinationLabel.labelId] = [subject.labels[chart1.tsLabel.labelId],
                                subject.labels[chart2.tsLabel.labelId]];
                        }
                    });
                    chartService.cs[workspaceId].labels.push(_combinationLabel);
                    $rootScope.$broadcast('prepareChartContainers', chartService.cs[workspaceId].labels);
                }
            };

            var _groupingChart = {};

            chartService.groupCharts = function (newChart, turnOff) {
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
             * Reset the cohort chart service to initial state
             * @memberof ChartService
             */
            chartService.reset = function (workspaceId) {
                this.addWorkspace(workspaceId);
                this.cs[workspaceId].subjects = [];
                this.cs[workspaceId].selectedSubjects = [];
                this.cs[workspaceId].chartId = 0;
                this.cs[workspaceId].charts = [];
                this.cs[workspaceId].crossfilter = crossfilter();
                this.cs[workspaceId].dimensions = [];
                this.cs[workspaceId].maxNoOfDimensions = 20;
                this.cs[workspaceId].groups = [];
                this.cs[workspaceId].labels = [];
                this.cs[workspaceId].selected = 0;
                this.cs[workspaceId].total = 0;
                this.cs[workspaceId].mainDimension = this.cs[workspaceId].crossfilter.dimension(function (d) {
                    return d.labels;
                });

                $rootScope.$broadcast('prepareChartContainers', this.cs[workspaceId].labels);
            };

            /**
             * Restore the data of the crossfilter to full set
             * @memberOf ChartService
             */
            chartService.restoreCrossfilter = function (workspaceId) {
                if (this.cs[workspaceId].subjects && this.cs[workspaceId].subjects.length > 0) {
                    this.cs[workspaceId].crossfilter = crossfilter(this.cs[workspaceId].subjects);
                    return true;
                }
                else {
                    return false;
                }
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
            var _addLabel = function (obs, node, filterObj, workspaceId) {
                // Check if label has already been added
                var label = _.find(chartService.cs[workspaceId].labels, {label: obs.label});
                var filters;

                if (filterObj) {
                    filters = filterObj.filterWords;
                }

                if (!label) {

                    //Check that the maximum number of dimensions has not been reached
                    if (chartService.cs[workspaceId].labels.length < chartService.cs[workspaceId].maxNoOfDimensions) {
                        // Create the new label object

                        label = {
                            label: obs.label,
                            type: _getType(obs.value),
                            name: _getLastToken(obs.label),
                            labelId: chartService.cs[workspaceId].chartId++,
                            study: node.study,
                            resolved: false,
                            filters: filters,
                            workspaceId: workspaceId
                        };
                        chartService.cs[workspaceId].labels.push(label);

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
             * Fetch the data for the selected node
             * @memberof ChartService
             * @param {Object} node
             * @param {Array} filters
             * @returns {*}
             */
            chartService.addNodeToActiveCohortSelection = function (node, filters, workspaceId) {
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
                            var _newLabelId = _addLabel(obs, node, _filter, workspaceId);

                            // Check if the subject of the observation is already present
                            var foundSubject = _.find(chartService.cs[workspaceId].subjects, {id: obs._embedded.subject.id});

                            if (foundSubject) {
                                foundSubject.labels[_newLabelId] = obs.value;
                            } else {
                                obs._embedded.subject.labels = {};
                                obs._embedded.subject.labels[_newLabelId] = obs.value;
                                chartService.cs[workspaceId].subjects.push(obs._embedded.subject);
                                chartService.cs[workspaceId].crossfilter.add([obs._embedded.subject]);
                            }
                        }
                    });

                    // Notify the applicable controller that the chart directive instances
                    // can be created
                    GridsterService.resize('#main-chart-container', chartService.cs[workspaceId].labels, false);
                    _deferred.resolve();
                }, function (err) {
                    _deferred.reject('Cannot get data from the end-point.' + err);
                });

                return _deferred.promise;
            };

            /**
             * Remove label from subjects and remove subjects no longer associated with any given label
             * @memberof ChartService
             * @param {Array} subjects
             * @param {String} label
             * @returns {*}
             */
            chartService.filterSubjectsByLabel = function (subjects, label) {
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
             * @memberof ChartService
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
             * @memberof ChartService
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
             * @memberof ChartService
             * @param {Object} label
             * @returns {Object} chart
             */
            chartService.clearChartFilterByLabel = function (label) {
                var chart;
                chart = _.find(this.cs[label.workspaceId].charts, {id: label.labelId});
                if (chart) {
                    chart.filter(null);
                    dc.redrawAll();
                    chartService.updateDimensions(label.workspaceId);
                }
                return chart;
            };

            /**
             * Remove label from cohort selection
             * @memberof ChartService
             * @param {Object} label
             */
            chartService.removeLabel = function (label, workspaceId) {
                if (label) {
                    // Remove associated chart from cs.charts
                    this.cs[workspaceId].charts = _removeChartFromCharts(this.cs[workspaceId].charts, label);

                    // Remove label from cs.labels
                    this.cs[workspaceId].labels = _removeLabelFromLabels(this.cs[workspaceId].labels, label);

                    // Remove label from cs.subjects and remove subjects no longer associated
                    // with any label
                    this.cs[workspaceId].subjects = chartService.filterSubjectsByLabel(this.cs[workspaceId].subjects, label);

                    // Remove dimension and group associated with the label
                    this.cs[workspaceId].dimensions.splice(label.labelId);
                    this.cs[workspaceId].groups.splice(label.labelId);

                    // Remove data in crossfilter if no more label is selected
                    if (this.cs[workspaceId].labels.length < 1) {
                        // Removes all records that match the current filter
                        this.cs[workspaceId].crossfilter.remove();
                    }

                    // Update charts
                    $rootScope.$broadcast('prepareChartContainers', this.cs[workspaceId].labels);

                    // Update dimension summary
                    if (this.cs[workspaceId].labels.length > 0) {
                        this.updateDimensions(workspaceId);
                    } else {
                        this.reset(workspaceId);
                    }
                }
            };

            var _createMultidimensionalChart = function (label, el, workspaceId) {
                var _chart, _min, _max;

                // Check if label0 or label1 has categorical values
                if (label.label[0].type === 'string' || label.label[1].type === 'string') {

                    // Check if one of them is not categorical
                    if (label.label[0].type !== 'string' || label.label[1].type !== 'string') {

                        // Always categorical on X axis
                        var _valueX = label.label[0].type === 'string' ? 0 : 1;
                        var _valueY = _valueX === 0 ? 1 : 0;

                        chartService.cs[workspaceId].dimensions[label.labelId] = chartService.cs[workspaceId].crossfilter.dimension(function (d) {
                            return d.labels[label.labelId] ? d.labels[label.labelId][_valueX] : undefined;
                        });
                        chartService.cs[workspaceId].groups[label.labelId] = chartService.cs[workspaceId].dimensions[label.labelId].group().reduce(
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

                        _max = chartService.cs[workspaceId].dimensions[label.label[_valueY].labelId].top(1)[0].labels[label.label[_valueY].labelId];
                        _min = chartService.cs[workspaceId].dimensions[label.label[_valueY].labelId].bottom(1)[0].labels[label.label[_valueY].labelId];

                        _chart = DcChartsService.getBoxPlot(chartService.cs[workspaceId].dimensions[label.labelId], chartService.cs[workspaceId].groups[label.labelId], el, {
                            xLab: label.label[_valueX].name,
                            yLab: label.label[_valueY].name,
                            min: _min,
                            max: _max
                        });

                        _chart.type = 'BOXPLOT';

                    } else {
                        // Both labels are categorical
                        chartService.cs[workspaceId].dimensions[label.labelId] = chartService.cs[workspaceId].crossfilter.dimension(function (d) {
                            return [d.labels[label.labelId] ? d.labels[label.labelId][0] : undefined,
                                d.labels[label.labelId] ? d.labels[label.labelId][1] : undefined];
                        });
                        chartService.cs[workspaceId].groups[label.labelId] = chartService.cs[workspaceId].dimensions[label.labelId].group();

                        _chart = DcChartsService.getHeatMap(chartService.cs[workspaceId].dimensions[label.labelId], chartService.cs[workspaceId].groups[label.labelId], el, {
                            xLab: label.label[0].name,
                            yLab: label.label[1].name
                        });

                        _chart.type = 'HEATMAP';

                    }
                } else {
                    // Both labels are numerical, create a scatter plot
                    chartService.cs[workspaceId].dimensions[label.labelId] = chartService.cs[workspaceId].crossfilter.dimension(function (d) {
                        return [d.labels[label.labelId] ? d.labels[label.labelId][0] : undefined,
                            d.labels[label.labelId] ? d.labels[label.labelId][1] : undefined];
                    });

                    chartService.cs[workspaceId].groups[label.labelId] = chartService.cs[workspaceId].dimensions[label.labelId].group();

                    _max = chartService.cs[workspaceId].dimensions[label.label[0].labelId].top(1)[0].labels[label.label[0].labelId];
                    _min = chartService.cs[workspaceId].dimensions[label.label[0].labelId].bottom(1)[0].labels[label.label[0].labelId];

                    _chart = DcChartsService.getScatterPlot(
                        chartService.cs[workspaceId].dimensions[label.labelId],
                        chartService.cs[workspaceId].groups[label.labelId],
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
             * @memberof ChartService
             * @param {Object} label
             * @param {Object} el
             */
            chartService.createCohortChart = function (label, el) {
                var workspaceId = label.workspaceId;

                var _chart;

                /**
                 * @param _missingLabelId
                 * @private
                 */
                var _defaultDim = function (_missingLabelId) {
                    chartService.cs[workspaceId].dimensions[label.labelId] = chartService.cs[workspaceId].crossfilter.dimension(function (d) {
                        var lbl = _missingLabelId || undefined;
                        return d.labels[label.labelId] === undefined ? lbl : d.labels[label.labelId];
                    });
                    chartService.cs[workspaceId].groups[label.labelId] = chartService.cs[workspaceId].dimensions[label.labelId].group();
                };

                if (label.type === 'combination') {
                    _chart = _createMultidimensionalChart(label, el, workspaceId);
                } else {
                    // Create a number display if highdim
                    if (label.type === 'highdim') {
                        _defaultDim();
                        _chart = _numDisplay(chartService.cs[workspaceId].dimensions[label.labelId], chartService.cs[workspaceId].groups[label.labelId], el);
                        _chart.type = 'NUMBER';

                        // Create a PIECHART if categorical
                    } else if (label.type === 'string' || label.type === 'object') {
                        _defaultDim("N/A");
                        _chart = DcChartsService.getPieChart(chartService.cs[workspaceId].dimensions[label.labelId], chartService.cs[workspaceId].groups[label.labelId], el);
                        _chart.type = 'PIECHART';

                        // Create a BARCHART if numerical
                    } else if (label.type === 'number') {
                        _defaultDim(Infinity);
                        var group = chartService.cs[workspaceId].dimensions[label.labelId].group();
                        // Filter out all records that do not have a value (which are set to Infinity in the dimension)
                        // To do this, we clone the group (we want to keep the methods) and override all().
                        var filteredGroup = {};
                        angular.copy(group, filteredGroup);
                        filteredGroup.all = function () {
                            return group.all().filter(function (d) {
                                return d.key != Infinity;
                            });
                        };
                        chartService.cs[workspaceId].groups[label.labelId] = filteredGroup;
                        _chart = DcChartsService.getBarChart(chartService.cs[workspaceId].dimensions[label.labelId], filteredGroup, el,
                            {nodeTitle: label.name});
                        _chart.type = 'BARCHART';

                        // Create a BARCHART WITH BINS if floating point values
                    } else if (label.type === 'float') {
                        chartService.cs[workspaceId].dimensions[label.labelId] = chartService.cs[workspaceId].crossfilter.dimension(function (d) {
                            return d.labels[label.labelId] === undefined ? undefined : d.labels[label.labelId].toFixed(label.precision === 0 ? 0 : label.precision);
                        });
                        chartService.cs[workspaceId].groups[label.labelId] = chartService.cs[workspaceId].dimensions[label.labelId].group();
                        _chart = DcChartsService.getBarChart(chartService.cs[workspaceId].dimensions[label.labelId], chartService.cs[workspaceId].groups[label.labelId],
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

                this.cs[workspaceId].charts.push(_chart);

                return _chart;
            };

            function _handleChartFilteredEvent(chart, filter) {
                /*
                 * keep the tsLabel.filters to be in sync with chart.filters()
                 */
                chart.tsLabel.filters = chart.filters();
                chartService.updateDimensions(chart.tsLabel.workspaceId);
            }

            function _handleChartRenderletEvent(chart, filter) {
                DcChartsService.emphasizeChartLegend(chart);
            }


            /**
             * Return active filters
             * @memberof ChartService
             */
            chartService.getCohortFilters = function (workspaceId) {
                var _filters = [];

                if (chartService.cs[workspaceId].charts) {
                    _.each(chartService.cs[workspaceId].charts, function (c, _index) {
                        _filters.push({
                            name: chartService.cs[workspaceId].labels[_index].name,
                            label: chartService.cs[workspaceId].labels[_index].label,
                            type: chartService.cs[workspaceId].labels[_index].type,
                            study: chartService.cs[workspaceId].labels[_index].study,
                            filters: c.filters()
                        });
                    });
                }

                return _filters;
            };

            /**
             * Get summary data
             * @memberof ChartService
             */
            chartService.updateDimensions = function (workspaceId) {
                this.cs[workspaceId].selected = this.cs[workspaceId].crossfilter.groupAll().value();    // # of selected subjects
                this.cs[workspaceId].selectedSubjects = this.cs[workspaceId].mainDimension.top(Infinity);
                this.cs[workspaceId].total = this.cs[workspaceId].crossfilter.size();                   // # of total of subjects
                this.cs[workspaceId].cohortLabels = this.cs[workspaceId].labels;
            };

            /**
             * @memberof ChartService
             * @param {String} chartName - The chart name as the search word for the chart with tsLabel with the same string
             * @returns {*} - The found chart in ChartService.cs[workspaceId].charts, with matching name chartName, if not found, return null
             */
            function _findChartByName(chartName, workspaceId) {
                var foundChart = null;
                chartService.cs[workspaceId].charts.forEach(function (_chart) {
                    if (_chart.tsLabel.label == chartName) {
                        foundChart = _chart;
                    }
                });
                return foundChart;
            }

            /**
             * Give a chart instance (normally a pie chart), filter it based on an array of words
             * @memberof ChartService
             * @param {Object} chart - The chart instance in ChartService.cs[workspaceId].charts
             * @param {Array} filters - The filtering words or criteria that filter the chart
             */
            function _filterChart(chart, filters) {
                if (_.isArray(filters) && filters.length > 0) {
                    filters.forEach(function (_f) {
                        chart.filter(_f);
                    });
                    chartService.updateDimensions(chart.tsLabel.workspaceId);
                    dc.renderAll();
                }
            }

            /**
             * Handle node drop from study-accordion to cohort-selection panel.
             * Remark: node.restObj.fullName is equivalent to chart.tsLabel.label
             * @memberof ChartService
             * @param {Object} node
             */
            chartService.onNodeDrop = function (node, workspaceId) {
                if (node.type === 'CATEGORICAL_OPTION') { //leaf node for pie chart
                    var chart = _findChartByName(node.parent.restObj.fullName, workspaceId);
                    if (chart == null) {
                        var filters = [{
                            label: node.parent.restObj.fullName,
                            filterWords: [node.title]
                        }];
                        chartService.addNodeToActiveCohortSelection(node.parent, filters, workspaceId);
                    }
                    else {
                        _filterChart(chart, [node.title]);
                    }
                }
                else {
                    chartService.addNodeToActiveCohortSelection(node, [], workspaceId);
                }
            };

            return chartService;

        }]);
