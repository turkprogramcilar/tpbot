import { GuildMember, Message, MessageReaction, PartialUser, Presence, User } from "discord.js";
import { dcmodule, module_user_state, user_state_value } from "../module";


interface arena_player {
    name   : string,
    inside : boolean,
    health : number,
    armor  : number,
    lasthit: number,
    target : string | undefined
    sum_item_damage: number,
    experience : number,
};

const this_dcmodule = class arena extends dcmodule {
    
    constructor() { super(arena.name, true); }
    
    public async after_init(){}
    public async on_message(msg : Message) {

        const channel_id = this.get_module_state("channel_id");
        if (channel_id != undefined && channel_id != msg.channel.id) return;
        
        const max_hp = 1000;
        const inside = this.get_module_state_user_value(msg.author.id, "inside");
        if (this.is_word(msg, "gir")) {

            if (inside)
                return await this.warn(msg, "Zaten arena içerisindesiniz. Önce çıkmanız gerekiyor." + ` [${msg.author.username}]`, true);
            
            const p1 = this.user_stats(msg.author.id);
            const p2 = this.user_exp(msg.author.id);
            const purify : (x : string | number | undefined) => number = (x) => {
                if (typeof x === 'string' || x == undefined || !Number.isSafeInteger(x))
                    return 0;
                else
                    return x;
            };
            
            const user_stats = (await p1) ?? {};
            const experience = (await p2) ?? 0;
            const time = new Date().getTime() - 60*1000;
            this.set_arena_player_user(msg.author.id, {
                name   : msg.author.username,
                health : max_hp,
                armor  : purify(user_stats["Ac"]),
                target : undefined,
                lasthit: time,
                inside : true,
                sum_item_damage: purify(user_stats["Damage"]),
                experience: experience,
            });
            return await this.affirm(msg,`${msg.author.username} arenaya giriş yaptı.`, true);
        }
        
        if (inside == undefined || inside == false)
            return await this.warn(msg, "Arena alanında değilsiniz." + ` [${msg.author.username}]`, true);

            
            const commands : [string, () => void | Promise<void>][] = [
            
            ["cik", async () => {
                const p1 = this.set_arena_player_user_value(msg.author.id, state => state.inside = false);
                const p2 = this.affirm(msg, `${msg.author.username} arenayı terketti.`, true);
                await p1, await p2; return;
            }],
            ["durum", () => {
                
                const self = this.get_arena_player_user(msg.author.id);
                return this.affirm(msg, `${self.name}: [Can: ${self.health}] [Hasar: ${self.sum_item_damage}] [Zırh: ${self.armor}] [Exp katsayı: ${this.experience_multiplier(self.experience).toFixed(2)}]`, true);
            }],
            ["vaziyet", () => {

                const all = this.get_module_state_users();
                const values = Object.values(all);
                let key = "kill";
                values.sort((b, a) => (a[key] as number ?? 0) - (b[key] as number ?? 0));
                const top_kills = values.slice(0, 5).reduce((a, c, i) => a+= `${i+1}. ${c["name"]} (${c[key]})\n`, "");
                key = "death";
                values.sort((b, a) => (a[key] as number ?? 0) - (b[key] as number ?? 0));
                const top_deaths = values.slice(0, 5).reduce((a, c, i) => a+= `${i+1}. ${c["name"]} (${c[key]})\n`, "");

                return this.custom_info(msg, `+ En çok leşi olan arena oyuncuları:\n${top_kills}\n- En çok kez dirilmiş arena oyuncuları:\n${top_deaths}`, "diff", true);
            }],
            ["hedef", async () => {
                const mention_id = this.get_mention(msg);
                if (mention_id == null)
                    return await this.warn(msg, "Hedef olarak birisini etiketleyiniz." + ` [${msg.author.username}]`, true);

                if (mention_id == msg.author.id)
                    return await this.warn(msg, "Kendinden nefret etmene gerek yok artık. Kodlamaya hemen başla ve hayatını kurtar." + ` [${msg.author.username}]`, true);

                const target = this.locate_arena_player(mention_id);
                if (!target || !target.inside)
                    return await this.warn(msg, "Hedef arena alanı içerisinde değil." + ` [${msg.author.username}]`, true);
                
                const p1 = this.affirm(msg, `[${target.name}] oyuncusu hedef alındı (${msg.author.username} tarafından)`, true)
                const p2 = this.set_arena_player_user_value(msg.author.id, state => state.target = mention_id);
                await p1; await p2; return;
            }],
            ["vur", async () => {
                const self = this.get_arena_player_user(msg.author.id);
                const target_id = this.get_module_state_user_value(msg.author.id, "target") as string;
                if (target_id == undefined)
                    return await this.warn(msg, "Önce hedef belirlemeniz gerekiyor." + ` [${msg.author.username}]`, true);

                const target = this.locate_arena_player(target_id);
                if (!target || target.inside == false)
                    return await this.warn(msg, "Hedef arena alanı içerisinde değil." + ` [${msg.author.username}]`, true);

                const now = new Date().getTime();
                const time_diff = (now - self.lasthit)/1000;
                const target_loss = this.calculate_hit(target.armor, self.sum_item_damage, self.experience, time_diff);
                target.health -= target_loss;
                self.lasthit = now;
                
                if (target.health <= 0) {
                    self.target = undefined;
                    target.health = 0;
                    target.inside = false;
                    const p1 = this.custom_info(msg, `[${target.name} oyuncusu mağlup edildi.] (${self.name} tarafından)`, "css", true);
                    const p2 = this.set_arena_player_user(target_id, target);
                    const p3 = this.set_module_state_user_value(msg.author.id, "kill", (this.get_module_state_user_value(msg.author.id, "kill") as number ?? 0) + 1);
                    const p4 = this.set_module_state_user_value(target_id, "death", (this.get_module_state_user_value(target_id, "death") as number ?? 0) + 1);
                    await p1; await p2; await p3; await p4; return;
                }
                else {
                    return await this.affirm(msg, `[${target.name}] oyuncusuna ${target_loss} hasar verildi. Hedef kalan can: ${target.health}. (${self.name} tarafından)`, true);
                }
            }],
        ];

        if (await this.switch_word(msg, commands)) return;
        
    }
    public async on_reaction(reaction : MessageReaction, user : User | PartialUser) { }
    public async on_presence_update(old_p: Presence | undefined, new_p: Presence) { }

    private get_arena_player_user(user_id : string) : arena_player {
        return this.get_module_state_user(user_id) as unknown as arena_player;
    }
    private set_arena_player_user(user_id : string, user_state : arena_player) {

        const update_here_when_interface_changes : arena_player = {
            health: 0, armor: 0, target: "", lasthit: 0, sum_item_damage: 0, inside: false, experience: 0, name:"",
        }
        return this.set_module_state_user(user_id, {
            "name": user_state.name,
            "health": user_state.health,
            "armor": user_state.armor,
            "sum_item_damage": user_state.sum_item_damage,
            "lasthit": user_state.lasthit,
            "target": user_state.target,
            "inside": user_state.inside,
            "experience": user_state.experience,
        });
    }
    private set_arena_player_user_value(user_id : string, modifier : (state : arena_player) => void) {
        
        const author = this.get_arena_player_user(user_id);
        modifier(author);
        return this.set_arena_player_user(user_id, author);
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