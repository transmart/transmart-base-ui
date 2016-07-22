'use strict';

angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('workspace', {
                parent: 'site',
                url: '/workspace',
                views: {
                    '@': {
                        templateUrl: 'app/containers/workspace/workspace.html'
                    },
                    'sidebar@workspace': {
                        templateUrl: 'app/components/sidebar/sidebar.html',
                        controller: 'SidebarCtrl'
                    },
                    'content@workspace': {
                        templateUrl: 'app/containers/workspace/analysis/analysis.html',
                        controller: 'AnalysisCtrl'
                    }
                }
            });
    });
