'use strict'

describe('CohortSelectionService', function () {
    var CohortSelectionService;

    beforeEach(function () {
        module('transmartBaseUi');
    });

    beforeEach(inject(function (_CohortSelectionService_) {
        CohortSelectionService = _CohortSelectionService_
    }));

    describe('addBox', function () {

        it('should assert that CohortSelectionService.boxes is defined', function () {
            expect(CohortSelectionService.boxes).toBeDefined();
        });

        it('should assert that CohortSelectionService.boxes is an array containing only one boxId', function () {
            CohortSelectionService.addBox();
            expect(CohortSelectionService.boxes.length).toBe(1);
        });

    });

    describe('removeBox', function () {
        var newBoxId;

        beforeEach(function () {
            newBoxId = CohortSelectionService.addBox();
        });

        it('should not remove the box when there is only one left', function () {
            expect(CohortSelectionService.boxes.length).toBe(1);
            CohortSelectionService.removeBox(newBoxId);
            expect(CohortSelectionService.boxes.length).toBe(1);
        });

        it('should remove a box when the number of boxes is larger than one', function () {
            CohortSelectionService.addBox();
            expect(CohortSelectionService.boxes.length).toBe(2);
            CohortSelectionService.removeBox(newBoxId);
            expect(CohortSelectionService.boxes.length).toBe(1);
        });

    });

});
