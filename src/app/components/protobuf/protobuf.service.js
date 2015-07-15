'use strict';

angular.module('transmartBaseUi').factory('ProtobufService', [function(){
  var service = {};

  //Load proto file
  var _builder = dcodeIO.ProtoBuf.loadProtoFile("/app/components/protobuf/highdim.proto");
  _builder = _builder.build('highdim');
  console.log(_builder);

  service.decode = function (buffer) {
    return _builder.Row.decodeDelimited(buffer, 'hex');
  };

  return service;
}]);
