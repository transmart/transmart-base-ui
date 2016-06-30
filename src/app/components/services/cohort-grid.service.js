'use strict';

angular.module('transmartBaseUi').factory('CohortGridService', ['$timeout', function ($timeout) {

  var service = {
    WIDTH_PER_COLUMN : 200,
    options: {
      paginationPageSizes: [10, 25, 50],
      paginationPageSize: 10,
      columnDefs: [],
      data: [],
      enableFiltering: true,
      onRegisterApi: function (gridApi) {
       service.options.gridApi = gridApi;
      }
    }
  };

  service.prepareColumnDefs = function (rawHeaders) {
    var columnDefs = [];
    columnDefs.push({'field': 'id'});
    rawHeaders.forEach(function (label) {
      if (_.find(columnDefs, {field: label.name}) == undefined) {
        columnDefs.push({field: label.name});
      }
    });
    return columnDefs;
  };

  service.convertToTable  = function (cohort, headers) {
    var formatted = [];
    cohort.forEach(function (subject) {
      var cleanSubject = {};
      cleanSubject.id = subject.id;
      headers.forEach(function (label) {
        cleanSubject[label.name] = subject.labels[label.ids];
      });
      formatted.push(cleanSubject);
    });
    return formatted;
  };

  service.updateCohortGridView = function (subjects, labels) {
    $timeout(function () { // this is necessary for ui-grid to notice the change at all
      service.options.data = service.convertToTable(subjects, labels); // cohorts and hears as they are cannot be displayed
      service.options.columnDefs = service.prepareColumnDefs(labels); // they need to be put in ng-grid format
      // as a % of screen - therefore it needs to be set dynamically after each change to number of columns
      $timeout(function () { // handleWindowResize needs to be called in yet another digest cycle than setting the
        // data,  columnDefs and the css width attribute
        service.options.gridApi.core.handleWindowResize();
        return service.options.columnDefs.length * service.WIDTH_PER_COLUMN;
      });
    });
  };

  return service;
}]);
