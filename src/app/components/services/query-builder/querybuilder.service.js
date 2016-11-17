'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name QueryBuilderService
 */
angular.module('transmartBaseUi').factory('QueryBuilderService', ['JSON2XMLService', function (JSON2XMLService) {

    var service = {};

    /**
     * Converts the selections in the cohort filters to i2b2 query xml.
     * @memberof QueryBuilderService
     * @param cohortFilters
     * @param name
     * @returns {*}
     */
    service.convertCohortFiltersToXML = function (cohortFilters, queryName) {
        var xml = JSON2XMLService.json2xml({
            'query_definition': {
                'query_name': queryName,
                'panel': service.convertCohortFiltersToI2B2Panels(cohortFilters)
            }
        });
        return xml;
    };

    /**
     * Converts the selections in the cohort filters to an array of panel
     * object structures that translate directly to the i2b2 query xml format.
     * @memberof QueryBuilderService
     * @param cohortFilters
     * @returns {Array}
     */
    service.convertCohortFiltersToI2B2Panels = function (cohortFilters) {
        var panels = [];

        _.each(cohortFilters, function (cohortFilter) {
            var items = [];

            // Numbers and float are constrained by a range
            if (cohortFilter.type == 'float' || cohortFilter.type == 'number') {
                items = generatePanelItemsForNumericRanges(cohortFilter);
            }

            // Constrain by one or more categories or high dimensional data
            if (cohortFilter.type == 'string' || cohortFilter.type == 'highdim') {
                items = generatePanelItemsForConcepts(cohortFilter);
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

        return panels;
    };

    /**
     * Generate a list of panel items that will be OR-ed in the query, based
     * on the selected numeric ranges. In practice only one range will be selected,
     * but multiple are supported.
     * @memberof QueryBuilderService
     * @param cohortFilter
     * @returns {Array}
     */
    function generatePanelItemsForNumericRanges(cohortFilter) {
        var items = [];
        if (cohortFilter.filters.length > 0) {
            _.each(cohortFilter.filters, function (filter) {
                var item = generatePanelItemForConcept(cohortFilter);
                item['constrain_by_value'] = generateConstraintByValueBetween(filter[0], filter[1]);
                items.push(item);
            });
        }
        else {
            // If there are no range filters, just add the concept node
            items.push(generatePanelItemForConcept(cohortFilter));
        }
        return items;
    }

    /**
     * Generate a list of panel items that will be OR-ed in the query, based
     * on the selected filters for the categories.
     * @memberof QueryBuilderService
     * @param cohortFilter
     * @returns {Array}
     */
    function generatePanelItemsForConcepts(cohortFilter) {
        var items = [];
        if (cohortFilter.filters.length > 0) {
            // If there are filters on the chart, add each filter value separately (leafs)
            _.each(cohortFilter.filters, function (filter) {
                items.push(generatePanelItemForConcept(cohortFilter, filter));
            });
        }
        else {
            items.push(generatePanelItemForConcept(cohortFilter));
        }
        return items;
    }

    /**
     * Generate a value constraint for numeric ranges.
     * @memberof QueryBuilderService
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
     * Generate a separate panel item for the specified concept.
     * @param cohortFilter
     * @returns {{item_name: *, item_key: *, tooltip: *, class: string}}
     */
    function generatePanelItemForConcept(cohortFilter, filter) {

        var name = cohortFilter.name;
        var key = cohortFilter.study._embedded.ontologyTerm.key;
        var tip = cohortFilter.label;
        if (filter) {
            name = filter;
            key += filter;
            tip += filter;
        }

        return {
            'item_name': name,
            'item_key': key,
            'tooltip': tip,
            'class': 'ENC'
        };
    }


    return service;
}]);
