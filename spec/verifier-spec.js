describe("Block verifier test suite", function() {
	var verifier = require("../block_verifier");

 	it("verifies the genesis data block", function() {
    	expect(verifier.verifyDataBlock("./data/genesis_block.json")).toBe(true);
  	});

  	it("verifies a valid data block", function()	{
  		expect(verifier.verifyDataBlock("./data/block.json")).toBe(true);
  	});

  	it("fails to verify an invalid data block", function()	{
  		expect(verifier.verifyDataBlock("./data/invalid_block.json")).toBe(false);
  	});
});