import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandData, ApplicationCommandPermissionData } from 'discord.js';
import { command_module, command_user_state, known_interactions } from "../module";


export abstract class command implements command_module {

    public readonly data: SlashCommandBuilder;

    public constructor(command_name: string, description: string, public readonly permissions: ApplicationCommandPermissionData[] | undefined = undefined) {
        
        this.data = new SlashCommandBuilder().setName(command_name).setDescription(description);
        if (permissions)
            this.data = this.data.setDefaultPermission(true);
    }

    public abstract execute(interaction : known_interactions, state: command_user_state): Promise<command_user_state | null>
}