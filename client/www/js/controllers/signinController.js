angular.module('amblr.signin', [])
.controller('signinCtrl', function($scope, $ionicModal, $http, $location, $ionicPopup, $rootScope, ENV) {
  // Form data for the signin modal
  $scope.signinData = {};

  // Create the signin modal that we will use later
  $ionicModal.fromTemplateUrl('../../templates/signin.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.userID = null;

  $scope.getUserID = function() {
    $http.get(ENV.apiEndpoint + '/checkuserid')
    .success(function(data) {
      $rootScope.userID = data;
    })
    .error(function(data) {
      console.log('error: ' + data);
    });
  };

  // Triggered in the signin modal to close it
  $scope.closeSignin = function() {
    $scope.modal.hide();
  };
  // Open the signin modal
  $scope.signin = function() {
    $scope.modal.show();
  };

  $scope.showAlert = function() {
    $ionicPopup.alert({
      title: 'Error',
      template: 'Oops! There was a problem with your sign in form. Please try again.'
    });
  };

  // Perform the signin action when the user submits the signin form
  $scope.doSignin = function() {
    console.log('Doing signin with username: ', $scope.signinData.username);
    if(!$scope.signinData.password) {
      $ionicPopup.alert({
        title: 'Error',
        template: 'You gotta put in a password, man.'
      })
    } else {
      
      $http({
        method: 'POST',
        url: ENV.apiEndpoint + '/api/users/signin',
        data: $scope.signinData
      })
      .then(function(res) {
        $scope.closeSignin();
        if (res.status === 200) { 
          $scope.getUserID();
          $location.path('/menu/home');
        } 
      }, function(err) {
        $scope.showAlert(); // if sign in is not successful, show alert message
        console.log('Error during signin with username: ', $scope.signinData.username);  
        console.dir(err);
        return err;
      });
    }

  };
});
