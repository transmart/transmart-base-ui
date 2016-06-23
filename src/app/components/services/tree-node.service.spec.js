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

  /**
  describe('countSubject', function () {
    var
      _subjects = {
        _embedded : {
          subjects : ['1', '2']
        }
      },
      _nodes = [{}, {
      restObj : {
        one : function (str) {
            return this;
        },
        get : function () {

        }
      }
    }];

    beforeEach(function () {
      //deferred.resolve(_subjects);
      spyOn(_nodes[1].restObj, 'one').and.callThrough();
      spyOn(_nodes[1].restObj, 'get').and.callFake(function () {
        return {
          then : function (callback) {return callback(_subjects)}
        }
      })
    });

    it ('should have total - when node is empty', function () {
      TreeNodeService.countSubjects(_nodes[0]);
      expect(_nodes[0].total).toEqual('-');
    });

    it ('should count total', function () {

      TreeNodeService.countSubjects(_nodes[1]);
      expect(_nodes[1].restObj.one).toHaveBeenCalled();
      expect(_nodes[1].restObj.get).toHaveBeenCalled();
      expect(_nodes[1].total).toEqual(2);
    });

  });


  describe('getSingleTree', function () {

    beforeEach(function () {
      spyOn(TreeNodeService, 'getNodeChildren');
    });

    it('should return undefined when study is not defined', function () {
      var _resultTree = TreeNodeService.getSingleTree();
      expect(_resultTree).toBe(undefined);
    });

    it('should get tree', function () {
      var _resultTree,
        _study  = {
        _links : {},
        _embedded : {
          ontologyTerm : {
            _links : {children : {}}
            }
          }
        },
        _refTree = {
          'title': 'ROOT',
          'nodes': [],
          'restObj': _study,
          'loaded': false,
          'study': _study
        };

      _resultTree = TreeNodeService.getSingleTree(_study);

      expect(TreeNodeService.getNodeChildren).toHaveBeenCalledWith(_resultTree, false, 'concepts/');
      expect(_resultTree).toEqual(_refTree);
    });
  });
   **/

});
