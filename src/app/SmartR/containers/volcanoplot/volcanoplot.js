angular.module('smartRApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('volcanoplot', {
                parent: 'site',
                url: '/volcanoplot',
                views: {
                    '@': {
                        templateUrl: 'SmartR/containers/volcanoplot/volcanoplot.html'
                    },
                    'content@help': {
                        templateUrl: 'SmartR/containers/volcanoplot/volcanoplot.content.html'
                    }
                }
            });
    });
