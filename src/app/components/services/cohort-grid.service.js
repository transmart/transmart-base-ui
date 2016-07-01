'use strict';

angular.module('transmartBaseUi').factory('CohortGridService', ['$timeout', '$q', function ($timeout, $q) {

  var service = {
    WIDTH_PER_COLUMN : 200,
    options: {
      //enablePaginationControls: false,
      enableGridMenu: true,
      enableSelectAll: true,
      exporterCsvFilename: 'cohort.csv',
      exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
      exporterMenuPdf: false,
      paginationPageSizes: [100, 200, 500],
      paginationPageSize: 100,
      columnDefs: [],
      data: [],
      enableFiltering: true,
      onRegisterApi: function (gridApi) {
       service.options.gridApi = gridApi;
      }
    }
  };

  /**
   * Generate grid columns
   * @param rawHeaders
   * @returns {Array}
     */
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

  /**
   * Format data and labels for the gridview's data
   * @param subjects
   * @param headers
   * @returns {Array}
     */
  service.convertToTable  = function (subjects, headers) {
    var formatted = [];
    subjects.forEach(function (subject) {
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
    var deferred = $q.defer();
    $timeout(function () { // this is necessary for ui-grid to notice the change at all
      service.options.data = service.convertToTable(subjects, labels); // cohorts & hears as they are cannot be displayed
      service.options.columnDefs = service.prepareColumnDefs(labels); // they need to be put in ng-grid format
      // as a % of screen - therefore it needs to be set dynamically after each change to number of columns
      $timeout(function () { // handleWindowResize needs to be called in yet another digest cycle than setting the
        // data,  columnDefs and the css width attribute
        service.options.gridApi.core.handleWindowResize();
        deferred.resolve(service.options.columnDefs.length * service.WIDTH_PER_COLUMN);
      });
    });
    return deferred.promise;
  };

  return service;
}]);
