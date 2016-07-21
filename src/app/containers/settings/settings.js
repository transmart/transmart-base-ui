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
                    'navbar@settings': {
                        templateUrl: 'app/components/navbar/navbar.html',
                        controller: 'NavbarCtrl'
                    },
                    'content@settings': {
                        templateUrl: 'app/containers/settings/settings.html'
                    },
                    'footer@settings': {
                        templateUrl: 'app/components/footer/footer.html',
                        controller: 'FooterCtrl'
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
