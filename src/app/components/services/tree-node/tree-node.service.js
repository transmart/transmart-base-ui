'use strict';

/**
 * Tree node management service
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name TreeNodeService
 */
angular.module('transmartBaseUi').factory('TreeNodeService', ['$q', function ($q) {

    var service = {};

    /**
     * Set attributes for a root node
     * @memberof TreeNodeService
     * @param rootNode
     * @returns {object} rootNode
     */
    service.setRootNodeAttributes = function (rootNode) {
        rootNode.restObj = rootNode;
        rootNode.loaded = false;
        rootNode.study = rootNode;
        rootNode.nodes = [];

        if (rootNode.hasOwnProperty('_links')) {
            rootNode._links.children =
                rootNode.hasOwnProperty('_embedded') ? rootNode._embedded.ontologyTerm._links.children : undefined;
            rootNode.isLoading = true;
        } else {
            rootNode.isLoading = false;
        }

        return rootNode;
    };

    /**
     * Get total subjects of a node.
     * @memberof TreeNodeService
     * @param node {object} - a tree node
     * @returns {Promise}
     */
    service.getTotalSubjects = function (node) {
        var deferred = $q.defer();
        // Counting total number of subjects in a node
        node.restObj.one('subjects').get().then(function (subjects) {
            deferred.resolve(subjects._embedded.subjects.length);
        }, function () {
            deferred.reject('Cannot count subjects');
        });
        return deferred.promise;
    };

    /**
     * Load a concept path (node)
     * @memberof TreeNodeService
     * @param node {object} - a tree node
     * @param link {object} - link of associated node
     * @param prefix {string} - string to be used as prefix in ajax call
     * @returns {Promise}
     */
    service.loadNode = function (node, link, prefix) {
        var deferred = $q.defer();

        var newNode = { // prepare the node skeleton
            title: link.title,
            nodes: [],
            loaded: false,
            study: node.study
        };

        var setErrorNode = function (node) {
            node.type = 'FAILED_CALL';
            node.total = '';
            node.loaded = true;
           return node;
        };

        var nodePromise = node.restObj.one(prefix + link.title);

        nodePromise.get()
            .then(function (childObj) {
                newNode.type = childObj.type ? childObj.type : 'UNDEF';
                newNode.restObj = childObj;
                if (newNode.type === 'CATEGORICAL_OPTION') {
                    node.type = 'CATEGORICAL_CONTAINER';
                    newNode.parent = node;
                }
            })
            .catch(function () {
                // reject error node
                deferred.reject(setErrorNode(newNode));
            })
            .finally(function () {
                node.loaded = true;
                // and also count how many subjects in this node
                if (newNode.type !== 'FAILED_CALL') {
                    service.getTotalSubjects(newNode).then(function (total) {
                        newNode.total = total;
                        deferred.resolve(newNode);
                    }).catch(function () {
                        // reject error node
                        deferred.reject(setErrorNode(newNode));
                    });
                }
            });

        return deferred.promise;
    };

    /**
     * @memberof TreeNodeService
     * @param node {Object} - tree node
     * @param prefix {String} - string to be used as prefix in ajax call
     * @returns {Promise}
     */
    service.getNodeChildren = function (node, prefix) {
        var childLinks, deferred = $q.defer();
        prefix = prefix || '';

        if (node.loaded) {
            deferred.resolve(node.nodes);
            return deferred.promise;
        }

        if (node.type === 'FAILED_CALL') {
            deferred.reject('Error node');
            return deferred.promise;
        }

        childLinks = node.restObj._links.children; // check if it has child links

        if (childLinks) {
            // start to load its children
            childLinks.forEach(function (link) {
                service.loadNode(node, link, prefix)
                    .then(function (newNode) {
                        node.nodes.push(newNode);
                    })
                    .catch(function (errNode) {
                        node.nodes.push(errNode);
                    })
                    .finally(function () {
                        if (childLinks.length === node.nodes.length) {
                            deferred.resolve(node.nodes);
                        }
                    });
            });
        } else {
            // end of node
            node.loaded = true;
            deferred.resolve(node.nodes);
        }
        return deferred.promise;
    };

    /**
     * @memberof TreeNodeService
     * @param node
     * @returns boolean
     */
    service.isCategoricalLeafNode = function (node) {
        return node.type === 'CATEGORICAL_OPTION';
    }

    //TODO: remove this method from study accordion directive?
    service.populateChildren = function (node) {
        var deferred = $q.defer();
        var prefix;

        // first check if node has Restangular object or not
        // if not it means it's root node a.k.a study
        if (!node.hasOwnProperty('restObj')) {
            node = service.setRootNodeAttributes(node);
        }

        // If the node is a study, we need to prepend 'concepts' to the url
        if (node == node.study) {
            prefix = 'concepts/';
        }

        node.isLoading = true;

        service.getNodeChildren(node, prefix)
            .then(deferred.resolve)
            .catch(deferred.reject)
            .finally(function () {
                node.isLoading = false;
        });

        return deferred.promise;
    };

    service.expandConcept = function(node, conceptSplit) {
        var deferred = $q.defer()

        // Retrieve all children of the node.
        // It's possible that these still need to be loaded.
        service.populateChildren(node)
            .then(function(result) {

                // find matching child node
                var matchingChild = undefined;
                _.forEach(result, function(child) {
                    if (child.title == conceptSplit[0]) {
                        matchingChild = child;
                        return false; //break from forEach
                    }
                })

                // expand the matching child recursively
                if (matchingChild && conceptSplit.length > 1) {
                    service.expandConcept(matchingChild, conceptSplit.slice(1))
                        .then(function(result) {
                            deferred.resolve(result);
                        });
                }
                else {
                    deferred.resolve(matchingChild);
                }
            });

        return deferred.promise;
    };

    return service;

}]);
