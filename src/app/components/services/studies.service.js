angular.module('transmartBaseUi').factory('StudyListService', [function() {

    var studyList = {
      list : []
    };

    studyList.addStudy = function (study, type) {
        study.type = type;
        if (!_.findWhere(studyList.list, {'id':study.id, 'type': type})) {
          studyList.list.push(study);
        }
    };

    studyList.findStudy = function (studyId) {
      return _.findWhere(studyList.list, {id:studyId});
    };
    //
    // studyList.getPublicStudies = function () {
    //     return _.findWhere(studyList.list, {'type':'public'});
    // };
    //
    // studyList.getPrivateStudies = function () {
    //     return _.findWhere(studyList.list, {'type':'private'});
    // };

    return studyList;
}]);
