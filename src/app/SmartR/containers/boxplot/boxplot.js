angular.module('smartRApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('boxplot', {
                parent: 'site',
                url: '/boxplot',
                views: {
                    '@': {
                        templateUrl: 'app/SmartR/containers/boxplot/boxplot.html'
                    },
                    'content@help': {
                        templateUrl: 'app/SmartR/containers/boxplot/boxplot.content.html'
                    }
                }
            });
    });
