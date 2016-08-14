angular.module('smartRApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('correlation', {
                parent: 'site',
                url: '/correlation',
                views: {
                    '@': {
                        templateUrl: 'app/SmartR/containers/correlation/correlation.html'
                    },
                    'content@help': {
                        templateUrl: 'app/SmartR/containers/correlation/correlation.content.html'
                    }
                }
            });
    });
