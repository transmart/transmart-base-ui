'use strict';

angular.module('transmartBaseUi')
  .factory('DataService',['Restangular', '$q', function (Restangular, $q) {
    var service = {};

    var labels = [];
    var types = [];
    var names = [];

    var _getLastToken = function (what) {
      var _t = what.split('\\').slice(1);
      return what.indexOf('\\') === -1 ? what : _t[_t.length-2];
    };

    var _addLabel = function(label,value){
      if(labels.indexOf(label) === -1) {
        labels.push(label);
        types.push(typeof value);
        names.push(_getLastToken(label));
      }
    };

    service.getLabels = function(){
      return {labels:labels, types:types, names:names};
    };



    service.getObservations = function (node) {
      var _path = node.link.slice(1);

      labels = [];
      types = [];
      names = [];

      var deferred = $q.defer()

      Restangular.all(_path + '/observations').getList()
        .then(function (d) {
          // Group observation labels under common subject
          var subjects = [];
          d.forEach(function(obs){
            _addLabel(obs.label, obs.value);
            var found = false;
            subjects.forEach(function(sub){
              if(sub.id === obs._embedded.subject.id){
                sub.labels[obs.label] = obs.value;
                found = true;
                return;
              }
            });
            if(!found){
              var newSub = obs._embedded.subject;
              newSub.labels = {};
              newSub.labels[obs.label] = obs.value;
              subjects.push(newSub);
            }
          });

          deferred.resolve(subjects);
        }, function (err) {
          deferred.reject('Cannot get data from the end-point.');
        });
      return deferred.promise;
    };

    return service;
}]);
