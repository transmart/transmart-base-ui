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

  service.loadChildNode = function (node, link, prefix) {
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
      // Counting total number of subjects in a node
      newNode.restObj.one('subjects').get().then(function (subjects) {
        newNode.total = subjects._embedded.subjects.length;
        deferred.resolve(newNode);
      });
    }, function (response) { // when it's failed
      node.loaded = true;
      newNode.type = 'FAILED_CALL';
      newNode.total = '';
      deferred.resolve(newNode);
    });

    return deferred.promise;
  };

  service.getNodeChildren = function (node, end, prefix) {
    var deferred = $q.defer();
    prefix = prefix || '';

    if (!node.loaded) { // when the node is not yet loaded ..

      var childLinks = node.restObj._links.children; // check if it has child links

      if (childLinks) {
        // start to load its children
        childLinks.forEach(function (link) {
          service.loadChildNode (node, link, prefix).then(function (newNode) {
            node.nodes.push(newNode);
            node.loaded = true;
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
