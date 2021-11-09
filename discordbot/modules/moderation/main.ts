import { Message, TextChannel } from "discord.js";
import { commander } from "../../commander";
import { dcmodule } from "../../module";
export const m = new class moderation extends commander {

    private saved_topics: string[] | null = null;
    private saved_rules: string[][] | null = null;
    constructor() { super(moderation.name, false); }

    public async on_message(msg: Message) 
    {
        if (!this.is_prefixed(msg))
            return;

        for (const prefixed_command of [this.kural, this.softban]) {
            if (this.is_word(msg, prefixed_command.name)) {
                await prefixed_command.bind(this)(msg);
                break;
            }
        }
    }
    private async softban(msg: Message)
    {
        const id = this.get_word(msg);
        if (id === null || isNaN(Number(id)))
            return;
        
        const user = await msg.guild?.members.fetch(id.toString());
        if (!user) {
            this.log.error("Can't fetch user");
            return;
        }
        await user.roles.add(dcmodule.role_id_gozalti);
        setTimeout(async () => {
            await user.roles.remove(dcmodule.role_id_gozalti);
        }, 2*60*1000);
    }
    private async kural(msg: Message)
    {
        const result: RegExpMatchArray | null = 
            this.is_regex(msg, /(\d+)(?:\.|\s+)(\d+)/)

        if (!msg.channel.isText()
         || result == null) 
            return;
        

        const topic_index = Number(result[1]) - 1;
        const rule_index = Number(result[2]) - 1;

        if (null === this.saved_rules
            || null === this.saved_topics) {

            const channel = await msg.guild?.channels
                .fetch(dcmodule.channel_id.bir_bak_buraya);

            if (undefined === channel
            || null === channel
            || !channel.isText()) {

                this.log.error("bir_bak_buraya channel can't be fetched");
                return;
            }
            const rules_id = "867482274370945054";
            const message = await channel.messages.fetch(rules_id);
            if (undefined === message
            || null === message) {

                this.log.error("rules message can't be fetched");
                return;
            }

            this.saved_topics = [...message.content.matchAll(
                /\*\*([\w\s]+)\*\*/g)].map(x => x[1]);
                
            const topic_rules = message.content.matchAll(
                /```diff\s([-#!\w\düğıçşöÜĞİÇŞÖ\-\.\;\"\?\,\s]+)+```/g);
            this.saved_rules = [...topic_rules].map(x => {

                const rules = [...x[1].matchAll(
                    /([-#!]\s[\w\düğıçşöÜĞİÇŞÖ\-\.\;\"\?\, ]+)\s+/g)];

                return rules.map(x => x[1]);
            });
        }
        const topic = this.saved_topics[topic_index];
        const rule = (this.saved_rules[topic_index] ?? [])[rule_index];
        if (undefined === topic
            || undefined === rule) {

            await this.warn(msg, "Geçersiz başlık veya kural numarası");
        }
        else {
            await msg.reply(`**${topic}**`+"```diff\n"+rule+"```");
        }
    }
}();