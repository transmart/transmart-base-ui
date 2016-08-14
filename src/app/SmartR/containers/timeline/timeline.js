angular.module('smartRApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('timeline', {
                parent: 'site',
                url: '/timeline',
                views: {
                    '@': {
                        templateUrl: 'app/SmartR/containers/timeline/timeline.html'
                    },
                    'content@help': {
                        templateUrl: 'app/SmartR/containers/timeline/timeline.content.html'
                    }
                }
            });
    });
