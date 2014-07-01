var verifier = require("./block_verifier");

var assertEquals = function(expected, observed)	{
	if (expected === observed)	{
		console.log("Test Pass");
	}
	else	{
		console.log("Test Fail");
	}
	console.log();
}

assertEquals(true, verifier.verifyDataBlock("./data/block.json"));
assertEquals(true, verifier.verifyDataBlock("./data/genesis_block.json"));
assertEquals(false, verifier.verifyDataBlock("./data/invalid_block.json"));