import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandData, ApplicationCommandPermissionData, User } from 'discord.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import { log, user_info } from './log';
import { command_module, known_interactions, command_user_state, dcmodule } from './module';


export abstract class command implements command_module {

    protected log: log;

    public readonly data: SlashCommandBuilder;

    public constructor(command_name: string, description: string, public readonly permissions: ApplicationCommandPermissionData[] | undefined = undefined) {
        
        const DEBUG = process.env.DCBOT_DEBUG;
        if (DEBUG !== undefined) {
            command_name = "debug_"+command_name;
        }
        this.data = new SlashCommandBuilder().setName(command_name).setDescription(description);
        if (DEBUG !== undefined) {
            this.data = this.data.setDefaultPermission(false);
            this.permissions = [
                { id: dcmodule.role_id_kidemli,  type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
                { id: dcmodule.role_id_kurucu,   type: ApplicationCommandPermissionTypes.ROLE, permission: true, },
            ];
        }
        else if (permissions)
            this.data = this.data.setDefaultPermission(true);

        this.log = new log(command_name);
    }
    protected is_in_range<T extends object>(enum_t: T, value: number) {
        const casted_enum = Object.keys(enum_t) as (keyof T)[];
        return typeof casted_enum[value] !== undefined;
    }

    protected async enum_error(value : number, value_name : string, enum_name : string, interaction : known_interactions) {
        await this.log_and_reply_user(`${value_name}[${value}] is out of range in ${enum_name} enum range`, interaction);
    }
    protected async log_and_reply_user(msg : string, interaction : known_interactions) 
    {
        this.log.error(msg, command.get_user_info(interaction.user));
        await command.respond_interaction_failure_to_user(interaction);
    }
    static async respond_interaction_failure_to_user(interaction : known_interactions)
    {
        try {
            await interaction.reply({ content: 'Komut işlenirken hata oluştu. Lütfen bir süre sonra tekrar deneyin. Hatanın devam etmesi durumunda lütfen yetkililer ile iletişime geçin. Teşekkürler!', ephemeral: true });
        }
        catch (error) {
            console.warn("respond failure to user failed with error: "+error)
        }
    }
    static get_user_info(user : User) : user_info
    {
        return {
            id: user.id,
            name: user.username,
        };
    }

    public abstract execute(interaction : known_interactions, state: command_user_state): Promise<command_user_state | null>
}