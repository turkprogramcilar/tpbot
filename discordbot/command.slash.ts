import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandPermissionData, User } from 'discord.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import { command } from './command';
import { dcmodule } from './module';

export abstract class slash_command extends command
{
    public data: SlashCommandBuilder;

    public constructor(command_name: string, description: string, public readonly permissions: ApplicationCommandPermissionData[] | undefined = undefined, everyone: boolean = false)
    {
        super(command_name);
        
        this.data = new SlashCommandBuilder()
            .setName(this.command_name)
            .setDescription(description)
            ;
        const DEBUG = process.env.DCBOT_DEBUG;
        if (DEBUG !== undefined) {
            this.data = this.data.setDefaultPermission(false);
            this.permissions = [
                { id: dcmodule.role_id_kidemli,  type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
                { id: dcmodule.role_id_kurucu,   type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
            ];
        }
        else if (permissions)
            this.data = this.data.setDefaultPermission(everyone);
    }
}