'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name QueryParserService
 */
angular.module('transmartBaseUi').factory('QueryParserService', ['XML2JSONService', 'StudyListService', 'TreeNodeService', '$q',
    function (XML2JSONService, StudyListService, TreeNodeService, $q) {

        var service = {};

        function makeList(variable) {
            return variable.constructor === Array ? variable : [variable];
        }

        /**
         * Converts the selections in the cohort filters from i2b2 query xml.
         * @memberof QueryParserService
         * @param cohortFilters
         * @param name
         * @returns {*}
         */
        service.convertCohortFiltersFromXML = function (queryXML, cohortSelectionController) {
            var queryObj = XML2JSONService.xml2json(queryXML).query_definition;
            console.log(queryObj);

            // This array will hold the n-length queue
            var promiseStack = [];

            // Creates a new promise (don't fire it yet)
            function newPromise (studyNode, conceptPath, filters) {
                return function () {
                    var deferred = $q.defer();

                    console.log("Expanding concept at " + conceptPath);
                    TreeNodeService.expandConcept(studyNode, conceptPath)
                        .then(function (response) {
                            // Add the node and filters to the workspace
                            console.log("Finished expanding " + conceptPath);
                            cohortSelectionController.addCohortFilter(response, filters);
                            deferred.resolve(response);
                        }, function(reason) {
                            deferred.reject(reason);
                        });

                    return deferred.promise;
                };
            }

            //var currentExpansionPromise = undefined;
            _.each(makeList(queryObj.panel), function(panel) {
                var studyNode, conceptPath;
                var filters = [];

                _.each(makeList(panel.item), function(item) {

                    // Split concept key by backslash and remove all empty entries
                    var splitKey = item.item_key.split('\\').filter(function(el) {
                        return el != "";
                    });
                    var studyKey = '\\' + splitKey.slice(1, 3).join('\\') + '\\';
                    conceptPath = splitKey.slice(3);

                    // Look up study
                    studyNode = StudyListService.getStudy(studyKey);

                    // Extract the filters
                    if (item.constrain_by_value) {
                        // Numerical range
                        var constraint = item.constrain_by_value;
                        if (constraint.value_operator == 'BETWEEN') {
                            // Numeric range
                            // The constraint string is formatted like '34.3 and 45.6'
                            var betweenValues = constraint.value_constraint.split(' ');
                            var minValue = betweenValues[0];
                            var maxValue = betweenValues[2];
                            filters.push(dc.filters.RangedFilter(minValue, maxValue));
                        }
                    }
                    else {
                        // Category
                        filters.push(conceptPath.slice(-1));
                        conceptPath = conceptPath.slice(0, -1);
                    }

                });

                // Add a new task to the queue
                if (studyNode) {
                    promiseStack.push(newPromise(studyNode, conceptPath, filters));
                }
            });

            // Fires the first promise in the queue
            var fire = function () {
                // If the queue has remaining items...
                return promiseStack.length &&
                        // Remove the first promise from the array
                        // and execute it
                        promiseStack.shift()()
                        // When that promise resolves, fire the next
                        // promise in our queue
                        .then(function () {
                            return fire();
                        });
            };

            // Begin the queue
            return fire();
        };

        /**
         * Converts the selections in the cohort filters to an array of panel
         * object structures that translate directly to the i2b2 query xml format.
         * @memberof QueryParserService
         * @param cohortFilters
         * @returns {Array}
         */
        service.convertCohortFiltersFromI2B2Panels = function (cohortFilters) {
            var panels = [];

            _.each(cohortFilters, function (cohortFilter) {
                var items;

                // Numbers and float are constrained by a range
                if (cohortFilter.type == 'float' || cohortFilter.type == 'number') {
                    items = generatePanelItemsForNumericRanges(cohortFilter);
                }

                // Constrain by one or more categories
                if (cohortFilter.type == 'string') {
                    items = generatePanelItemsForCategories(cohortFilter);
                }

                if (items.length > 0) {
                    panels.push({
                        'panel_number': panels.length + 1,
                        'invert': 0,
                        'total_item_occurrences': 1,
                        'item': items
                    });
                }

            });

            // If we didn't find any filters, add the entire study as a filter
            if (panels.length == 0) {
                var studyKey = cohortFilters[0].study._embedded.ontologyTerm.fullName;
                panels.push({
                    'panel_number': 1,
                    'invert': 0,
                    'total_item_occurrences': 1,
                    'item': generatePanelItemForConcept(studyKey,
                        cohortFilters[0].study.id, cohortFilters[0].study.type)
                });
            }

            return panels;
        };

        /**
         * Generate a list of panel items that will be OR-ed in the query, based
         * on the selected numeric ranges. In practice only one range will be selected,
         * but multiple are supported.
         * @memberof QueryParserService
         * @param cohortFilter
         * @returns {Array}
         */
        function generatePanelItemsForNumericRanges(cohortFilter) {
            var items = [];

            _.each(cohortFilter.filters, function (filter) {
                items.push({
                    'item_name': cohortFilter.name,
                    'item_key': getStudyTypePrefix(cohortFilter.study.type) + cohortFilter.label,
                    'tooltip': cohortFilter.label,
                    'class': 'ENC',
                    'constrain_by_value': generateConstraintByValueBetween(filter[0], filter[1])
                });
            });

            return items;
        }

        /**
         * Generate a list of panel items that will be OR-ed in the query, based
         * on the selected filters for the categories.
         * @memberof QueryParserService
         * @param cohortFilter
         * @returns {Array}
         */
        function generatePanelItemsForCategories(cohortFilter) {
            var items = [];
            _.each(cohortFilter.filters, function (filter) {
                items.push(generatePanelItemForConcept(cohortFilter.label + filter, filter, cohortFilter.study.type));
            });
            return items;
        }

        /**
         * Generate a value constraint for numeric ranges.
         * @memberof QueryParserService
         * @param value1
         * @param value2
         * @returns {{value_operator: string, value_constraint: string, value_type: string}}
         */
        function generateConstraintByValueBetween(value1, value2) {
            return {
                'value_operator': 'BETWEEN',
                'value_constraint': '' + value1 + ' and ' + value2,
                'value_type': 'NUMBER'
            }
        }

        /**
         * Generate a separate panel item for the specified concept. The type is
         * used to generate the prefix.
         * @memberof QueryParserService
         * @param key
         * @param name
         * @param studyType
         * @returns {{item_name: *, item_key: *, tooltip: *, class: string}}
         */
        function generatePanelItemForConcept(key, name, studyType) {
            return {
                'item_name': name,
                'item_key': getStudyTypePrefix(studyType) + key,
                'tooltip': key,
                'class': 'ENC',
            };
        }

        /**
         * Returns the study prefix (Public Studies / Private Studies) based on the study type.
         * @memberof QueryParserService
         * @param studyType
         * @returns {*}
         */
        function getStudyTypePrefix(studyType) {
            switch (studyType) {
                case 'public':
                    return '\\\\Public Studies';
                case 'private':
                    return '\\\\Private Studies';
            }
        }

        return service;
}]);
