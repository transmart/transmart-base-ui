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
                    'content@boxplot': {
                        templateUrl: 'app/SmartR/containers/boxplot/boxplot.content.html',
                        controller: 'BoxplotController',
                        controllerAs: 'vm'
                    }
                }
            });
    });
