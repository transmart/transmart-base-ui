'use strict';

/**
 * State configuration definition for 'workspace'
 */
angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('workspace', {
                parent: 'site',
                url: '/workspace',
                // abstract: true, // make this abstract
                // reloadOnSearch: false,
                views: {
                    '@': {
                        templateUrl: 'app/containers/workspace/workspace.html'
                    },
                    'sidebar@workspace': {
                        templateUrl: 'app/components/sidebar/sidebar.html',
                        controller: 'SidebarCtrl',
                        controllerAs: 'vm'
                    },
                    'content@workspace': {
                        templateUrl: 'app/containers/workspace/content/content.html',
                        controller: 'ContentCtrl',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('workspace.view', {
                url: '/view'
            });
    });
