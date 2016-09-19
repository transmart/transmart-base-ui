'use strict';

angular.module('transmartBaseUi')
    .controller('CohortSelecctionLayoutCtrl', ['$scope','$element', 'CohortSelectionService',
        function ($scope, $element, CohortSelectionService) {

        $scope.$on('ui.layout.resize', function(e, beforeContainer, afterContainer){
            CohortSelectionService.boxes.forEach(function (box) {
                box.ctrl.resize(true);
            });
        });
    }]);
