'use strict';

angular.module('transmartBaseUi').filter('cutstring', function () {
  return function (value, wordwise, max, tail) {
    if (!value) {return '';}

    max = parseInt(max, 10);
    if (!max) {
      return value;
    }
    if (value.length <= max) { return value; }

    value = value.substr(0, max);


    if (wordwise) {
      var lastSpace = value.lastIndexOf(' ');
      if (lastSpace !== -1) {
        value = value.substr(0, lastSpace);
      }
    }

    return value + (tail || ' …');
  };
});
