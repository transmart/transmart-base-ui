'use strict';

angular.module('transmartBaseUi')
.directive('studyAccordion', function() {
  return {
    restrict: 'E',
    scope: {
      studies: '=accStudies',
      title: '=accTitle',
      saction: '&studyAction',
      naction: '&nodeAction'

    },
    templateUrl: 'app/components/study-accordion/study-accordion.tpl.html'
  };
});
