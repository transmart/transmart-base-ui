'use strict';

angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('help', {
                parent: 'site',
                url: '/help',
                views: {
                    '@': {
                        templateUrl: 'app/containers/help/help.html'
                    },
                    'navbar@help': {
                        templateUrl: 'app/components/navbar/navbar.html',
                        controller: 'NavbarCtrl'
//                        controllerAs: 'hnc'
                    },
                    'content@help': {
                        templateUrl: 'app/containers/help/help.content.html'
                    },
                    'footer@help': {
                        templateUrl: 'app/components/footer/footer.html',
                        controller: 'FooterCtrl'
//                        controllerAs: 'ctf'
                    }

                }
            });
    });
