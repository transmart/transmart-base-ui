'use strict';

describe('HighdimCtrl', function () {
  beforeEach(module('transmartBaseUi'));

  var $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
    AlertService = _AlertService_;
    $scope = {};
    controller = $controller('HighdimCtrl', {$scope: $scope});
  }));

  describe('tests', function () {

  });

});
