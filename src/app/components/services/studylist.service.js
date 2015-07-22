'use strict';

angular.module('transmartBaseUi').factory('StudyListService', ['EndpointService', '$q', function(EndpointService, $q){

  var service = {
    public : [],
    private : []
  };

  service.emptyAll = function () {
    service.public = [];
    service.private = [];
  };

  /**
   * get
   * @returns {Array}
   */
  service.getAll = function () {
    return _.union(service.public, service.private);
  };

  /**
   * Load studies from existing endpoints
   * TODO: checkout active connections, doesn't have to load studies each time users open this controller
   * @returns {*}
   */
  service.loadStudies = function () {

    /**
     * TODO does not have to be called if smart checking is already implemented
     */
    service.emptyAll();

    var _endpoints = EndpointService.getEndpoints();
    var _deferred = $q.defer();

    // Load studies from each endpoints
    _endpoints.forEach(function (endpoint) {
      endpoint.restangular.all('studies').getList().then(function (studies) {
          endpoint.status = 'success';
          // Checking if studies are public or private
          studies.forEach(function (study) {
            study.endpoint = endpoint; // Keep reference to endpoint
            if (study._embedded.ontologyTerm.fullName.split('\\')[1] ===
              'Public Studies') {
              service.public.push(study)
            } else {
              service.private.push(study);
            }
          });
          _deferred.resolve();
        }, function (err) {
          _deferred.reject('Cannot get studies from the rest endpoint. ' + err);
        });
      endpoint.status = 'error';
    });

    return _deferred.promise;
  };

  return service;
}]);

