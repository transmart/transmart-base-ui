'use strict';

angular.module('transmartBaseUi')
.directive('studyAccordion', function() {
  return {
    restrict: 'E',
    scope: {
      studies: '=accStudies',
      title: '=accTitle',
      action: '=accAction'
    },
    templateUrl: "/app/main/sidebar/study.accordion.html"
  };
});
