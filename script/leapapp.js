/********************************************************************************************************/
/************************************* HAND TO HAND FUNCTIONS **********************************/
/********************************************************************************************************/

var handToHand = function() {

	// THIS FUNCTION CALCULATE THE ANGLE BETWEEN 2 VECTORS
	var _vectorAngle = function(v1,v2) {

		// FIRST VECTOR COMPONENTS
		var v1_x = v1[0];
		var v1_y = v1[1];
		var v1_z = v1[2];

		// SECOND VECTOR COMPONENTS
		var v2_x = v2[0];
		var v2_y = v2[1];
		var v2_z = v2[2];

		// DOT PRODUCT
		var dotProduct = v1_x*v2_x + v1_y*v2_y + v1_z*v2_z;

		// BOTH VECTOR'S MODULUS (MAGNITUDE) 
		var v1_magnitude = Math.sqrt(v1_x*v1_x+v1_y*v1_y+v1_z*v1_z);
		var v2_magnitude = Math.sqrt(v2_x*v2_x+v2_y*v2_y+v2_z*v2_z);

		// RETRIEVE THE ANGLE (IN RADIANS) BETWEEN THE 2 VECTORS
		var angle_radians = Math.acos(dotProduct / (v1_magnitude*v2_magnitude));

		// RADIANS TO DEGREES CONVERSION
		return angle_radians * 180 / Math.PI;
	};

	// THIS FUNCTION VERIFY THE VALIDITY OF THE ID-SERVOS OBJECT
	var _checkIdsToServos = function(fingers, idsToServos) {

		// SET THE RESULT ON TRUE
		var check = true;

		// FOR EACH FINGER
		for( var j = 0; j < fingers.length; j++ ){

	        // CURRENT FINGER
	        var finger = fingers[j];

	        // CURRENT FINGER ID
	        var finger_id = finger.id;

	        // IF THIS FINGER ID IS NOT PRESENT INSIDE THE ID-SERVO OBJECT THEN SET THE RESULT ON FALSE
	        if(typeof idsToServos[finger_id] === "undefined"){
	        	check = false;
	        	break;
	        }
    	}

    	return check;
	};


	// THIS FUNCTION RENEW THE ID-SERVOS OBJECT
	var _refreshIdsToServos = function(fingers) {

		var servosArray = new Array();
			servosArray[0] = 'pollice'; // THUMB
			servosArray[1] = 'indice'; // INDEX
			servosArray[2] = 'medio'; // MIDDLE
			servosArray[3] = 'anulare'; // ANNULAR
			servosArray[4] = 'mignolo'; // PINKIE

		var idsToStabilizedX = {};
		var idsToServos = {};
		var sortable = [];

		// FOR EACH FINGER
		for( var j = 0; j < fingers.length; j++ ){

	        // CURRENT FINGER
	        var finger = fingers[j];

	        // CURRENT FINGER ID
	        var finger_id = finger.id;

	        // CURRENT FINGER X COORDINATE
	        var finger_stabilized_x_position = finger.stabilizedTipPosition[0].toFixed(0);

	        // IT IS IMPORTANT TO USE AN OBJECT AND NOT AN ARRAY HERE EVEN IF IT COMPLICATES THE SORTING PROCESS
	        // BECAUSE FINGERS ID CAN ASSUME VERY HIGH VALUES AND USING AN ARRAY MAY PRODUCE EMPTY INDEXES GENERETING BIG AND USELESS ARRAY
	        idsToStabilizedX[finger_id] = finger_stabilized_x_position;

    	}

    	// IN ORDER TO SORT THE OBJECT WE FIRST ASSIGN AN ARRAY WITH ALL OBJECT'S VALUES AND THEN WE SORT THE ARRAY
		for (var id_finger in idsToStabilizedX)
			sortable.push([id_finger, idsToStabilizedX[id_finger]]);
			
		// SORT THE ARRAY
		sortable.sort(function(a, b) {return a[1] - b[1]});

		// NOW WE CAN TAKE THE ID-X_COORDINATES SORTED ARRAY AND WE GENERATE THE ID-SERVOS OBJECT
		for (var i = 0; i < sortable.length; i++) {

			// CURRENT FINGER
			var this_finger_id = sortable[i][0];

			// CURRENT FINGER SERVO
			var this_finger_servo = servosArray[i];

			// UPDATE ID-SERVOS OBJECT
			idsToServos[this_finger_id] = this_finger_servo;

			// DEBUG
			console.log('COUNTER: '+i+', SERVO NAME: '+this_finger_servo+', FINGER ID: '+this_finger_id+', X_COORDINATE: '+sortable[i][1]);
		};

		return idsToServos;
    	
	};

	// THIS FUNCTION CLOSE ALL NOT DETECTED FINGERS
	var _closeAbsentFingers = function(fingers, idsToServos, servoFinger){

		// BUFFER
		var idsToServosBuffer = {};

		// LET'S CLONE A ID-SERVO DUPLICATE
		for (var key in idsToServos) {

			// SERVO NAME
			var nome_servo = idsToServos[key];

			// FINGER ID
			var id_leap = key;

			// BUFFER OBJECT
			idsToServosBuffer[id_leap] = nome_servo;

        }

        // NOW WE CAN REMOVE ALL DETECTED FINGERS (SO THAT ONLY NOT DETECTED FINGERS WILL REMAIN)
		for( var j = 0; j < fingers.length; j++ ){

			// CURRENT FINGER
			var finger = fingers[j];

        	// CURRENT FINGER ID
        	var finger_id = finger.id;

        	// REMOVE DETECTED FINGERS
        	delete idsToServosBuffer[finger_id];
      		
		}

		// FOR EACH NOT DETECTED FINGER
		for (var key in idsToServosBuffer) {

			// SERVO NAME
			var nome_servo = idsToServosBuffer[key];

			// FINGER ID
			var id_leap = key;

			// LET'S CLOSE THIS FINGER BECAUSE IT WASN'T DETECTED
			_fingerClose(servoFinger, nome_servo);

			// console.log('ID: '+id_leap+', SERVO: '+nome_servo);

        }

	}

	// MAKE A FIST
	var _punch = function(servoFinger){
		servoFinger['mignolo'].max();
		servoFinger['anulare'].max();
		servoFinger['medio'].max();

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		servoFinger['indice'].max();
		servoFinger['pollice'].max();
	}

	// RELAX THE HAND
	var _relax = function(servoFinger){
		servoFinger['mignolo'].min();
		servoFinger['anulare'].min();
		servoFinger['medio'].min();

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		servoFinger['indice'].min();
		servoFinger['pollice'].min();
	}

	// CLOSE A SINGLE FINGER
	var _fingerClose = function(servoFinger, selectedFinger){

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		if(selectedFinger == 'pollice' || selectedFinger == 'indice')
			servoFinger[selectedFinger].max();
		else
			servoFinger[selectedFinger].max();
	}

	// OPEN A SINGLE FINGER
	var _fingerOpen = function(servoFinger, selectedFinger){

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		if(selectedFinger == 'pollice' || selectedFinger == 'indice')
			servoFinger[selectedFinger].min();
		else
			servoFinger[selectedFinger].min();
	}

	// MOVE A SINGLE FINGER
	var _moveFingerTo = function(servoFinger, fingerAngle, servo, oldServoAngles, servoSensibility) {

		// REMEMBER THAT THUMB AND INDEX FINGERS HAVE THEIR SERVOS INVERTED ON THE ARM!
		if(servo == 'pollice' || servo == 'indice')
			var servoAngle = (20+(100-fingerAngle)*1.5); // EMPIRICAL CONVERSION, MAY BE DIFFERENT FOR DIFFERENT SERVOS!
        else
          	var servoAngle = (20+(100-fingerAngle)*1.5);  // EMPIRICAL CONVERSION, MAY BE DIFFERENT FOR DIFFERENT SERVOS!

      	// WE MUST BE SURE NOT TO GIVE SERVOS AN ANGLE OUT OF ITS RANGE
		if(servoAngle < 60)
			servoAngle = 0;
		else if (servoAngle > 100)
		  	servoAngle = 170;

		// SOME DEBUG
	  	console.log("THE FINGER "+servo+" IS SET TO: "+fingerAngle+'°');
		console.log("THE FINGER "+servo+" IS MOVING TO: "+servoAngle+'°');

		// NOW IF A PREVIOUS SERVO POSITION IS STORED, WE MUST CALCULATE THE DIFFERENCE
		// BETWEEND THE NEW ANGLE AND THE OLD ONE
		// AND MOVE THE SERVO ONLY IF THE SENSIBILITY THRESHOLD IS EXCEEDED
		if(oldServoAngles[servo] > 0){

			// DIFFERENCE
			var anglesDelta = Math.abs(parseInt(servoAngle)-parseInt(oldServoAngles[servo]));

			// DEBUG
			//console.log("ANGLES DIFFERENCE (DELTA): "+anglesDelta+'°');

			// IF THE DIFFERENCE EXCEED SENSIBILITY THRESHOLD THEN WE MOVE THE SERVO
			if(anglesDelta > servoSensibility[servo]){
				oldServoAngles[servo] = servoAngle;
				servoFinger[servo].to(servoAngle);
			}

		// IF THERE ISN'T AN OLD ANGLE STORED WE JUST MOVE THE SERVO
		} else {
			oldServoAngles[servo] = servoAngle;
			servoFinger[servo].to(servoAngle);
		}

	}

	return {
		vectorAngle: 		_vectorAngle,
		checkIdsToServos: 	_checkIdsToServos,
		punch: 				_punch,
		relax: 				_relax,
		fingerClose: 		_fingerClose,
		fingerOpen: 		_fingerOpen,
		refreshIdsToServos: _refreshIdsToServos,
		closeAbsentFingers: _closeAbsentFingers,
		moveFingerTo: 		_moveFingerTo
	};
};

module.exports = handToHand;



/********************************************************************************************************/
/************************************* BEGIN APP CODE****************************************************/
/********************************************************************************************************/



// IMPORT NEEDED MODULES AND SCRIPTS
var five = require("johnny-five"),
	//handToHand = require('../lib/handToHand'),
	Leap = require("../lib/index"),
	board, servo;

// ASSIGN ARDUINO BOARD
board = new five.Board();

// ASSIGN SERVOS SENSIBILITY (THIS IS THE ANGLES THRESHOLD)
servoSensibility = {'pollice': 0, 'indice': 0, 'medio': 0, 'anulare': 0, 'mignolo': 0};


// ASSIGN LEAP MOTION CONTROLLER
var controller = new Leap.Controller()

// THIS OBJECT CONTAINS ID-SERVOS ASSOCIATIONS
var idsToServos = {};

// THIS OBJECT CONTAINS DI-X_COORDINATES
var idsToStabilizedX = {};

// THIS OBJECT CONTAINS LATEST SERVOS ANGLES
var oldServoAngles = {};

// THIS ARRAY CONTAINS ALL SERVOS
var servoFinger = new Array();

// ASSIGN THIS VARIABLE TO ALL USEFUL FUNCTIONS LOADED WITH /lib/handToHand
handToHand = new handToHand();

/********************************************************************************************************/
/************************************* ARDUINO AND SERVOS RELATED PART **********************************/
/********************************************************************************************************/

board.on("ready", function() {

	// DEFINING ALL SERVOS CONNECTED TO ARDUINO PWM PORTS

	// PINKIE
	servoFinger['mignolo'] = new five.Servo({
		pin: 3, // Servo 1
		range: [0, 150], // Default: 0-180
		type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
		startAt: 30, // if you would like the servo to immediately move to a degree
		center: false // overrides startAt if true and moves the servo to the center of the range
	});

	// ANNULAR
	servoFinger['anulare'] = new five.Servo({
		pin: 5, // Servo 3
		range: [0, 180], // Default: 0-180
		type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
		startAt: 30, // if you would like the servo to immediately move to a degree
		center: false // overrides startAt if true and moves the servo to the center of the range
	});

	// MIDDLE FINGER
	servoFinger['medio'] = new five.Servo({
		pin: 6, // Servo 5
		range: [0, 180], // Default: 0-180
		type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
		startAt: 30, // if you would like the servo to immediately move to a degree
		center: false // overrides startAt if true and moves the servo to the center of the range
	});

	// THUMB
	servoFinger['pollice'] = new five.Servo({
		pin: 9, // Servo 2
		range: [0, 180], // Default: 0-180
		type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
		startAt: 30, // if you would like the servo to immediately move to a degree
		center: false // overrides startAt if true and moves the servo to the center of the range
	});

	// INDEX FINGER
	servoFinger['indice'] = new five.Servo({
		pin: 10, // Servo 4
		range: [0, 180], // Default: 0-180
		type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
		startAt: 30, // if you would like the servo to immediately move to a degree
		center: false // overrides startAt if true and moves the servo to the center of the range
	});



	// RETRIEVE LEAP MOTION FRAMES
	controller.on("frame", function(frame) {

		 // NUMBER OF DETECTED HANDS BY LEAP MOTION 
	    var nHands = frame.hands.length;

	    // IF THERE IS JUST 1 HAND
	    if(nHands == 1){

	    	// RETRIEVE THE HAND OBJECT
  			var hand = frame.hands[0];

  			// RETRIEVE FINGER OBJECT
  			var finger_obj = hand.fingers;

  			// FIND THE NUMBER OF DETECTED FINGERS
  			detectedFingers = finger_obj.length;

  			// IF THERE ARE SOME DETECTED FINGERS
  			if(detectedFingers > 0){

  				// IF THE ID-SERVOS OBJECT IS NOT VALID WE MUST RENEW IT
  				if(handToHand.checkIdsToServos(finger_obj, idsToServos) == false){

  					// TO RENEW THE OBJECT WE NEED A FULL OPENED HAND
  					if(detectedFingers == 5){

  						// FIRST WE CLEAN THE OBJECT
						delete idsToServos;
						idsToServos = {};

						// THEN WE RENEW IT
						idsToServos = handToHand.refreshIdsToServos(finger_obj);

						/* JUST SOME DEBUG
						for (var key in idsToServos) {

				          var nome_servo = idsToServos[key];
				          var id_leap = key;

				          console.log('ID: '+id_leap+', SERVO: '+nome_servo);

				        }
				        */

					} else
						console.log("Place your open hand to recalibrate the device!");

				// ELSE IF THE OBJECT IS VALID WE CAN PROCEED
  				} else {

  					// IF SOME FINGERS WERE NOT DETECTED THEN WE MUST SEARCH AND CLOSE THEM
					if(detectedFingers < 5){
						
						// FIND AND CLOSE ABSENT FINGERS
						handToHand.closeAbsentFingers(finger_obj, idsToServos, servoFinger);

					}

					// NOW FOR EACH DETECTED FINGER
					for( var j = 0; j < detectedFingers; j++ ){

						// ASSIGN THIS FINGER
						var this_finger = finger_obj[j];

			        	// RETRIEVE FINGER ID ASSIGNED BY LEAP MOTION
			        	var this_finger_id = this_finger.id;

			        	// RETRIEVE RELATED SERVO
			        	var servo = idsToServos[this_finger_id];

			        	// CALCULATING THE ANGLE BETWEEN THE PALM NORMAL AND FINGER DIRECTION
			        	var fingerAngle = handToHand.vectorAngle(hand.palmNormal, this_finger.direction).toFixed(0);

			        	// LET'S MOVE THE SERVO IF THE SENSIBILITY THRESHOLD IS EXCEEDED
			      		handToHand.moveFingerTo(servoFinger, fingerAngle, servo, oldServoAngles, servoSensibility);
			      		
					}

  				}

  			} else {

  				// MAKE A FIST
  				handToHand.punch(servoFinger);

  				// CLEAN THE ID-SERVOS OBJECT
				delete idsToServos;
				idsToServos = {};
  			}


	    } else {

	    	// RELAX THE HAND AND SHOW THE ALERT
	    	handToHand.relax(servoFinger);
	    	console.log("Please, place one hand...");
	    }
	    	

	});


}); // BOARD READY CLOSE


/*********************************************************************************************************/
/******************************** LEAP MOTION STATUS AND INITIALIZATION **********************************/
/*********************************************************************************************************/

controller.on('ready', function() {
    console.log("Leap Motion is ready...");
});

controller.on('deviceConnected', function() {
    console.log("Leap Motion is connected...");
});

controller.on('deviceDisconnected', function() {
    console.log("Leap Motion is disconnected...");
});

// CONNECT TO THE LEAP MOTION
controller.connect();


