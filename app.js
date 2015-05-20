var pelicanApp = angular.module('pelicanApp',[]);

pelicanApp.controller('PelicanController', ['$scope', function($scope) {

  $scope.greeting = 'Hola!';
  
}]);