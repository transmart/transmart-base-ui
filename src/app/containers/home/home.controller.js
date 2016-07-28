'use strict';

angular.module('transmartBaseUi')
    .controller('HomeCtrl', ['$scope', 'StudyListService', function ($scope, StudyListService) {
        var vm = this;

        vm.tutorial = {
            openStep1: true,
            disableStep1: false,
            openStep2: false
        };

        var init = function () {
            if (StudyListService.getAll().length > 0) {
                vm.tutorial.openStep1 = false;
                vm.tutorial.disableStep1 = true;
                vm.tutorial.openStep2 = true;
            }
        };

        $scope.$on('howManyStudiesLoaded', function (e, val) {
            if (val !== undefined) {
                vm.tutorial.openStep1 = !val;
                vm.tutorial.openStep2 = val;
            }
        });

        init();

    }]);
