'use strict';

/**
  -----------------------------------------------------------------------------
  - Parameters
  -----------------------------------------------------------------------------
  cohort:
    Array of subjects
      Subjects are formatted as:
        {
          id: ...
          ...
          labels: [
            label1: value,
            label2: value
          ]
        }
  headers:
    Array of grid headers corresponding to the subject labels.
      Headers are formatted as:
        {
          name: ...
          ...
          label: "label1"
        }

*/

angular.module('transmartBaseUi')
  .directive('cohortGrid', function () {
    return {
        restrict: 'E',
        templateUrl: 'app/components/cohort-grid/cohort-grid.tpl.html',
        scope: {
          cohort: '=',
          headers: '='
        },
        /**
        Controller : Used for defining a proper API to the directive.
        Using controller, directives can communicate and share data each other.

          -Set the data required to other directives.
          -Never access DOM element inside the controller;
          it’s against Angular’s philosophy and make testing hard.
        */
        controller: function( $scope, $element, $attrs, $transclude ) {
          $scope.getConceptValue = function (label) {
              return function (subject) {return subject.labels[label];};
          }

          $scope.getCsvFormatted = function(){
            var formatted = [];
            $scope.cohort.forEach(function(subject){
              var cleanSubject = {};
              cleanSubject.id = subject.id;
              $scope.headers.forEach(function(label){
                cleanSubject[label.name] = subject.labels[label.label];
              })
              formatted.push(cleanSubject);
            })
            if(formatted.length > 0)
              $scope.csvHeaders = Object.keys(formatted[0]);
            else $scope.csvHeaders = [];
            return formatted;
          }

          $scope.displayedCollection = [].concat($scope.cohort);
        },

        /**
          Compile : Use for template DOM manipulation
          (i.e., manipulation of tElement = template element), hence
          manipulations that apply to all DOM clones of the template associated
          with the directive.
        */
        compile: function compile( tElement, tAttributes, transcludeFn ) {

            return this.link;
        },
        /**
          Post link : This is the most commonly used for data binding

            -Safe to attach event handlers to the DOM element
            -All children directives are linked, so it’s safe to access them
            -Never set any data required by the child directive here.
            -Because child directive’s will be linked already.
        */
        link: function( scope, element, attributes, controller, transcludeFn ) {

        }

    };
});
