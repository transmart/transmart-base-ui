'use strict';

/**
 * SmartR workflow selector PoC
 */
angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('smartr', {
                parent: 'site',
                url: '/smartr',
                views: {
                    '@': {
                        templateUrl: 'app/containers/smartr/smartr.html'
                    },
                    'content@smartr': {
                        templateUrl: 'app/containers/smartr/smartr.html'
                    }
                }
            });
    });
