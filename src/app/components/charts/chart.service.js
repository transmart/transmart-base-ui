'use strict';

angular.module('transmartBaseUi')

    .factory('ChartService', ['Restangular', '$q', '$rootScope', '$timeout',
        function (Restangular, $q, $rootScope, $timeout) {
            var chartService = {};

            /**
             * Create dc.js bar chart
             * @param cDimension
             * @param cGroup
             * @param el
             * @private
             */
            var _barChart = function (cDimension, cGroup, el, min, max, nodeTitle, width, height, btmMarg) {
                //Determine if the number is floating point and it's precision
                var precision = (min + '').split('.');

                width = width || 270;
                height = height || 210;
                btmMarg = btmMarg || 30;

                var _barChart = dc.barChart(el);
                _barChart
                    .width(width)
                    .height(height)
                    .margins({top: 5, right: 5, bottom: btmMarg, left: 25})
                    .dimension(cDimension)
                    .group(cGroup)
                    .elasticY(true)
                    .elasticY(true)
                    .xAxisPadding('10%')
                    .yAxisPadding('10%')
                    .centerBar(true)
                    .gap(1)
                    .x(d3.scale.linear().domain([min-0.05*min, max+0.05*max]))
                    .renderHorizontalGridLines(true);
                // Correction for unusual chart behavior with floating point
                // Numbers.
                // Check the precision of floating point numbers and adjust
                // the scale of x units accordingly
                if(precision[1]){
                  _barChart.xUnits(
                    dc.units.fp.precision(Math.pow(0.01, precision[1].length)));
                } else {
                  _barChart.xUnits();
                }
                _barChart.xAxis().ticks(5);
                _barChart.yAxis().ticks(5);
                _barChart.yAxisLabel('# subjects');

                return _barChart;
            };

            /**
             * Create dc.js pie chart
             * @param cDimension
             * @param cGroup
             * @param el
             * @returns {*}
             * @private
             */
            var _pieChart = function (cDimension, cGroup, el, size, nolegend) {
                var tChart = dc.pieChart(el);

                nolegend = nolegend || false;
                size = size || 200;

                tChart
                    .width(size)
                    .height(size)
                    .innerRadius(0)
                    .dimension(cDimension)
                    .group(cGroup)
                    .renderLabel(false)
                    .colors(d3.scale.category20());

                if(!nolegend){
                    tChart.legend(dc.legend());
                }

                return tChart;
            };

            /**
             * Get the last token when requested model is a string path
             * @param what
             * @returns {*}
             * @private
             */
            var _getLastToken = function (what) {
                var _t = what.split('\\').slice(1);
                return what.indexOf('\\') === -1 ? what : _t[_t.length - 2];
            };

            /**
            *
            * @param charts
            */
            chartService.renderAll = function (charts) {
              if(!charts){
                charts = cs.charts;
              }
              angular.forEach(charts, function (chart) {

                chart.render();
              });
            };

            /***********************************************************************************************************
            * Summary statistics chart service
            */
            var ss = {};

            chartService.displaySummaryStatistics = function(study, magicConcepts){
                var _deferred = $q.defer();

                study.one('subjects').get().then(function (d) {
                    var sub = d._embedded.subjects;

                    ss = {
                        charts: [],
                        cross: crossfilter(sub),
                        dims: {},
                        grps: {},
                    };

                    magicConcepts.forEach(function(concept){
                        ss.dims[concept] = ss.cross.dimension(function(d){return d[concept];})
                        ss.grps[concept] = ss.dims[concept].group();

                        if (typeof sub[0][concept] === 'string' || typeof sub[0][concept] === 'object') {
                          ss.charts.push(_pieChart(ss.dims[concept], ss.grps[concept], '#summary-chart-' + concept, 75, true));
                        } else if (typeof sub[0][concept] === 'number') {
                          var max = ss.dims[concept].top(1)[0][concept];
                          var min = ss.dims[concept].bottom(1)[0][concept];
                          ss.charts.push(_barChart(ss.dims[concept], ss.grps[concept], '#summary-chart-' + concept, min-5, max+5, '', 600, 100, 5));
                        }
                    });
                    chartService.renderAll(ss.charts);

                    _deferred.resolve();

                }, function (err) {
                    _deferred.reject('Cannot get data from the end-point.' + err);
                });
                return _deferred.promise;
            };

            /***********************************************************************************************************
             * Cohort chart service
             */
            var cs = {};

            /**
             * Reset the cohort chart service to initial state
             */
            chartService.reset = function () {
                cs = {
                     subjects: [],
                     chartId: 0,
                     charts: [],
                     cross: crossfilter(),
                     dims: {},
                     grps: {},
                     labels: []
                };

                cs.mainDim = cs.cross.dimension(function (d) {
                    return d.labels;
                });

                $rootScope.$broadcast('prepareChartContainers',cs.labels);
            };

            chartService.reset();

            /**
             * Add new label to list and check data type
             * @param label
             * @param value
             * @private
             */
            var _addLabel = function (obs, node) {
                var present = false;
                cs.labels.forEach(function(label){
                    present = label.label === obs.label ? true : present;
                });
                if(!present){
                    cs.labels.push({
                        label: obs.label,
                        type: typeof obs.value,
                        name: _getLastToken(obs.label),
                        ids: cs.chartId++,
                        study: node.study
                    });
                }
            };

            /**
             * Remove all the filters applied to the label dimensions
             * TODO: Add the possibility to reapply removed filters
             * @private
             */
            var _removeAllLabelFilters = function () {
                for (var key in cs.dims) {cs.dims[key].filterAll();}
            };

            /**
             * Fetch the data for the selected node
             * Add it to the current subject list
             * Recreate Crossfilter instance with all the new and old subjects
             * @param node
             * @returns {*}
             */
            chartService.addNodeToActiveCohortSelection = function (node){
                var _deferred = $q.defer();
                //Get all observations under the selected concept
                node.restObj.one('observations').get().then(function (observations){
                    observations = observations._embedded.observations;
                    observations.forEach(function (obs){
                        if(obs.value !== null) {
                            _addLabel(obs, node);
                            var found = _.findWhere(cs.subjects, {id: obs._embedded.subject.id});
                            if (found){
                              found.labels[obs.label] = obs.value;
                            } else {
                              obs._embedded.subject.labels = {};
                              obs._embedded.subject.labels[obs.label] = obs.value;
                              cs.subjects.push(obs._embedded.subject);
                            }
                        }
                    });

                    $rootScope.$broadcast('prepareChartContainers', cs.labels);
                    $timeout(function () {
                        _removeAllLabelFilters;
                        _populateCohortCrossfilter();
                        _createCohortCharts();
                        _deferred.resolve(cs.charts);
                    });
                }, function (err) {
                    //TODO: add alert
                    _deferred.reject('Cannot get data from the end-point.' + err);
                });
                return _deferred.promise;
            };

          /**
           * Remove specified label
           * @param label
           */
            chartService.removeLabel = function (label) {
                //Remove label from subjects and remove subjects no longer associated with any label
                for (var i = 0; i < cs.subjects.length; i++) {
                  cs.subjects[i].labels[label.label] = undefined;
                  if (_.size(cs.subjects[i].labels) === 0) cs.subjects(i--, 1);
                }
                //Update crossfilter instance
                _removeAllLabelFilters();
                _populateCohortCrossfilter;
                //Remove dimension and group associated with the label
                cs.dims[label.label].dispose();
                cs.grps[label.label].dispose();
                //Finally remove label
                cs.labels = _.reject(cs.labels, function(el) { return el.label === label.label; });
                //Update charts
                $rootScope.$broadcast('prepareChartContainers',cs.labels);
                dc.filterAll();
                dc.redrawAll();
            };

            /**
             * Create the Crossfilter instance from the subject data
             * @private
             */
            var _populateCohortCrossfilter = function () {
                cs.cross.remove();
                cs.cross.add(cs.subjects);
            };

            /**
             * Create the charts for each selected label
             * TODO: Leave the existing charts in place, and only add the new ones
             * TODO: Enable removing specific charts
             * @private
             */
            var _createCohortCharts = function () {
              cs.charts = [];
                cs.labels.forEach(function (label) {
                    cs.dims[label.label] = cs.cross.dimension(function (d) {
                        return d.labels[label.label] === undefined ? 'UnDef' : d.labels[label.label];
                    });
                    cs.grps[label.label] = cs.dims[label.label].group();

                    if (label.type === 'string' || label.type === 'object') {
                        var chart = _pieChart(cs.dims[label.label], cs.grps[label.label], '#cohort-chart-' + label.ids);
                        chart.id = label.ids;
                        cs.charts.push(chart);
                    } else if (label.type === 'number') {
                        var max = cs.dims[label.label].top(1)[0].labels[label.label];
                        var min = cs.dims[label.label].bottom(1)[0].labels[label.label];
                        var chart = _barChart(cs.dims[label.label], cs.grps[label.label], '#cohort-chart-' + label.ids, min, max, label.name);
                        chart.id = label.ids;
                        cs.charts.push(chart);
                    }
                });
            };

            chartService.doResizeChart = function (id, height, width) {
              var chart = _.findWhere(cs.charts, {id: id});
              if(chart) {
                var set = {
                  rad: 0.9, // Percentage to adjust the radius of the chart
                  legH: 0.05,// Percentage to adjust legend position in Y
                  legW: 0, // Percentage to adjust legend position in X
                  min: (width > height ? height : width), // Smallest of width or heigth
                  xt: 30, // Pixels per tick in x
                  yt: 30, // Pixels per tick in y
                  ps: 20 // Pixels per slice for pie charts
                };
                // Adjust width and height
                chart.width(width).height(height);

                // If the chart has a radius (ie. pie chart)
                if(chart.radius){
                  //  set the radius to half the shortest dimension
                  chart.radius((set.min) / 2 * set.rad)
                  // Limit the number of slices in the chart
                  .slicesCap(Math.floor(set.min/20))
                  //
                  .legend(dc.legend()
                    .x(width * set.legW)
                    .y(height * set.legH)
                    .itemHeight(4 + 6 * set.min/300)
                    .gap(4 + height/100));
                } else {
                  // Adjust number of ticks to not overlap
                  // Number of ticks per pixel
                  chart.xAxis().ticks(Math.floor(width/set.xt));
                  chart.yAxis().ticks(Math.floor(height/set.yt));
                  chart.rescale();
                }

                chart.render();
              }
            }

            /**
             * Return the values for the current selection in cohort
             * @returns {{selected: (*|{returns the sum total of matching records, observes all dimension's filters}), total: *}}
             */
            chartService.getSelectionValues = function () {
                return {
                    selected: cs.cross.groupAll().value(),
                    total: cs.cross.size(),
                    subjects: cs.mainDim.top(Infinity)
                };
            };

            /**
             * ChartService
             */
            return chartService;
        }]);
