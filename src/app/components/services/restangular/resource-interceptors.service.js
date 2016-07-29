'use strict';

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name ResourceInterceptors
 */
angular.module('transmartBaseUi')
    .factory('ResourceInterceptors', ['AlertService', function (AlertService) {

        var service = {};

        /**
         * Custom Response Interceptor
         * @param data
         * @param operation
         * @param what
         * @returns {*}
         */
        service.customResponseInterceptor = function (data, operation, what) {

            var _getLastToken = function (what) {
                var _t = what.split('/').slice(1);
                return what.indexOf('/') === -1 ? what : _t[_t.length - 1];
            };

            if (operation === 'getList' && what !== 'studies') {
                var _what, resp = data;
                if (what === 'concepts') {
                    what = 'ontology_terms';
                    resp = data._embedded[what];
                } else {
                    _what = _getLastToken(what);
                    resp = data._embedded[_what];
                }
                return resp;
            }

            return data;
        };

        /**
         * Custom Error Interceptor
         * @param response
         * @param deferred
         * @param responseHandler
         * @returns {boolean}
         */
        service.customErrorInterceptor = function(response, deferred, responseHandler) {

            if (response.status === 401) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': Unauthorized request.');
            }

            if (response.status === 404) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': The resource that you are trying to access was moved or does not exist.');
            }

            if (response.status === 403) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': Forbidden request.');
            }

            if (response.status === 500) {
                AlertService.add('danger', 'HTTP ' + response.status
                    + ': Internal server error.');
            }

            return true; // error not handled
        };

        return service;
    }]);
