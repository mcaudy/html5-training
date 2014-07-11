// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');
var verifier = require('./block-verifier');

// Configure app to use bodyParser()
// This will let us get the data from a POST
// We upp the limit of the request body to allow us to send json of very big blocks
app.use(bodyParser({limit: '1mb'}));

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/block-verifier)
router.get('/', function(req, res) {
	res.json({ message: 'Pass a block in json form to the route /block, and this service will tell you whether it is valid.' });	
});

// more routes for our API will happen here
router.route('/block')

	.post(function(req, res) {
		var result = verifier.verifyDataBlock(req.body);
        res.json({ result: result });
	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /block-verifier
app.use('/block-verifier', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Running block verifier on port ' + port);