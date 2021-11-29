import { expect } from "chai";
import { Helper } from "../greenfield/v2/common/Helper";
import { Path } from "../greenfield/v2/common/Path";
import { Summoner } from "../greenfield/v2/threading/Summoner";

describe("Summoner", () => 
{
/*******************************************************************72*/

it("Loads module in a thread and returns a representative minion class");
it("Does not crash when minion module is crashed");
it("updates minion name when minion requests it to do so", async () =>
{
    // This test acts as a summoner
    const summoner = new Summoner("Test");
    const minionNameOld = "imp";
    const masterName = "master";
    const minion = summoner.summon(Path.builtGreenfieldTests("Summoner.imp"),
        minionNameOld, masterName, undefined, summoner.print.error.bind(summoner.print));
    
    expect(minion.name).to.equal(minionNameOld);

    // wait until we receive the risen signal event from minion
    await minion.awaken();

    await Helper.sleep(100);

    expect(minion.name).to.not.equal(minionNameOld);
});
/*******************************************************************72*/
});