/**
 * Created by bo on 5/23/16.
 */
'use strict';

angular.module('transmartBaseUi').factory('isURL', function () {

  return function (s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
  }

});

