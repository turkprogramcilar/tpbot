import { MinionFile } from "../greenfield/v2/threading/MinionFile";

// tslint:disable-next-line: no-unused-expression
new class Imp extends MinionFile
{
/*******************************************************************72*/
constructor()
{
    super("Imp");

    (async () => {
        await this.synchronize();
        // ping update event
        this.toSummoner("updateMinionName", "A new name");
    })().catch(e => this.print.exception(e));
}
/*******************************************************************72*/
}()