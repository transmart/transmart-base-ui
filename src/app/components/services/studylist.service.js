'use strict';

angular.module('transmartBaseUi').factory('StudyListService', ['$q', function($q){

  var service = {
    studyList : []
  };

  service.emptyAll = function () {
    service.studyList = [];
  };

  /**
   * Show all studies
   */
  service.showAll = function () {
    _.forEach(this.studyList, function (s) {s.hide = false;});
  };

  /**
   * Get all studies
   * @returns {Array}
   */
  service.getAll = function () {
    return service.studyList;
  };

  service.getPublicStudies = function () {
    return _.filter(service.studyList, {type:'public'});
  };

  service.getPrivateStudies = function () {
    return _.filter(service.studyList, {type:'private'});
  };

  service.getOtherStudies = function () {
    return _.filter(service.studyList, {type:'other'});
  };

  service.loadStudyList = function (endpoint) {
    var deferred = $q.defer();
    // Do ajax call on each endpoints
    endpoint.restangular.all('studies').getList().then(function (studies) {
      // reconfirmed that endpoint are still active
      endpoint.status = 'active';
      // add study type based on root
      _.forEach(studies, function (study) {
        study.endpoint = endpoint; // Keep reference to endpoint
        if (study._embedded.ontologyTerm.fullName.split('\\')[1] === 'Public Studies') {
          study.type = 'public';
        } else if (study._embedded.ontologyTerm.fullName.split('\\')[1] === 'Private Studies') {
          study.type = 'private';
        } else {
          study.type = 'other';
        }
        study.hide = false; // show study by default
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

  /**
   * Get list of searching targets in a study object. By default it should be only ontology object.
   * When ontology object contains metadata, it should include metadata object as searching target.
   * @param study - study
   * @returns {Array} - list of searching targets
     */
  var collectSearchTargetObjects = function (study) {
    var _objList = [];
    _objList.push(study._embedded.ontologyTerm);
    if (study._embedded.ontologyTerm.hasOwnProperty('metadata')) {
      _objList.push(study._embedded.ontologyTerm.metadata);
    }
    return _objList;
  };

  /**
   * Check if any search keywords are matched with searching target object's values.
   * @param obj - searching target object
   * @param searchKeywords - list of search keywords
     */
  var containsSearchKey = function (obj, searchKeywords) {
    var isFound = false;

    _.forOwn(obj, function (v, k) { // iterate through object's properties
      if (typeof v === 'string') { // only searching into string values
        isFound = _.findIndex(searchKeywords, function (searchKeyword) {
            // search through study attributes
            return obj[k].match(new RegExp(searchKeyword, 'i')) // partial match and case insensitive
          }) >= 0;
      }
      if (isFound) return false; // exit loop when found
    });

    return isFound;
  };

  /**
   * Filter studies by search keywords
   * @param searchKeywords
   * @returns {Array} - studies which contains search keywords
    */
  service.showStudiesByKeys = function (searchKeywords) {
    _.forEach(this.studyList, function(s) {
      _.forEach(collectSearchTargetObjects(s), function (_obj) {  // Iterate through searching objects of a study
          s.hide = !containsSearchKey(_obj, searchKeywords);      // Hide the study when it does not contain search keywords
          if (!s.hide) return false;                              // Exit loop when it contains search keywords
      });
    });
  };

  return service;
}]);

