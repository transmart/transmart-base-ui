'use strict';

angular.module('transmartBaseUi').factory('ProtobufService', [function(){
  var service = {};

  //Load proto file 
  var _builder = dcodeIO.ProtoBuf.loadProtoFile("/app/components/protobuf/highdim.proto");

  return service;
}]);
