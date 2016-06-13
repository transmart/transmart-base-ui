'use strict';

angular.module('transmartBaseUi').factory('QueryBuilderService', ['JSON2XMLService',
  function(JSON2XMLService) {

  var service = {};

  service.convertQueryToXML = function(cohortFilters, name) {
    var xml = JSON2XMLService.json2xml({
        'query_definition': {
          'query_name': name,
          'panel': convertCohortFiltersToI2B2Structure(cohortFilters)
        }
      });
    return xml;
  };

  function convertCohortFiltersToI2B2Structure(cohortFilters) {
    var panels = [];

    _.each(cohortFilters, function(cohortFilter) {
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
    return panels;
  };

  function generatePanelItemsForNumericRanges(cohortFilter) {
    var items = [];

    _.each(cohortFilter.filters, function(filter) {
      items.push({
        'item_name': cohortFilter.name,
        'item_key': '\\\\Public Studies' + cohortFilter.label,
        'tooltip': cohortFilter.label,
        'class': 'ENC',
        'constrain_by_value': generateConstraintByValueBetween(filter[0], filter[1])
      });
    });

    return items;
  };

  function generatePanelItemsForCategories(cohortFilter) {
    var items = [];

    _.each(cohortFilter.filters, function(filter) {
      items.push({
        'item_name': filter,
        'item_key': '\\\\Public Studies' + cohortFilter.label + filter,
        'tooltip': cohortFilter.label + filter,
        'class': 'ENC',
      });
    });

    return items;
  };

  function generateConstraintByValueBetween(value1, value2) {
    return {
      'value_operator': 'BETWEEN',
      'value_constraint': '' + value1 + ' and ' + value2,
      'value_type': 'NUMBER'
    }
  };

  return service;
}]);
