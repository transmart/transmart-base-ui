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
                    'navbar@workspace': {
                        templateUrl: 'app/components/navbar/navbar.html',
                        controller: 'NavbarCtrl'
                    },
                    'sidebar@workspace': {
                        templateUrl: 'app/components/sidebar/sidebar.html',
                        controller: 'SidebarCtrl'
                    },
                    'content@workspace': {
                        templateUrl: 'app/containers/workspace/analysis/analysis.html',
                        controller: 'AnalysisCtrl'
                    },
                    'footer@workspace': {
                        templateUrl: 'app/components/footer/footer.html',
                        controller: 'FooterCtrl'
                    }
                }
            });
    });
