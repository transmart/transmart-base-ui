'use strict'

describe('UtilityService unit tests', function () {

    beforeEach(function () {
        module('transmartBaseUi');
    });

    var utilityService;

    beforeEach(inject(function(_UtilityService_) {
        utilityService = _UtilityService_;
    }));

    describe('guid', function () {

        it('should generate unique string', function () {
            var uid = utilityService.guid();
            var numOfDashes = uid.split('-').length - 1;
            expect(numOfDashes).toBe(4);
            var numOfChars = uid.length;
            expect(numOfChars).toBe(36);

            var uid1 = utilityService.guid();
            expect(uid).not.toEqual(uid1);
        });
    });

    describe('isFiniteNumber', function () {

        it('should recognize a finite number', function () {
            var n = 10;
            var is = utilityService.isFiniteNumber(n);
            expect(is).toBe(true);
            n = Infinity;
            is = utilityService.isFiniteNumber(n);
            expect(is).toBe(false);
            n = -Infinity;
            is = utilityService.isFiniteNumber(n);
            expect(is).toBe(false);
        });

        it('should recognize a non-number', function () {
            var n = {};
            var is = utilityService.isFiniteNumber(n);
            expect(is).toBe(false);
            n = "";
            is = utilityService.isFiniteNumber(n);
            expect(is).toBe(false);
            n = NaN;
            is = utilityService.isFiniteNumber(n);
            expect(is).toBe(false);
            n = true;
            is = utilityService.isFiniteNumber(n);
            expect(is).toBe(false);
        });
    });

});
