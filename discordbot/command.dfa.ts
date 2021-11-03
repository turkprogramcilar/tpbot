import { ApplicationCommandPermissionData, ButtonInteraction, CommandInteraction, ContextMenuInteraction, SelectMenuInteraction } from "discord.js";
import { command, operation } from "./command";
import { command_user_state, known_interactions } from "./modern";

export type click_interaction = ButtonInteraction | SelectMenuInteraction | ContextMenuInteraction;

export enum status {
    in_progress,
    finished,
}

export abstract class dfa_command<Q extends number> extends command
{
    public constructor(
        private Q_keys: number[],
        private d: {[key in Q]: Q[] },
        private readonly start_q : Q,
        command_name: string, 
        description: string, 
        permissions?: ApplicationCommandPermissionData[],
        everyone: boolean = false)
    {
        super(command_name, description, permissions, everyone);
    }

    public abstract get_choice_index(interaction: click_interaction): Promise<Q | undefined>
    public abstract process_new_state(q_new: Q, q_old: Q, i: Q | null, interaction: known_interactions): Promise<status>

    public get_choice_from_custom_id(custom_id: string) : Q | undefined
    {
        const n = Number(custom_id);
        if (isNaN(n) || n.toString() != custom_id || false === n in this.Q_keys) {
            return undefined;
        }
        return n as Q;
    }

    public async execute(interaction: known_interactions, state: command_user_state): Promise<operation<command_user_state | null>> 
    {
        if (false === state.state in this.Q_keys) {
            this.enum_error(state.state, "state.state", "Q_keys", interaction)
            return operation.complete;
        }

        const old_q = state.state as Q;

        let i: Q | null | undefined;
        let new_q: Q;
        if (interaction instanceof CommandInteraction) {
            i = null;
            new_q = this.start_q;
        }
        else {
            i = await this.get_choice_index(interaction);
            if (i === undefined)
                return operation.complete;

            // check if index is valid for the given state
            if (false === i in this.d[old_q]) {
                this.enum_error(i, "n", "this.d[old_q]", interaction)
                return operation.complete;
            }
            new_q = this.d[old_q][i];
        }
        // transition to next state
        state.state = new_q;

        try {
            return await this.process_new_state(new_q, old_q, i, interaction) == status.in_progress ? operation.on(state) : operation.complete;
        }
        catch (error) {
            this.log.error(error);
            return operation.complete;
        }
    }
}
