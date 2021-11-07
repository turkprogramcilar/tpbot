import { mod_command } from "../../../command.mod";

export const c = new class custody extends mod_command
{
    public constructor()
    {
        super(custody.name, "`" );
    }
}();