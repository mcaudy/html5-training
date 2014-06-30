var verifier = require("./block_verifier");

var testBlock = function(blockFile)	{
	console.log("Testing " + blockFile);
	var result = verifier.verifyDataBlock(blockFile);
	if (result)	{
		console.log("Pass");
	}
	else	{
		console.log("Fail");
	}
}

testBlock("./data/block.json");
testBlock("./data/genesis_block.json");
testBlock("./data/invalid_block.json");