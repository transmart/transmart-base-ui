'use strict';

angular.module('transmartBaseUi').factory('TreeNodeService', ['$q', function($q) {

  var service = {};

  service.setRootNodeAttributes = function (rootNode) {
    rootNode.restObj = rootNode;
    rootNode.loaded = false;
    rootNode.study = rootNode;
    rootNode.title = 'ROOT';
    rootNode.nodes = [];
    rootNode._links.children = rootNode._embedded.ontologyTerm._links.children;
    rootNode.isLoading = true;
    return rootNode;
  };

  /**
   *  TODO: Need rest call refactoring. This is not the most efficient way to count subjects in a node.
   * @param newNode
   * @returns {*}
     */
  service.getTotalSubjects = function (newNode) {
    var deferred = $q.defer();
    // Counting total number of subjects in a node
    newNode.restObj.one('subjects').get().then(function (subjects) {
      deferred.resolve(subjects._embedded.subjects.length);
    }, function (){
      deferred.reject('Cannot count subjects');
    });
    return deferred.promise;
  };

  /**
   *
   * @param node
   * @param link
   * @param prefix
   * @returns {*}
     */
  service.loadNode = function (node, link, prefix) {
    var deferred = $q.defer();

    var newNode = { // prepare the node skeleton
      title: link.title,
      nodes: [],
      loaded: false,
      study: node.study
    };

    var nodePromise = node.restObj.one(prefix + link.title);

    nodePromise.get().then(function (childObj) { //
      newNode.type = childObj.type ? childObj.type : 'UNDEF';
      newNode.restObj = childObj;
      if (newNode.type === 'CATEGORICAL_OPTION') {
        node.type = 'CATEGORICAL_CONTAINER';
      }
      // and also count how many subjects in this node
      service.getTotalSubjects(newNode).then(function (total) {
        newNode.total = total;
        deferred.resolve(newNode);
      });

    }, function (err) { // when it's failed
      node.loaded = true;
      newNode.type = 'FAILED_CALL';
      newNode.total = '';
      deferred.reject(newNode);
    });

    return deferred.promise;
  };

  service.getNodeChildren = function (node, prefix) {
    var deferred = $q.defer();
    prefix = prefix || '';

    if (!node.loaded) { // when the node is not yet loaded ..

      var childLinks = node.restObj._links.children; // check if it has child links

      if (childLinks) {
        // start to load its children
        childLinks.forEach(function (link) {
          service.loadNode (node, link, prefix)
            .then(function (newNode) {
              node.nodes.push(newNode);
              node.loaded = true;
          })
            .catch(function (errNode) {
              node.nodes.push(errNode);
              node.loaded = false;
            })
            .finally(function () {
              if (childLinks.length === node.nodes.length) {
                deferred.resolve(node.nodes);
              }
            });
        });
      }
    } else {
      deferred.resolve(true);
    }

    return deferred.promise;
  };

  return service;

}]);
