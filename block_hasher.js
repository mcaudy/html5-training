var crypto = require('crypto');

var hashFunc = function(hexString)	{
	var shasum = crypto.createHash('sha256');

	var data = new Buffer(hexString, 'hex');
	shasum.update(data);
	return shasum.digest('hex');
}

var doubleHashFunc = function(data)	{
	var digest = hashFunc(data);
	return hashFunc(digest);
}

var convertEndian = function(string)	{
	var result = "";
	for (var i = 0; i < string.length; i = i+2)	{
		var subString = string.charAt(i);
		subString += string.charAt(i + 1);
		result = subString + result;
	}

	return result;
}

var padString = function(string)	{
	var result = string;
	if (result.length < 8)	{
		var diff = 8 - result.length;
		for (var i = 0; i < diff; ++i)	{
			result = '0' + result;
		}
	}
	return result;
}

var block = require('./genesis_block.json');

var littleEndianPrevious = convertEndian(block.prev_block);
console.log("Previous block: " + littleEndianPrevious);

var littleEndianMrklRoot = convertEndian(block.mrkl_root);
console.log("Mrkl_root: " + littleEndianMrklRoot);

var littleEndianVersion = convertEndian(padString(block.ver.toString(16)));
console.log("Version: " + littleEndianVersion);

var littleEndianTime = convertEndian(block.time.toString(16));
console.log("Time: " + littleEndianTime);

var littleEndianBits = convertEndian(padString(block.bits.toString(16)));
console.log("Bits: " + littleEndianBits);

var littleEndianNonce = convertEndian(padString(block.nonce.toString(16)));
console.log("Nonce:" + littleEndianNonce);

var headerString = littleEndianVersion + littleEndianPrevious + littleEndianMrklRoot + littleEndianTime + littleEndianBits + littleEndianNonce;
var hash = doubleHashFunc(headerString);
console.log("Resultant hash:");
console.log(convertEndian(hash));


