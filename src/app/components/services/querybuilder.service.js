'use strict';

angular.module('transmartBaseUi').factory('QueryBuilderService', ['JSON2XMLService',
  function(JSON2XMLService) {

  var service = {};

  service.convertCohortFiltersToXML = function(cohortFilters, name) {
    var xml = JSON2XMLService.json2xml({
        'query_definition': {
          'query_name': name,
          'panel': service.convertCohortFiltersToI2B2Structure(cohortFilters)
        }
      });
    return xml;
  };

  service.convertCohortFiltersToI2B2Structure = function(cohortFilters) {
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

  function generatePanelItemsForNumericRanges(cohortFilter) {
    var items = [];

    _.each(cohortFilter.filters, function(filter) {
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

  function generatePanelItemsForCategories(cohortFilter) {
    var items = [];
    _.each(cohortFilter.filters, function(filter) {
      items.push(generatePanelItemForConcept(cohortFilter.label + filter, filter, cohortFilter.study.type));
    });
    return items;
  }

  function generateConstraintByValueBetween(value1, value2) {
    return {
      'value_operator': 'BETWEEN',
      'value_constraint': '' + value1 + ' and ' + value2,
      'value_type': 'NUMBER'
    }
  }

  function generatePanelItemForConcept(key, name, studyType) {
    return {
      'item_name': name,
      'item_key': getStudyTypePrefix(studyType) + key,
      'tooltip': key,
      'class': 'ENC',
    };
  }

  function getStudyTypePrefix(studyType) {
    switch(studyType) {
      case 'public':
        return '\\\\Public Studies';
      case 'private':
        return '\\\\Private Studies';
    }
  }

  return service;
}]);
