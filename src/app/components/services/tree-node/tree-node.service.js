'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name TreeNodeService
 */
angular.module('transmartBaseUi').factory('TreeNodeService', ['$q', function ($q) {

    var service = {};

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
     * @memberof TreeNodeService
     * @param newNode
     * @returns {*}
     */
    service.getTotalSubjects = function (newNode) {
        var deferred = $q.defer();
        // Counting total number of subjects in a node
        newNode.restObj.one('subjects').get().then(function (subjects) {
            deferred.resolve(subjects._embedded.subjects.length);
        }, function () {
            deferred.reject('Cannot count subjects');
        });
        return deferred.promise;
    };





    /**
     * @memberof TreeNodeService
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
     * @param node
     * @param prefix
     * @returns {*}
     */
    service.getNodeChildren = function (node, prefix) {
        var childLinks, deferred = $q.defer();
        prefix = prefix || '';

        if (node.loaded) {
            deferred.resolve(node.loaded);
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
            deferred.resolve(node.loaded);
        }

        return deferred.promise;
    };

    return service;

}]);
