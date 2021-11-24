import { Message, MessageEmbed } from "discord.js";
import { dcmodule } from "../../module";
import { tp } from "../../tp";
import asagi from "./piston/asagi";

export const m = new class caliskan extends dcmodule
{
    private cache: { [key: string]: Message } = {};
    private runtimes: { language: string, version: string, aliases: string[] }[] = []
    protected piston: any = asagi({ server: "https://emkc.org" });
    constructor() { 
        super(caliskan.name);
        (async () => {
            this.runtimes = await this.piston.runtimes();
        })().catch(this.log.error.bind(this));
    }
    public async on_update(old: Message, newM: Message)
    {
        const cached = this.cache[old.id];
        if (undefined === cached)
            return;
        
        const result = await this.piston_asagi(newM);
        if (undefined === result) {
            return;
        }
        const reply = await cached.edit(result);
        this.cache[old.id] = reply;
    }
    public async on_message(message: Message)
    {
        const result = await this.piston_asagi(message);
        if (undefined === result) {
            return;
        }
        const reply = await message.reply(result);
        this.cache[message.id] = reply;
    }
    private async piston_asagi(message: Message): Promise<undefined | {content?: string, embeds?: [MessageEmbed]}>
    {
        const regex = /\s?(\w+)\s?```(?:\w+\n)?(.*)```/s;
        if (!this.is_prefixed(message)
         || !this.is_word(message, caliskan.name))
            return;

        const match = this.is_regex(message, regex);
        if (null === match)
            return;

        let lang = this.runtimes.find(x => x.language === match[1])
        if (undefined === lang) {
            lang = this.runtimes.find(x => x.aliases.includes(match[1]));
            if (undefined === lang) {
                return {content: "Bilinmeyen veya desteklenmeyen dil: `"+match[1]+"`"};
            }
        }
        
        const st = (s: string): string => {
            s = s?.toString();
            return "`"+(!s
                ? "-"
                : s.length === 0
                    ? "-"
                    : s.toString())+"`";
        }
        try {
            const result = await this.piston.execute(lang.language, match[2]);
                return {content: " ", embeds: [new MessageEmbed()
                .addField("language", st(result?.language), true)
                .addField("version", st(result?.version), true)
                .addField("return code", st(result?.run?.code), true)
                .setDescription("```ts\n"+(result?.run?.output ?? JSON.stringify(result))+"```")
                .setImage(result?.run?.code === 0
                    ? tp.gifs.risitas_matrix_duel
                    : tp.gifs.yoda_much_learn)
                ]};
        }
        catch (error) {

            return {content: `İstek başarısız oldu. ${error}`};
        }
    }
}();