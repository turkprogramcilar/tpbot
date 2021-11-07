import { mod_command } from "../../../command.mod";

export const c = new class unban extends mod_command
{
    public constructor()
    {
        super(unban.name);
    }
}();