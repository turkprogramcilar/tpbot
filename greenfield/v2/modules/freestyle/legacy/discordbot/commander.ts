import { Routes } from 'discord-api-types/v9';
import { ApplicationCommandPermissionData, ButtonInteraction, Client, CommandInteraction, ContextMenuInteraction, Interaction, SelectMenuInteraction } from "discord.js";
import { dcmodule } from "./module";
import { REST } from "@discordjs/rest";
import { SlashCommandBuilder } from '@discordjs/builders';
import { command } from './command';
import { log } from './log';
import { tp } from './tp';

const tools = require("./tools");


export type first_interactions = CommandInteraction | ContextMenuInteraction
export type second_interactions = ButtonInteraction | SelectMenuInteraction
export type known_interactions = CommandInteraction | ButtonInteraction | SelectMenuInteraction | ContextMenuInteraction
export interface command_user_state {
    command_id : string,
    state : number,
    reset: boolean,
}

type user_id = string;
type command_id = string;
type command_name = string;



export class commander extends dcmodule
{
    protected commands: {[key: string]: command} = {};
    private command_states : { [key: user_id] : command_user_state } = {};

    static async register_commands(commands: {[key: string]: command}[], client: Client): Promise<[command_name, command_id][]> {
        const print = new log("MODERN_STATIC_REGISTER_COMMANDS");
        print.verbose("COMMANDS", commands);

        const id = client.user?.id;
        const token = client.token;
        if (!id || !token) {
            throw new Error("can't register commands. id or token is null");
        }

        const tpid = tp.guild_id_tp
        const rest = new REST({ version: '9' }).setToken(token);

        const flatten = commands.reduce((a, c) => a={...a,...c} , {});
        print.verbose("FLATTEN", flatten);
        const jsonbody = Object.values(flatten).map(x => x.data.toJSON());
        print.verbose("FLATTEN", jsonbody);
        const response = await rest.put(
            Routes.applicationGuildCommands(id, tpid),
            { body: jsonbody },
        );
        print.verbose("RESPONSE", response);

        const res_arr = response as any[];
        if (!response || !res_arr) {
            throw Error("invalid response");
        }

        if (Object.keys(flatten).length != res_arr.length) {
            throw Error("response doesn't match with command length we sent.");
        }

        const tasks : Promise<void>[] = res_arr.map(async json => {
            const _command_id : string = json.id;
            const name : string = json.name;
            const _command = flatten[name];
            if (!_command) {
                console.error(`json response with command name ${name} is not found on our side.`);
                return;
            }
            print.verbose("command.permissions", _command.permissions);
            // check if command has defined an permissions for its commands
            if (_command.permissions) {

                if (!client.application?.owner) await client.application?.fetch();

                const app_command = await client.guilds.cache.get(tp.guild_id_tp)?.commands.fetch(_command_id);
                if (!app_command) throw Error ("Can't fetch application command");
                
                await app_command.permissions.set({
                    permissions: _command.permissions
                });
            }
            print.verbose("permission exit");
        });
        await Promise.all(tasks);

        return res_arr.map(x => [x.name, x.id]);
    }

    public get_commands(): {[key: string]: command} | undefined {
        // load commands
        if (this.state.command_support !== true)
            return undefined;
        
        try {
            const root = __dirname+`/modules/${this.module_name}/commands/`;
            const commands_folder_files : string[] = tools.get_files_sync(root);
            const command_files = commands_folder_files.filter(file => file.endsWith('.js'));

            for (const file of command_files) {
                const _command: command = require(root+file.substring(0, file.length-3)).c;
                _command.set_client(this.get_client());
                _command.prefix = this.state.prefix ?? _command.prefix;
                // Set a new item in the Collection
                // With the key as the command name and the value as the exported module
                this.commands[_command.data.name] = _command;
                this.log.info("Require/Loading command file: "+file);
            }
            this.log.verbose("GET_COMMANDS BODY END FOR MODULE: "+this.module_name);
        }
        catch (error) {
            this.log.error(error);
            throw Error("Can't get_commands in modern.ts body");
        }
        this.log.verbose("RETURNING SAFELY FROM GET_COMMANDS FOR MODULE: "+this.module_name);
        return this.commands;
    }
    public set_command_ids(name_id_pairs: [command_name, command_id][]): void {

        this.log.verbose("SET_COMMAND_IDS BEFORE FOR "+this.module_name,this.commands);
        const switch_to_ids: {[key: command_id]: command} = {};
        for (const [name, id] of name_id_pairs) {

            const command: command | undefined = this.commands[name];
            if (command !== undefined) {

                switch_to_ids[id] = command;
            }
        }
        this.commands = switch_to_ids;
        this.log.verbose("SET_COMMAND_IDS AFTER FOR "+this.module_name,this.commands);
    }

        
    static is_first_interaction(obj: Interaction): obj is first_interactions { return (obj as first_interactions).commandId !== undefined; }
    static is_second_interaction(obj: Interaction): obj is second_interactions { return (obj as second_interactions).customId !== undefined; }

    /*** EVENT OVERRIDES ***/
    protected async on_interaction_create(interaction : Interaction) {

        this.log.verbose("ON_INTERACTION CALLED FOR MODERN "+this.module_name);
        // just to be safe if accidentally called from older modules
        if (this.state.command_support !== true) {
            this.log.warn("called from module that's command_support !== true");
            return;
        }

        // process commands
        const user_id = interaction.user.id;
        const user_info = command.get_user_info(interaction.user);

        let state: command_user_state;
        let _command: command | undefined;

        if (commander.is_first_interaction(interaction)) {

            const id: command_id = interaction.commandId;
            const module: command | undefined = this.commands[id];
            if (undefined === module) {
                // its not in our command scope
                return;
            }
            _command = module;

            // if user already started a command, dont start another one
            state = this.command_states[user_id] 
            if (state) {
                if (state.reset == true) {
                    delete this.command_states[user_id];
                    return await interaction.reply({content: "`Komut süreci sıfırlandı. Komutu artık baştan tekrar başlatabilirsiniz.`", ephemeral: true });
                }
                else {
                    state.reset = true;
                    return await interaction.reply({content: "Lütfen önceden çalıştırdığınız komutu tamamlayınız."
                        +"\nEğer komutu yeniden başlatmak istiyorsanız bir sefer daha aynı komutu çalıştırınız."
                        +"\n**Dikkat! Tüm süreciniz sıfırlanacaktır**", ephemeral: true });
                }
                
            }

            // if user_id exists already, it will be overridden with state = 0
            // so that it pushes user to the first stage of the command
            state = this.command_states[user_id] = {
                command_id: id,
                state: 0,
                reset: false,
            }
        }
        else if (commander.is_second_interaction(interaction)) {
            
            // assuming button is always triggered from a command
            state = this.command_states[user_id];

            if (undefined === state) {
                // its not in our scope
                return;
            }
            
            const id = state.command_id;
            const module = this.commands[id];
            if (undefined === module) {
                this.log.warn(`command id[${id}] is not found in commands when interacting with button or select menu`, user_info)
                return;
            }
            _command = module;
            
            state = this.command_states[user_id];
        }
        else {

            this.log.error("An interaction neither button, select menu nor command is received", user_info)
            return;
        }

        try {
            const operation = await _command.execute(interaction, state);
            if (operation.is_complete()) 
                delete this.command_states[user_id];

        } catch (error) {
            this.log.error(error, user_info);
            delete this.command_states[user_id];
            await command.respond_interaction_failure_to_user(interaction);
        }
    }
}