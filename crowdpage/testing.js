var app = angular.module("myTestApp", ["ngRoute"]);


app.controller('myTestController',[ '$scope', '$http', function($scope, $http) {
  var arry = []
  $scope.answerObj = {}
  for (var i = 1; i <= 45; i++) {
     arry.push(i);
     $scope.answerObj[i] = {
       'startTime': [],
       'leaveTime': [],
       'isSelected': false
     }
  }
  $scope.videosSet = _.shuffle(arry);
  $scope.selectedVideos = []
  var socket = io.connect();
  socket.emit('start');

  $scope.startPlayer = function(ind){
    angular.element(document).find('#'+ind).get(0).play()
    if (ind != -1 && ind != -2) {
      console.log('non-example');
      $scope.answerObj[ind]['startTime'].push((new Date()).getTime())
    }
  };

 $scope.pausePlayer = function(ind){
   angular.element(document).find('#'+ind).get(0).pause()
   if (ind != -1 && ind != -2) {
     console.log('non-example');
     $scope.answerObj[ind]['leaveTime'].push((new Date()).getTime())
   }
 }

 $scope.select = function(ind) {
   var elem = angular.element(document).find('#'+ind)
   if (elem.hasClass('selected')) elem.removeClass('selected')
   else elem.addClass('selected')
   if (ind != -1 && ind != -2) {
     console.log('non-example');
     $scope.answerObj[ind]['isSelected'] = !$scope.answerObj[ind]['isSelected']
   }
 }
 $scope.startTask = function() {
   $scope.timeToStartTheTask = (new Date()).getTime()
   $scope.startTheTask = !$scope.startTheTask
 }

 $scope.submit = function(){
   var data = {
     answer: $scope.answerObj,
     startTime: $scope.timeToStartTheTask
   }
   socket.emit('results', data);
   $scope.thankyouPage = !$scope.thankyouPage

 }

 socket.on('uniqueID', function(msg) {
   $scope.uniqueID = msg
   $scope.$apply();
 })

}])
