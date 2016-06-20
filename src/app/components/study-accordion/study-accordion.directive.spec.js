'use strict';

fdescribe('studyAccordion', function() {
  var $scope, template, controller;

  beforeEach(function() {module('transmartBaseUi');});

  // load all angular templates (a.k.a html files)
  beforeEach(module('transmartBaseUIHTML'));

  beforeEach(inject(function($compile, $rootScope, $controller) {
    $scope = $rootScope.$new();
    var element = angular.element("<study-accordion></study-accordion>");
    template = $compile(element)($scope);
    $scope.$digest();
    controller = $controller('StudyAccordionCtrl', {$scope : $scope});
  }));

  it("should toggle open", inject(function() {
    $scope.displayMetadata(null);
  }));

});
