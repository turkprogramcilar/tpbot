/*******************************************************************72*/
import { expect } from "chai";
import { Helper } from "../tpbot/v2/Helper";
import { Print } from "../tpbot/v2/Print";
import { Summoner } from "../tpbot/v2/Summoner";

describe("Summoner", () => 
{
/*******************************************************************72*/

it("Loads module in a thread and returns a representative minion class");
it("Does not crash when minion module is crashed");
it("updates minion name when minion requests it to do so", async () =>
{
    // This test acts as a summoner
    const log = new Print("Test");
    const summoner = new Summoner(log);
    const minionNameOld = "imp";
    const masterName = "master";
    const minion = summoner.summon("./../../tpbot.tests/Summoner.imp", minionNameOld, masterName, log.error.bind(log), null);
    
    expect(minion.name).to.equal(minionNameOld);

    // wait until we receive the risen signal event from minion
    await minion.awaken();

    await Helper.sleep(100);

    expect(minion.name).to.not.equal(minionNameOld);
});
/*******************************************************************72*/
});