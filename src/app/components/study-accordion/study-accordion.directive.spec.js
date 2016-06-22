'use strict';
describe('studyAccordion', function() {
  var scope, template, controller, TreeNodeService;

  beforeEach(function() {module('transmartBaseUi');});

  // load all angular templates (a.k.a html files)
  beforeEach(module('transmartBaseUIHTML'));

  beforeEach(inject(function($compile, $rootScope, $controller, _TreeNodeService_) {
    scope = $rootScope.$new();
    TreeNodeService = _TreeNodeService_;

    var element = angular.element("<study-accordion></study-accordion>");
    template = $compile(element)(scope);
    scope.$digest();

    controller = $controller('StudyAccordionCtrl', {$scope : scope});
  }));

  describe('$scope.populateChilds', function () {
    var _scope;

    beforeEach(function () {
      _scope = scope;
      spyOn(TreeNodeService, 'getNodeChildren')
    });

    it ('should invoke TreeNodeService.getNodeChildren when populating node children', function () {
      var _nodes = { nodes : [
        {
          title : 'someTitle',
          total : 999,
          type : 'UNKNOWN'
        }
      ]};
      _scope.populateChilds(_nodes);
      expect(TreeNodeService.getNodeChildren).toHaveBeenCalled();
    });

  });

  describe('$scope.getTree', function () {
    var _scope;

    beforeEach(function () {
      _scope = scope;
      spyOn(TreeNodeService, 'getSingleTree')
    });

    it ('should invoke TreeNodeService.getSingleTree when expanding a study node', function () {
      var _study = {
          open : false
      };
      _scope.getTree(_study);
      expect(TreeNodeService.getSingleTree).toHaveBeenCalledWith(_study);
      expect(_study.open).toBeTruthy();
    });

    it ('should change open flag to false when collapsing a study node', function () {
      var _study = {
        open : true
      };
      _scope.getTree(_study);
      expect(_study.open).toBeFalsy();
    });
  });

  describe('$scope.displayMetadata', function () {

    var _scope, _nodes = [
      {restObj : {fullName : 'restObj-fullname', metadata : 'restObj-metadata'}, title : 'restObj-title'},
      {_embedded : {ontologyTerm : {name : '_embedded-name', fullName : '_embedded-fullname', metadata : '_embedded-metadata'}}}
    ];

    beforeEach(function () {
      _scope = scope;
    });

    it ('should use metadata from restObj when node has restObj property', function () {
        _scope.displayMetadata(_nodes[0]);
        expect(_scope.metadataObj.title).toEqual('restObj-title');
        expect(_scope.metadataObj.fullname).toEqual('restObj-fullname');
        expect(_scope.metadataObj.body).toEqual('restObj-metadata');
    });

    it ('should use metadata from embedded.ontologyTerm when node has _embedded property', function () {
        _scope.displayMetadata(_nodes[1]);
        expect(_scope.metadataObj.title).toEqual('_embedded-name');
        expect(_scope.metadataObj.fullname).toEqual('_embedded-fullname');
        expect(_scope.metadataObj.body).toEqual('_embedded-metadata');
    });

  });

});
