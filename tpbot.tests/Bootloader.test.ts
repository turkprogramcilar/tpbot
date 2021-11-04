import { fail } from "assert";

describe("Bootloader", () => {

    it("has legacy support features");

    it("loads the kernel");

    it("won't load when TPBOT env var is undefined", () => {
        
        delete process.env.TPBOT;// = undefined;
        try 
        {
            require("../tpbot/v2/Bootloader");
            fail("no error is thrown");
        }
        catch (error) {

        }
            
    })

    it("parses JSON and puts it in launch settings")
});