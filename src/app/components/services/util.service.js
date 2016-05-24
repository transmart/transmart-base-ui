/**
 * Created by bo on 5/23/16.
 */

'use strict';

angular.module('transmartBaseUi').factory('UtilService', function () {

    var service = {};

    service.isURL = function (s) {
      var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      return regexp.test(s);
    }

    return service;

});

