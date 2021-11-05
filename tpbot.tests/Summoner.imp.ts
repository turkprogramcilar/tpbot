import { MinionFile } from "../tpbot/v2/MinionFile";

// tslint:disable-next-line: no-unused-expression
new class Imp extends MinionFile
{
    public constructor()
    {
        super("Imp");

        (async () => {
            await this.synchronize();
            // ping update event
            this.toSummoner("updateMinionName", "A new name");
        })().catch(e => this.log.exception(e));
    }
}()