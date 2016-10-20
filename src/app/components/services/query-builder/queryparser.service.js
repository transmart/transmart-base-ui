'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name QueryParserService
 */
angular.module('transmartBaseUi').factory('QueryParserService',
    ['XML2JSONService', 'StudyListService', 'TreeNodeService', 'PromiseQueue',
    function (XML2JSONService, StudyListService, TreeNodeService, PromiseQueue) {

        var service = {};

      /**
       * Puts the variable in a list if it is not already a list.
       * @param variable The variable to return as a list
       * @returns {*[]} The original list or the variable put in the list
       */
        function makeList(variable) {
            return _.isArray(variable) ? variable : [variable];
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

            // We'll collect a queue of promises that cannot be executed in parallel
            var promiseQueue = new PromiseQueue();

            // Loop through the panels in the query
            _.each(makeList(queryObj.panel), function(panel) {
                var studyNode, conceptPath;
                var filters = [];

                // Loop through the items in the panel
                _.each(makeList(panel.item), function(item) {

                    // Split concept key by backslash and remove all empty entries
                    var splitKey = item.item_key.split('\\').filter(function(el) {
                        return el != "";
                    });

                    // Look up study
                    var studyKey = '\\' + splitKey.slice(1, 3).join('\\') + '\\';
                    studyNode = StudyListService.getStudy(studyKey);

                    // Save the rest of the key as the concept path
                    conceptPath = splitKey.slice(3);

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
                    }

                });

                // Add a new task to the queue
                if (studyNode) {
                    promiseQueue.addPromiseCreator(function () {
                        return TreeNodeService.expandConcept(studyNode, conceptPath)
                            .then(function (response) {
                                // Add the node and filters to the workspace
                                cohortSelectionController.addNodeWithFilters(response, filters);
                            });
                    });
                }
            });

            // Start expanding the nodes
            return promiseQueue.execute();
        };

        return service;
}]);
