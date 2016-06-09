'use strict';

angular.module('transmartBaseUi').factory('QueryBuilderService', ['JSON2XMLService',
  function(JSON2XMLService) {

  var service = {
  };

  service.convertQueryToXML = function(query, name) {
    var xml = JSON2XMLService.json2xml({
        'query_definition': {
          'query_name': name,
          'panel': {
            'panel_number': 1,
            'item': representCohortFiltersAsXML(query)
          }
        }
      });
    console.log(xml);
    return xml;
  };

  function representCohortFiltersAsXML(cohortFilters) {
    var items = [];
    _.each(cohortFilters, function(cohortFilter) {
      console.log(cohortFilter);
      items.push(generatePanelItem(cohortFilter));
    });
    return items;
  };

  function generatePanelItem(cohortFilter) {
    var item = {
      'item_name': cohortFilter.name,
      'item_key': '\\\\Public Studies' + cohortFilter.label,
      'tooltip': cohortFilter.label,
      'class': 'ENC',
    }

    if (cohortFilter.type == 'float') {
      if (cohortFilter.filters.length == 1) {
        // the first filter will contain an array with a min and max value
        var minValue = cohortFilter.filters[0][0];
        var maxValue = cohortFilter.filters[0][1];
        item['constrain_by_value'] = generateConstraintByValueBetween(minValue, maxValue);
      }
    }

    return item;
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
