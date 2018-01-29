var app = angular.module("myTestApp", ["ngRoute"]);


app.controller('myTestController',[ '$scope', '$http', function($scope, $http) {
  var arry = [1,2,3,4,5,6]
  $scope.videosSet = _.shuffle(arry);
  $scope.selectedVideos = []
  var socket = io.connect();
  socket.emit('start');
  $scope.answerObj = {}
  for(var i = 1; i <= 30; i++) {
    $scope.answerObj[i] = {
      'startTime': [],
      'leaveTime': [],
      'isSelected': false
    }
  }

  $scope.startPlayer = function(ind){
    angular.element(document).find('#'+ind).get(0).play()
    $scope.answerObj[ind]['startTime'].push((new Date()).getTime())
  };

 $scope.pausePlayer = function(ind){
   angular.element(document).find('#'+ind).get(0).pause()
   $scope.answerObj[ind]['leaveTime'].push((new Date()).getTime())
 }

 $scope.select = function(ind) {
   var elem = angular.element(document).find('#'+ind)
   if (elem.hasClass('selected')) elem.removeClass('selected')
   else elem.addClass('selected')
   $scope.answerObj[ind]['isSelected'] = !$scope.answerObj[ind]['isSelected']
 }

 $scope.submit = function(){
   socket.emit('results', $scope.answerObj);
   $scope.thankyouPage = !$scope.thankyouPage

 }

 socket.on('uniqueID', function(msg) {
   $scope.uniqueID = msg
   $scope.$apply();
 })

}])
