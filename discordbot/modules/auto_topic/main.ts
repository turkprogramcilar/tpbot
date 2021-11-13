import { Message, MessageReaction, PartialUser, Presence, TextChannel, ThreadChannel, User } from "discord.js";
import { URL } from "url";
import { dcmodule } from "../../module";

export const m = new class auto_topic extends dcmodule {
    
    constructor() { super(auto_topic.name, false, false); }
    
    public async on_message(msg : Message) {

        if (!(msg.channel instanceof TextChannel))
            return;

        
        if (120 !== msg.channel.rateLimitPerUser)
            return;

        let thread: ThreadChannel;
        try {
            thread = await msg.startThread({name: "Yorumlar 👉", autoArchiveDuration: 1440});
        }
        catch (error) {
            if (!msg.thread) {
                this.log.error("Can't fetch thread after start thread failed");
                return;
            }
            thread = msg.thread;
        }
        
        const get_url = (x: string) => {
            try {
                return new URL(x);
            }
            catch {
                return undefined;
            }
        };

        for (const word of msg.content.split(" ")) {
            
            const url = get_url(word);
            if (url && url.hostname === "github.com") {
                url.hostname = "github1s.com";
                await thread.send("_Açık kaynak kodlu paylaşımınız için teşekkürler!"
                    + ` Arkadaşımınızın paylaşımını ayrıyetten tarayıcınız`
                    + ` içerisinde vscode uygulaması açıp hemen gözatmak için tıklayınız:_ `
                    + url.toString())
                break;
            }
        }
    }
}();