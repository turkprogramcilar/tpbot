import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandData, ApplicationCommandPermissionData, User } from 'discord.js';
import { log, user_info } from '../log';
import { command_module, command_user_state, known_interactions } from "../module";


export abstract class command implements command_module {

    protected log: log;

    public readonly data: SlashCommandBuilder;

    public constructor(command_name: string, description: string, public readonly permissions: ApplicationCommandPermissionData[] | undefined = undefined) {
        
        this.data = new SlashCommandBuilder().setName(command_name).setDescription(description);
        if (permissions)
            this.data = this.data.setDefaultPermission(true);

        this.log = new log(command_name);
    }


    protected async is_in_range_otherwise_report_failure<T extends object>(value : number, enum_t : T, value_name : string, enum_name : string, interaction : known_interactions) : Promise<boolean> {
        const casted_enum = Object.keys(enum_t) as (keyof T)[];
        if (typeof casted_enum[value] === 'undefined') {
            await this.respond_interaction_failure_to_user_and_log(`${value_name}[${value}] is out of range in ${enum_name} enum range`, interaction);
            return false;
        }
        return true;
    }
    protected async respond_interaction_failure_to_user(interaction : known_interactions) {
        try {
            await interaction.reply({ content: 'Komut işlenirken hata oluştu. Lütfen bir süre sonra tekrar deneyin. Hatanın devam etmesi durumunda lütfen yetkililer ile iletişime geçin. Teşekkürler!', ephemeral: true });
        }
        catch (error) {
            console.warn("respond failure to user failed with error: "+error)
        }
    }
    protected async respond_interaction_failure_to_user_and_log(msg : string, interaction : known_interactions) {

        this.log.error(msg, this.get_user_info(interaction.user));
        return this.respond_interaction_failure_to_user(interaction);
    }
    protected get_user_info(user : User) : user_info {
        return {
            id: user.id,
            name: user.username,
        };
    }

    public abstract execute(interaction : known_interactions, state: command_user_state): Promise<command_user_state | null>
}