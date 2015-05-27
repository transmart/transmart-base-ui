'use strict';

angular.module('transmartBaseUi')
  .controller('SidebarCtrl',
  ['$scope', 'Restangular', 'dataService', function ($scope, Restangular, dataService) {

    $scope.publicStudies = [];
    $scope.privateStudies = [];

    $scope.studies = [];

    $scope.studies = dataService.getStudies();

    // Check if studies are public or private
    // TODO: other cases not public or private
    $scope.studies.forEach(function(study){
      if(study._embedded.ontologyTerm.fullName.split('\\')[1] ==
          "Public Studies") {
        $scope.publicStudies.push(study);
      } else {
        $scope.privateStudies.push(study);
      }
    })

  }]);
