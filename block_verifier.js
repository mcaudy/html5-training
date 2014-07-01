"use strict";

var crypto = require("crypto");

var hashFunc = function(hexString)	{
	var shasum = crypto.createHash("sha256");

	var data = new Buffer(hexString, "hex");
	shasum.update(data);
	return shasum.digest("hex");
};

var doubleHashFunc = function(data)	{
	var digest = hashFunc(data);
	return hashFunc(digest);
};

var convertEndian = function(string)	{
	var result = "";
	for (var i = 0; i < string.length; i = i+2)	{
		var subString = string.substring(i, i + 2);
		result = subString + result;
	}

	return result;
};

var padString = function(string)	{
	var result = string;
	if (result.length < 8)	{
		var diff = 8 - result.length;
		for (var i = 0; i < diff; ++i)	{
			result = "0" + result;
		}
	}
	return result;
};

var calculateBottomRowOfMrklTree = function(mrklTree)	{
	var bottomRow = [];
	var numberOfRows = 1;
	var rowSize = 1;
	var result = 1;
	while (result < mrklTree.length)	{
		rowSize *= 2;
		result += rowSize;
		++numberOfRows;
	}

	var bottomRowSize = rowSize;
	// If our built up tree is larger than the actual tree, we have a node which only has one leaf
	if (result > mrklTree.length)	{
		--bottomRowSize;
	}

	for (var i = 0; i < bottomRowSize; ++i)	{
		bottomRow[i] = mrklTree[i];
	}
	// If we have a node with only one leaf, pad it
	if (bottomRowSize % 2 !== 0)	{
		bottomRow[bottomRow.length] = bottomRow[bottomRow.length - 1];
	}
	return bottomRow;
};

var calculateNextRow = function(currentRow)	{
	var nextRow = [];
	for (var i = 0; i < currentRow.length; i += 2)	{
		var node1Le = convertEndian(currentRow[i]);
		var node2Le = convertEndian(currentRow[i+1]);


		var d1Le = doubleHashFunc(node1Le);
		var d2Le = doubleHashFunc(node2Le);
		// These values aren't currently right. It looks like some kind of endian issue, but I haven't gotten to the bottom of it yet
		nextRow[Math.floor(i/2)] = convertEndian(doubleHashFunc(d1Le + d2Le));
	}
	return nextRow;
};

var calculateMrklRoot = function(mrklTree)	{
	var row = calculateBottomRowOfMrklTree(mrklTree);
	while (row.length > 1)	{
		console.log("Row: " + row);
		row = calculateNextRow(row);
		console.log("Next Row: " + row);
	}
};

// For quick testing, we currently try and calculate the merkle root of our transactions tree if this script is run from Node.
var block = require("./data/block.json");
calculateMrklRoot(block.mrkl_tree);

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

	var result = (calculatedHash === block.hash);
	if (result)	{
		console.log("Valid block");
	}
	else	{
		console.log("Invalid block");
	}

	return result;
};

module.exports.verifyDataBlock = verifyDataBlock;