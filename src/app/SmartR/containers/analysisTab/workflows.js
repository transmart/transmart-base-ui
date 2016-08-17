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
                        templateUrl: 'app/SmartR/containers/analysisTab/workflows.html'
                    },
                    'content@smartr': {
                        templateUrl: 'app/SmartR/containers/analysisTab/workflows.html'
                    }
                }
            });
    });
