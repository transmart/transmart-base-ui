'use strict';

angular.module('transmartBaseUi')
    .config(function ($stateProvider) {
        $stateProvider
            .state('home', {
                parent: 'site',
                url: '/',
                views: {
                    '@': {
                        templateUrl: 'app/containers/home/home.html'
                    },
                    'navbar@home': {
                        templateUrl: 'app/components/navbar/navbar.html',
                        controller: 'NavbarCtrl'
                    },
                    'content@home': {
                        templateUrl: 'app/containers/home/home.content.html',
                        controller: 'HomeCtrl'
                    },
                    'footer@home': {
                        templateUrl: 'app/components/footer/footer.html',
                        controller: 'FooterCtrl'
                    }

                }
            });
    });
