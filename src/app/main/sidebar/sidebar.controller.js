'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',
  ['$scope', 'Restangular', function ($scope, Restangular) {

    $scope.publicStudies = [];
    $scope.privateStudies = [];

    Restangular.all('studies').getList()
      .then(function (studies) {

        // alert user that it successfully connects to the rest-api
        $scope.alerts.push({type: 'success', msg: 'Successfully connected to rest-api'});

        $scope.studies = studies;

        // Check if studies are public or private
        // TODO: other cases not public or private
        $scope.studies.forEach(function(study){
          if(study._embedded.ontologyTerm.fullName.split('\\')[1] ===
            'Public Studies') {
            $scope.publicStudies.push(study);
          } else {
            $scope.privateStudies.push(study);
          }
        });

      }, function () {
        // alert user that system cannot talk to the rest-api
        $scope.alerts.push({type: 'danger', msg: 'Oops! Cannot connect to rest-api.'});
      });

  }]);
