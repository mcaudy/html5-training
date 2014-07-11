describe("Block verifier test suite", function() {
	var verifier = require("../block-verifier");

 	it("verifies the genesis data block", function() {
    	expect(verifier.verifyDataBlockFile("./data/genesis_block.json")).toBe(true);
  	});

  	it("verifies a valid data block", function()	{
  		expect(verifier.verifyDataBlockFile("./data/block.json")).toBe(true);
  	});

  	it("fails to verify an invalid data block", function()	{
  		expect(verifier.verifyDataBlockFile("./data/invalid_block.json")).toBe(false);
  	});
});