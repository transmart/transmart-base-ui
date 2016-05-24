'use strict';

angular.module('transmartBaseUi')
.directive('studyAccordion', function() {
  return {
    restrict: 'E',
    scope: {
      studies: '=studies',
      title: '=title',
      saction: '&studyAction',
      studyShown: '='
    },
    templateUrl: 'app/components/study-accordion/study-accordion.tpl.html'
  };
});
