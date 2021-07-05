import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule, module_user_state, user_state_value } from "../module";


interface arena_player {
    inside : boolean,
    health : number,
    armor  : number,
    basedmg: number,
    lasthit: string,
    target : string | undefined
};

const this_dcmodule = class arena extends dcmodule {
    
    constructor() { super(arena.name, true); }
    
    public async after_init(){}
    public async on_message(msg : Message) {

         // assign message to the parser
        this.set_msg(msg);

        const channel_id = this.get_module_state("channel_id");
        if (channel_id != undefined && channel_id != msg.channel.id) return;

        // if not a command, return
        if (!this.is_prefixed()) return;

        if (this.is_word("gir")) {

            const time = new Date().getUTCMilliseconds() - 60*1000;
            this.set_arena_player_author({
                health : 10000,
                armor  : 100,
                basedmg: 100,
                target : undefined,
                lasthit: time.toString(),
                inside : true,
            });
            return;
        }
        
        const inside = this.get_module_state_author_value("inside");
        if (inside == undefined || inside == false)
            return await this.warn("Arena alanında değilsiniz.");

            
        const switch_taken = await this.switch_word([
        // switch_word begin, alignment has down shifted by 1 tab //
        
        ["cik", () => {
            return this.set_arena_player_author_value(state => state.inside = false);
        }],
        ["hedef", async () => {
            const mention_id = this.get_mention();
            if (mention_id == null)
                return await this.warn("Hedef olarak birisini etiketleyiniz.");

            if (false && mention_id == this.get_author_id())
                return await this.warn("Kendinden nefret etmene gerek yok artık. Kodlamaya hemen başla ve hayatını kurtar.");

            if (!this.locate_arena_player(mention_id))
                return await this.warn("Hedef arena alanı içerisinde değil.");
            
            return this.set_arena_player_author_value(state => state.target = mention_id);
        }],
        ["vur", async () => {
            const self = this.get_arena_player_author();
            const target_id = this.get_module_state_author_value("target") as string;
            if (target_id == undefined)
                return await this.warn("Önce hedef belirlemeniz gerekiyor.");

            const target = this.locate_arena_player(target_id);
            if (!target || target.inside == false)
                return await this.warn("Hedef arena alanı içerisinde değil.");

            if (target.health <= 0) {
                target.health = 0;
                target.inside = false;
                return this.set_arena_player_user(target_id, target);
            }

        }],
        // switch_word end //
        ]);
        if (switch_taken) return;



        if (this.is_word("toggle")) {
            /*let times : number = this.get_module_state_author()?.times as number ?? 0;
            const p1 = await this.warn("pong" + (times == 0 ? "" : times == 1 ? " (1st time)" : times == 2 ? " (2nd time)" : ` (${times}th time)`));
            const p2 = this.set_module_state_author({"times": ++times});
            await p1; await p2;*/
            let times : boolean = this.get_module_state_author_value("toggle") as boolean ?? false;
            const p1 = await this.warn(`toggle: ${times}`);
            times = !times;
            const p2 = this.set_module_state_author_value("toggle", times);
            await p1; await p2;
        }
        
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) { }
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) { }

    private get_arena_player_author() : arena_player {
        return this.get_module_state_author() as unknown as arena_player;
    }
    private get_arena_player(user_id : string) : arena_player {
        return this.get_module_state_user(user_id) as unknown as arena_player;
    }
    private set_arena_player_author(author_state : arena_player) {
        return this.set_arena_player_user(this.get_author_id(), author_state);
    }
    private set_arena_player_user(user_id : string, user_state : arena_player) {

        const update_here_when_interface_changes : arena_player = {
            health: 0, armor: 0, target: "", lasthit: "", basedmg: 0, inside: false,
        }
        return this.set_module_state_user(user_id, {
            "health": user_state.health,
            "armor": user_state.armor,
            "basedmg": user_state.basedmg,
            "lasthit": user_state.lasthit,
            "target": user_state.target,
            "inside": user_state.inside
        });
    }
    private set_arena_player_author_value(modifier : (state : arena_player) => void) {
        
        const author = this.get_arena_player_author();
        modifier(author);
        return this.set_arena_player_author(author);
    }

    private locate_arena_player(id : string) : arena_player | undefined {
        const all_users = this.get_module_state_users();
        if (!Object.keys(all_users).includes(id))
            return undefined;
        else
            return all_users[id] as unknown as arena_player;
    }
}

const this_instance = new this_dcmodule();
export async function on_event(evt: string, args: any) { return this_instance.on_event(evt, args); }
export async function init(refState: any) { return this_instance.init(refState); }