'use strict';

angular.module('transmartBaseUi').factory('SummaryStatsService', ['DcChartsService', '$q',
  function (DcChartsService, $q) {

  var service = {
    charts: [],
    cross: {},
    dims: {},
    groups: {}
  };

  service.displaySummaryStatistics = function(study, magicConcepts){
    var _deferred = $q.defer();

    study.one('subjects').get().then(function (d) {
      var sub = d._embedded.subjects;
      service.cross = crossfilter(sub);
      magicConcepts.forEach(function(concept){
        service.dims[concept] = service.cross.dimension(function(d){
          return d[concept];});
        service.groups[concept] = service.dims[concept].group();

        if (typeof sub[0][concept] === 'string' ||
          typeof sub[0][concept] === 'object') {
          service.charts.push(DcChartsService.getPieChart(service.dims[concept], service.groups[concept],
            '#summary-chart-' + concept, {size: 75, nolegend: true}));
        } else if (typeof sub[0][concept] === 'number') {
          var max = service.dims[concept].top(1)[0][concept];
          var min = service.dims[concept].bottom(1)[0][concept];
          service.charts.push(DcChartsService.getBarChart(service.dims[concept], service.groups[concept],
            '#summary-chart-' + concept, {
            nodeTitle: '',
            min: min-5,
            max: max+5,
            width: 600,
            height: 100,
            btmMarg: 5
          }));
        }
      });
      DcChartsService.renderAll(service.charts);
      _deferred.resolve();
    }, function (err) {
      _deferred.reject('Cannot get data from the end-point.' + err);
    });
    return _deferred.promise;
  };
  return service;
}]);
