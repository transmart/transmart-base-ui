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
        study.isLoading = true;
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
        study.isLoading = false;
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
  var containsSearchKeys = function (obj, searchKeywords, operator) {
    var isFound = false;
    var keyMap = [];
    var op = operator || 'OR';
	  /**
     * Perform both partial and case insensitive matching
     * for string values and study object keys
     */
    _.forOwn(obj, function (v, k) { // iterate through object's properties
      var pair = [];

      // Only add string values of object's key and property to the search pair
      if (typeof v === 'string') { pair.push(v); }
      if (typeof k === 'string') { pair.push(k); }

      _.each(pair, function(searchString) {
        var idx = hasKeywordByIndex(searchString, searchKeywords);
        if (idx >= 0) {
          keyMap.push(searchKeywords[idx]);
          isFound = true;
        }
      });

      if (isFound && op === 'OR') { return false; }
    });

    if (isFound && op === 'AND') {
      return _.uniq(keyMap).length == searchKeywords.length;
    }

    if (isFound && op === 'OR') { return true; }

    return false;
  };

	/**
   * Find the argumented string in one of the keywords
   * and return the index of first matched keyword element.
   * @param str - String to be searched for
   * @param keywords - Array of keywords to search in
   * @returns index {number}
   */
  var hasKeywordByIndex = function(str, keywords) {
      return _.findIndex(keywords, function (searchKeyword) {
          return str.match(new RegExp(searchKeyword, 'i'));
        });
  };
  /**
   * Filter studies by search keywords
   * @param searchKeywords
   * @returns {Array} - studies which contains search keywords
    */
  service.showStudiesByKeys = function (searchKeywords, operator) {
    _.forEach(this.studyList, function(s) {
      _.forEach(collectSearchTargetObjects(s), function (_obj) {       // Iterate through searching objects of a study
        s.hide = !containsSearchKeys(_obj, searchKeywords, operator);  // Hide the study when it does not contain search keywords
        if (!s.hide) return false;                                     // Exit loop when it contains search keywords
      });
    });
  };

  return service;
}]);

