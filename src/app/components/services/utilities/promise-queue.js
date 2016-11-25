'use strict'

/**
 * @memberof transmartBaseUi
 * @ngdoc factory
 * @name PromiseQueue
 * @description PromiseQueue that can be used to execute promises sequentially,
 * where the next promise is only executed when the previous resolves.
 */
angular.module('transmartBaseUi')
    .factory('PromiseQueue', [function () {

        var PromiseQueue = function() {
            // The queue storing the functions returning the promises
            var queue = [];

            /**
             * Adds another promise to the queue.
             * @param promiseCreator function that returns the promise to execute
             */
            this.addPromiseCreator = function(promiseCreator) {
                queue.push(promiseCreator);
            };

            /**
             * Executes the promises in the queue.
             * @returns {Number|*}
             */
            this.execute = function() {
                var that = this;

                // If the queue has remaining items...
                return queue.length &&
                    // Remove the first promise from the array
                    // and execute it
                    queue.shift()()
                    // When that promise resolves, fire the next
                    // promise in our queue
                    .then(function () {
                        return that.execute();
                    });
            }
        }

        return PromiseQueue;
    }]);
