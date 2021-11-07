import { ApplicationCommandPermissionTypes } from "discord.js/typings/enums";
import { mod_command } from "../../../command.mod";
import { dcmodule } from "../../../module";

export const c = new class unban extends mod_command
{
    public constructor()
    {
        super(unban.name, [
            { id: dcmodule.role_id_koruyucu, type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
            { id: dcmodule.role_id_kurucu,   type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
        ])
    }
}();