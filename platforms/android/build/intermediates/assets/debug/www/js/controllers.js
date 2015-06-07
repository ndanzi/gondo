angular.module('gondoApp.controllers',[])
.controller('HomeCtrl',['$scope','Points', '$ionicLoading', '$compile', '$rootScope', 'BGgeolocation',
	function($scope,Points,$ionicLoading, $compile, $rootScope, BGgeolocation){


      function initialize() {
        navigator.geolocation.getCurrentPosition(function(pos) {

          $scope.loading = $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner>',
          });

          var myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        
          $scope.user = $rootScope.user;

          Points.getAll().success(function(data){
            $scope.points=data.results; 
          }).then(
            function() {
              $scope.destinations = [];
              for(var i = 0; i < $scope.points.length; i++) {
                $scope.destinations.push(new google.maps.LatLng($scope.points[i].loc.latitude, $scope.points[i].loc.longitude));
              }
            }


          ).then(
            function() {
              var service = new google.maps.DistanceMatrixService();

              service.getDistanceMatrix(
                {
                  origins: [myLatlng],
                  destinations: $scope.destinations,
                  travelMode: google.maps.TravelMode.WALKING,
                  unitSystem: google.maps.UnitSystem.METRIC,
                  avoidHighways: false,
                  avoidTolls: false
                }, callback);

            }
          ).then(function() {
	      	$ionicLoading.hide();
	      });

          function callback(response, status) {
            if (status != google.maps.DistanceMatrixStatus.OK) {
              alert('Error was: ' + status);
            } else {
              var results = response.rows[0].elements;
              console.log(response);
              $scope.$apply(function() {
              for(var i = 0; i < results.length; i++) {
                  $scope.points[i].dist = results[i].distance.text;
                  $scope.points[i].time = results[i].duration.text;
                }
              });
            }
          }


          
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
        
      }

      ionic.Platform.ready(initialize);

      $scope.tourstartstop = 'Inizia il Tour';
      $scope.tourOn = false;
      
      $scope.toggleTour = function() {
      	if(!$scope.tourOn) {
      		BGgeolocation.start();
      		$scope.tourstartstop = 'Termina il Tour';
      		$scope.tourOn = true;
      	} else {
      		BGgeolocation.stop();
      		$scope.tourstartstop = 'Inizia il Tour';
      		$scope.tourOn = false;
      	}
      	
      };


}])
.controller('MapCtrl',['$scope','Points', '$ionicLoading', '$compile', '$rootScope', 'User', 'Auth',
	function($scope,Points,$ionicLoading, $compile, $rootScope, User, Auth){


      function initialize() {
        navigator.geolocation.getCurrentPosition(function(pos) {

          $scope.loading = $ionicLoading.show({
            template: '<ion-spinner icon="android"></ion-spinner>',
          });

          var myLatlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        
          var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById("map"),
              mapOptions);
          
          var contentString = "<div>Tu sei qui</div>";
          var compiled = $compile(contentString)($scope);

          var infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });

          var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Qui'
          });

          $rootScope.me = marker;

          Points.getAll().success(function(data){
            $scope.points=data.results; 
          }).then(
            function() {
              $scope.destinations = [];
              for(var i = 0; i < $scope.points.length; i++) {
                $scope.destinations.push(new google.maps.LatLng($scope.points[i].loc.latitude, $scope.points[i].loc.longitude));
                $scope.points[i].marker = new google.maps.Marker({
                  position: $scope.destinations[i],
                  map: map,
                  title: $scope.points[i].nome
                });

              }
            }


          ).then(
            function() {
              var service = new google.maps.DistanceMatrixService();

              service.getDistanceMatrix(
                {
                  origins: [myLatlng],
                  destinations: $scope.destinations,
                  travelMode: google.maps.TravelMode.WALKING,
                  unitSystem: google.maps.UnitSystem.METRIC,
                  avoidHighways: false,
                  avoidTolls: false
                }, callback);

            }
          ).then(function() {
	      	$ionicLoading.hide();
	      });

          function callback(response, status) {
            if (status != google.maps.DistanceMatrixStatus.OK) {
              alert('Error was: ' + status);
            } else {
              var results = response.rows[0].elements;
              console.log(response);
              $scope.$apply(function() {
              for(var i = 0; i < results.length; i++) {
                  $scope.points[i].dist = results[i].distance.text;
                  $scope.points[i].time = results[i].duration.text;
                }
              });
            }
          }

          google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
          });

          $rootScope.map = map;


          $ionicLoading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
        
      }
      ionic.Platform.ready(initialize);


	  $scope.$on('new_position', function(event, args) {
	  	console.log('got new position!');
      	if($rootScope.locationMarker && !$rootScope.locationMarker.getMap()) {
      		$rootScope.locationMarker.setMap($rootScope.map);
      		console.log('set map to locationMarker');
      	}
      	if($rootScope.pathLine && !$rootScope.pathLine.getMap()) {
      		$rootScope.pathLine.setMap($rootScope.map);
      		console.log('set map to pathLine');
      	}

      	if($rootScope.locations) {
      		for(var i = 0; i < $rootScope.locations.length; i++) {
      			if(!$rootScope.locations[i].getMap()) {
	      			$rootScope.locations[i].setMap($rootScope.map);
	      			console.log('set map to location '+i);
      			}
      		}
      	}
	  });
      
      $scope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

      };
      
      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
      };

}])
.controller('loginCtrl', ['$scope', '$ionicModal', '$state', '$ionicLoading', '$rootScope', '$firebaseAuth', 'currentAuth', '$cordovaOauth', 'facebook',
	function($scope, $ionicModal, $state, $ionicLoading, $rootScope, $firebaseAuth, currentAuth, $cordovaOauth, facebook) {

	var ref = new Firebase('https://gondodb.firebaseio.com/');
    var auth = $firebaseAuth(ref);

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('templates/signup.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });  

	$scope.signIn = function (user) {

        if (user && user.email && user.password) {
            $ionicLoading.show({
                template: '<ion-spinner icon="android"></ion-spinner>'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.password
            }).then(function (authData) {
                //console.log("Logged in as:" + authData.uid);
                $ionicLoading.hide();
                //$state.go('tabs.home');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    };
    $scope.createAccount = function() {
    	$scope.modal.show()
    };

    $scope.signUp = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.nome && user.cognome) {
            $ionicLoading.show({
                template: '<ion-spinner icon="android"></ion-spinner>'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    nome: user.nome,
                    cognome: user.cognome
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signUpGoogle = function() {
		auth.$authWithOAuthPopup("google", function(error, authData) {
			$ionicLoading.show({
	            template: '<ion-spinner icon="android"></ion-spinner>'
	        });
			if (error) {
				console.log("Login Failed!", error);
			} else {
				
			}
		},
		{scope: 'email'})
    }

    $scope.loginFacebook = function() {

    	var permissions = ['email', 'public_profile', 'user_friends'];
	    facebook.login(permissions, function(response) {
	    	console.log(response);
	    	auth.$authWithOAuthToken("facebook", response.authResponse.accessToken).then(function(authData) {
                    console.log("Logged in as:", authData.uid);
                }).catch(function(error) {
                    console.error("Firebase Authentication failed:", error);
                });
	    }, function(response) {

	    });
	};
}])

.controller('TabsCtrl', ['$scope', '$ionicSideMenuDelegate', '$firebaseAuth', '$state', '$rootScope', 'User', '$firebaseObject',
function($scope, $ionicSideMenuDelegate, $firebaseAuth, $state, $rootScope, User, $firebaseObject) {
  var ref = new Firebase('https://gondodb.firebaseio.com/');
  var auth = $firebaseAuth(ref);


  $scope.logout = function() {
  	auth.$unauth();
  	$state.go('login');
  }

  $scope.openMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  }
  
}]);