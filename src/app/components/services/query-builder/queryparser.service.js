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

            // This array will hold the n-length queue
            var promiseStack = [];

            // Creates a new promise (don't fire it yet)
            function newPromise (studyNode, conceptPath, filters) {
                return function () {
                    var deferred = $q.defer();

                    TreeNodeService.expandConcept(studyNode, conceptPath)
                        .then(function (response) {
                            // Add the node and filters to the workspace
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

        return service;
}]);
