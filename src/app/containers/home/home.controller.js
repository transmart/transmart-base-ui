'use strict';

angular.module('transmartBaseUi')
    .controller('HomeCtrl', ['$scope', 'StudyListService', function ($scope, StudyListService) {
        var hc = this;

        hc.tutorial = {
            openStep1: true,
            disableStep1: false,
            openStep2: false
        };

        var init = function () {
            if (StudyListService.getAll().length > 0) {
                hc.tutorial.openStep1 = false;
                hc.tutorial.disableStep1 = true;
                hc.tutorial.openStep2 = true;
            }
        };

        $scope.$on('howManyStudiesLoaded', function (e, val) {
            if (val !== undefined) {
                hc.tutorial.openStep1 = !val;
                hc.tutorial.openStep2 = val;
            }
        });

        init();

    }]);
