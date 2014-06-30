var crypto = require('crypto');

var hashFunc = function(data)	{
	var shasum = crypto.createHash('sha256');
	shasum.update(data);
	return shasum.digest('hex');
}

var doubleHashFunc = function(data)	{
	var digest = hashFunc(data);
	return hashFunc(digest);
}

console.log(doubleHashFunc('Hello world'));