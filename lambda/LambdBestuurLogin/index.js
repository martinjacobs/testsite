console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var crypto = require('crypto');
var config = require('./config.json');
AWS.config.update({region:'us-east-1'});

function computeHash(password, salt, fn) {
	// Bytesize
	var len = 128;
	var iterations = 4096;

	if (3 == arguments.length) {
		crypto.pbkdf2(password, salt, iterations, len, function(err, derivedKey) {
			if (err) return fn(err);
			else fn(null, salt, derivedKey.toString('base64'));
		});
	} else {
		fn = salt;
		crypto.randomBytes(len, function(err, salt) {
			if (err) return fn(err);
			salt = salt.toString('base64');
			computeHash(password, salt, fn);
		});
	}
}

function getUser(email, fn) {
	console.log("getuser");
	if (email == config.EMAIL) {
		var hash = config.HASH;
		var salt = config.SALT;
		var verified = true;
		fn(null, hash, salt, verified);
	} else {
		fn(null, null); // User not found
	}
}

function getToken(email, fn) {
	AWS.config.update({"accessKeyId": config.ACCESS_KEY_ID ,"secretAccessKey": config.SECRET_ACCESS_KEY});
	var sts = new AWS.STS();
			sts.getSessionToken({}, function(err, data) {
  			if (err) {
				console.log(err, err.stack); // an error occurred
				fn(err);
			}
  			else     {
				console.log(data);           // successful response
				fn(null, email , data.Credentials['AccessKeyId'], data.Credentials['SecretAccessKey'], data.Credentials['SessionToken']); // successful response
			}
			});
}

exports.handler = function(event, context) {
	var email = event.email;
	console.log('email' + email);
	var clearPassword = event.password;

	getUser(email, function(err, correctHash, salt, verified) {
		if (err) {
			context.fail('Error in getUser: ' + err);
		} else {
			if (correctHash == null) {
				// User not found
				console.log('User not found: ' + email);
				context.succeed({
					login: false
				});
			} else if (!verified) {
				// User not verified
				console.log('User not verified: ' + email);
				context.succeed({
					login: false
				});
			} else {
				console.log('User found and verified: ' + email);
				computeHash(clearPassword, salt, function(err, salt, hash) {
					if (err) {
						context.fail('Error in hash: ' + err);
					} else {
						console.log('correctHash: ' + correctHash + ' hash: ' + hash);
						if (hash == correctHash) {
							// Login ok
							console.log('User logged in: ' + email);
							getToken(email, function(err, identityId, id, secret, token) {
								if (err) {
									context.fail('Error in getToken: ' + err);
								} else {
									context.succeed({
										login: true,
										identityId: identityId,
										access_id: id,
										secret_key: secret,
										token: token
									});
								}
							});
						} else {
							// Login failed
							console.log('User login failed: ' + email);
							context.succeed({
								login: false
							});
						}
					}
				});
			}
		}
	});
}
