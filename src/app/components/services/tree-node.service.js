'use strict';

angular.module('transmartBaseUi').factory('TreeNodeService', [function() {

  var service = {};

  /**
   * Counts the subjects for a node
   * @param node
   * @private
   */
  service.countSubjects = function(node) {
    if (!node.hasOwnProperty('restObj')) {
      node.total = '-';
    }
    else if (!node.hasOwnProperty('total')) {
      node.restObj.one('subjects').get().then(function (subjects) {
        node.total = subjects._embedded.subjects.length;
      });
    }
  };

  /**
   * Populates 2 levels of children for the node
   * @param node
   * @param end IF TRUE runs only for one level
   * @param prefix
   * @private
   */
  service.getNodeChildren = function (node, end, prefix) {

    prefix = prefix || '';

    var children = node.restObj ? node.restObj._links.children : undefined;

    if (!node.loaded) {

      node.study.treeLoading = true;

      this.countSubjects(node);

      if (children) {

        children.forEach(function (child) {

          var newNode = {
            title: child.title,
            nodes: [],
            loaded: false,
            study: node.study
          };

          node.restObj.one(prefix + child.title).get().then(function (childObj) {

            newNode.type = childObj.type ? childObj.type : 'UNDEF';
            newNode.restObj = childObj;

            if (newNode.type === 'CATEGORICAL_OPTION') {
              node.type = 'CATEGORICAL_CONTAINER';
            }

            node.nodes.push(newNode);

            if (!end) {
              service.getNodeChildren(newNode, true);
            } else {
              node.study.treeLoading = false;
            }

          }, function () {
            newNode.type = 'FAILED_CALL';
            node.nodes.push(newNode);
            node.study.treeLoading = false;
            node.loaded = true;
          });
        });
      } else {
        node.study.treeLoading = false;
      }
    }

    if (!end) {
      node.loaded = true;
    }

  };

  /**
   * Populates the first 2 levels of a study tree
   * @param study
   * @returns {{title: string, nodes: Array, restObj: *, loaded: boolean}}
   * @private
   */
  service.getSingleTree = function(study) {
    if (study) {
      var _tree = {
        'title': 'ROOT',
        'nodes': [],
        'restObj': study,
        'loaded': false,
        'study': study
      };
      study._links.children = study._embedded.ontologyTerm._links.children;
      this.getNodeChildren(_tree, false, 'concepts/');
      return _tree;
    }
  };
  return service;

}]);
