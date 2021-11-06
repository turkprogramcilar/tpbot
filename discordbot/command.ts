import { ContextMenuCommandBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { User } from "discord.js";
import { log, user_info } from "./log";
import { known_interactions, command_user_state } from "./commander";

export class operation<T>
{
    static complete = new operation(null);
    static on<T>(value: T): operation<T>
    {
        return new operation<T>(value);
    }

    public constructor(private value: T) { }
    public is_complete() { return this.value === null; }
    public get_value() { return this.value; }
}
export abstract class command
{
    protected log: log;
    public data: any;
    public permissions: any;

    public constructor(public command_name: string)
    {
		const DEBUG = process.env.DCBOT_DEBUG;
        if (DEBUG !== undefined) {
            this.command_name = "debug_"+this.command_name;
        }
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

    public abstract execute(interaction : known_interactions, state: command_user_state): Promise<operation<command_user_state | null>>
}