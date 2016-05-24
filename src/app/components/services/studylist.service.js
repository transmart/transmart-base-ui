'use strict';

angular.module('transmartBaseUi').factory('StudyListService', ['$q', function($q){

  var service = {
    studyList : []
  };

  service.emptyAll = function () {
    service.studyList = [];
  };

  /**
   * get
   * @returns {Array}
   */
  service.getAll = function () {
    return service.studyList;
  };

  service.getPublicStudies = function () {
    return _.where(service.studyList, {type:'public'});
  };

  service.getPrivateStudies = function () {
    return _.where(service.studyList, {type:'private'});
  };

  service.getOtherStudies = function () {
    return _.where(service.studyList, {type:'other'});
  };

  service.loadStudyList = function (endpoint) {
    var deferred = $q.defer();
    // Do ajax call on each endpoints
    endpoint.restangular.all('studies').getList().then(function (studies) {
      // reconfirmed that endpoint are still active
      endpoint.status = 'active';
      // add study type based on root
      _.each(studies, function (study) {
        study.endpoint = endpoint; // Keep reference to endpoint
        if (study._embedded.ontologyTerm.fullName.split('\\')[1] === 'Public Studies') {
          study.type = 'public';
        } else if (study._embedded.ontologyTerm.fullName.split('\\')[1] === 'Private Studies') {
          study.type = 'private';
        } else {
          study.type = 'other';
        }
        service.studyList.push(study);
      });
      deferred.resolve(service.studyList);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  /**
   * Remove study(s) by endpoint
   * @param endpoint
   */
  service.removeStudiesByEndpoint = function (endpoint) {
    if (endpoint) {
      var studies = _.filter(service.studyList, function (study) {
        return  study.endpoint.url !== endpoint.url ? study : null;
      });
      service.studyList = studies;

    }
  };

  return service;
}]);

