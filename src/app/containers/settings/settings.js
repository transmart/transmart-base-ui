'use strict';

angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('settings', {
                parent: 'site',
                url: '/settings',
                views: {
                    '@': {
                        templateUrl: 'app/containers/settings/settings.html'
                    },
                    'content@settings': {
                        templateUrl: 'app/containers/settings/settings.html'
                    }
                }
            })
            .state('settings.connections', {
                parent: 'settings',
                url: '/settings/connections',
                views: {
                    'content@settings': {
                        templateUrl: 'app/containers/settings/connections/connections.html',
                        controller: 'ConnectionsCtrl'
                    }
                }
            });
    });
