'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',
  ['$scope', 'Restangular', function ($scope, Restangular) {

    $scope.status = {
      isFirstOpen: true,
      isFirstDisabled: false
    };

    $scope.oneAtATime = true;

    Restangular.all('studies').getList()
      .then(function (studies) {
        $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});
        $scope.studies = studies;
      }, function (err) {
        $scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
        console.error(err);
      });

  }]);
