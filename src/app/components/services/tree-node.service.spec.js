'use strict';

describe('TreeNodeService', function() {

  beforeEach(function () {
    module('transmartBaseUi');
  });

  var $q, deferred, TreeNodeService;

  beforeEach(inject(function ( _$q_, _TreeNodeService_) {
    $q = _$q_;
    deferred = _$q_.defer();
    TreeNodeService = _TreeNodeService_;
  }));

  describe('setRootNodeAttributes', function () {
    it ('should set node attributes with some default values', function () {
      var
        _dummyNode = {
          _links : {
            children : []
          },
          _embedded : {
            ontologyTerm : {
              _links : {
                children : []
              }
            }
          }
        },
        _rootNode = TreeNodeService.setRootNodeAttributes(_dummyNode);

      expect(_rootNode.restObj).toEqual(_dummyNode);
      expect(_rootNode.loaded).toEqual(false);
      expect(_rootNode.study).toEqual(_dummyNode);
      expect(_rootNode.title).toEqual('ROOT');
      expect(_rootNode.nodes).toEqual([]);
      expect(_rootNode._links.children).toEqual(_dummyNode._embedded.ontologyTerm._links.children);
      expect(_rootNode.isLoading).toEqual(true);

    });
  });

  fdescribe('loadNode', function () {

    var
      _node = {
        restObj : {
          one : function (str) {
            return this;
          },
          get : function () {

          }
        }
      },
      _link = {title:'dummy'},
      _loadedNode = {
        restObj : {
          one : function (str) {
            return this;
          },
          get : function () {

          }
        }
      };

    beforeEach(function () {
      spyOn(_node.restObj, 'one').and.callThrough();
      spyOn(_node.restObj, 'get').and.returnValue(deferred.promise);

      TreeNodeService.loadNode(_node, _link, 'concepts/')
    });

    it('should track the one was called to get concept details', function () {
      expect(_node.restObj.one).toHaveBeenCalledWith('concepts/' + _link.title);
    });

    it('should track the get was called', function () {
      expect(_node.restObj.get).toHaveBeenCalled();
    });
  });

});
