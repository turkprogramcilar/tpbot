import { mod_command } from "../../../command.mod";

export const c = new class softban extends mod_command
{
    public constructor()
    {
        super(softban.name);
    }
}();