'use strict';

/**
 * State configuration definition for 'help'
 */
angular.module('transmartBaseUi')
    .controller('HelpCtrl', HelpCtrl);

function HelpCtrl($scope, gitInfo) {
    var vm = this;
    vm.gitInfo = gitInfo;
}
