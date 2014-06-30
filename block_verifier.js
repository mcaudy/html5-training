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
		var subString = string.substring(i, i + 2);
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

var verifyDataBlock = function(blockFilePath)	{
	var block = require(blockFilePath);

	var littleEndianPrevious = convertEndian(block.prev_block);
	console.log("Previous block (little endian): " + littleEndianPrevious);

	var littleEndianMrklRoot = convertEndian(block.mrkl_root);
	console.log("Mrkl_root (little endian): " + littleEndianMrklRoot);

	var littleEndianVersion = convertEndian(padString(block.ver.toString(16)));
	console.log("Version (little endian): " + littleEndianVersion);

	var littleEndianTime = convertEndian(block.time.toString(16));
	console.log("Time (little endian): " + littleEndianTime);

	var littleEndianBits = convertEndian(padString(block.bits.toString(16)));
	console.log("Bits (little endian): " + littleEndianBits);

	var littleEndianNonce = convertEndian(padString(block.nonce.toString(16)));
	console.log("Nonce (little endian):" + littleEndianNonce);

	var headerString = littleEndianVersion + littleEndianPrevious + littleEndianMrklRoot + littleEndianTime + littleEndianBits + littleEndianNonce;
	var calculatedHash = convertEndian(doubleHashFunc(headerString));
	console.log("Calculated hash (big endian):");
	console.log(calculatedHash);

	return calculatedHash === block.hash;
}

module.exports.verifyDataBlock = verifyDataBlock;