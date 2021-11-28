import { helper } from "../helper";
import { action, card_no, cards, limit, card, target, damage, trigger, alive_until, from, buff_id } from "./data";
import { status } from "./data.buff";
import { player } from "./player";

export enum game_state {
    unfinished = -1,
    draw = 0,
    win_p1,
    win_p2,
}
export interface round_result {
    played_player: number,
    played_cards: number[],
    flip_results: action[],
    next_player: number,
    game_finished: boolean,
    game_result: game_state,
}
export interface buff {
    immunity?: boolean,
}
const default_round_result: round_result = {
    played_player: 0,
    played_cards: [],
    flip_results: [],
    next_player: 0,
    game_finished: false,
    game_result: game_state.unfinished,
}

export class cardgame {
    static readonly max_health = 100;

    static readonly grouped_by_rarity = helper.get_enum_keys(card_no)
            .reduce((a: number[][], c) => { 
                a[cards[c as card_no].rarity-1].push(c); 
                return a; 
            }, [[],[],[],[],[]]);
    
    static readonly roll_scale = this.grouped_by_rarity
            .map((x, i) => x.length/(i+1));


    static roll_card(rnd: (() => number) = Math.random): card_no
    {
        const sum = this.roll_scale.reduce((a, c) => a+=c, 0);
        const roll = rnd() * sum;
        let s = this.roll_scale[0];
        let i = 0;
        for (; roll >= s; i++) {
            s += this.roll_scale[i+1];
        }
        const group = this.grouped_by_rarity[i];
        return group[Math.floor(rnd() * group.length)];
    }

    players: { [key: number]: player };
    // total rounds so far
    round: number = 1;
    // who's turn?
    private current_player_index: number;

    // ctor (lol put some green text here as a place holder so it fits nicely as a single line)
    constructor(
        p1cards: card_no[],
        p2cards: card_no[],
        private flipper: (() => boolean) = () => (Math.random() < .5),
        private drawer: (() => card_no) = cardgame.roll_card.bind(cardgame))
    {
        this.players = [
            new player(p1cards),
            new player(p2cards),
        ]
        this.current_player_index = 0;
        // game starts, draw a card for player 1
        this.draw_card(this.current_player());
    }


    // plays the given card for the player, since player can play theoritically all cards
    // in hands this method could be called more than once
    public play_card(index: number): { OK: boolean, state: game_state, flips?: boolean[], reason?: string } {

        // set players
        const current_player = this.current_player();
        const target_player = this.target_player();
        // get the card object
        const no: card_no | undefined = current_player.cards[index];
        if (no === undefined) {
            return this.result(false);
        }
        const played_card = cards[no];

        // check if this is a attack card and player has already used one before
        if (played_card.play_limit === limit.attack_category) {

            if (current_player.has_buff(buff_id.attack_cooldown)) 
                return this.result(false, "Bu tur içerisinde başka saldırı kartı oynayamazsınız");

            current_player.buff(status.attack_cooldown());
        }

        // instant actions
        for (const a of played_card.actions ?? []) {

            this.process_action(a, current_player, target_player);
        }

        // flip the coins if any
        this.flip_card_coins(played_card, current_player, target_player);
        
        
        current_player.cards.splice(index, 1);
        return { OK: true, state: this.state(), flips: [] };
    }
    // ends the round for current player
    public end_round()
    {
        this.clean_buffs(this.current_player(), alive_until.round_ends);
        this.current_player_index = this.current_player_index === 0 ? 1 : 0;
        // round is ended, new round begun, draw a card for the player
        this.draw_card(this.current_player());
    }
    public current_player()
    {
        return this.players[this.current_player_index];
    }
    public target_player()
    {
        return this.players[this.current_player_index === 0 ? 1 : 0];
    }
    private result(r: boolean, s: string = "")
    {
        return { OK: r, state: this.state(), reason: s };
    }
    // card-related processing methods @TODO might separate responsibility into card class
    private flip_card_coins(c: card, current_player: player, target_player: player) {
        const flips: boolean[] =  [];
        for (const { heads: heads_action, tails: tails_action } of c.flips ?? []) {

            const flip = this.flipper();
            flips.push(flip);
            
            if (flip /*heads*/) {
                if (heads_action !== undefined)
                    this.process_action(heads_action, current_player, target_player);
            }
            else {
                if (tails_action !== undefined)
                    this.process_action(tails_action, current_player, target_player);

                if (c.tail_break)
                    break;
            }
        }
        return flips;
    }
    private process_action(a: action, current_player: player, target_player: player) {
        
        // attack
        this.process_damage(a.attack, current_player, target_player, (p) => p.hit.bind(p))
        // heal
        this.process_damage(a.heal, current_player, target_player, (p) => p.heal.bind(p))
        // actions related with cards
        if (a.card_count !== undefined) {
            
            // NOTE: currently we have only 1 card count property for one action
            // if a card defines multiple card actions we might need to refactor
            // 

            // pick_card
            if (a.pick_card === from.self_random) {

                this.draw_card(this.current_player(), a.card_count);
            }
        }
    }
    private process_damage(d: damage | undefined, current_player: player, target_player: player, get_function: (p: player) => ((amount: number, percentage: boolean) => void))
    {
        get_function(current_player)(d?.self   ?? 0, d?.percentage ?? false);
        get_function(target_player) (d?.target ?? 0, d?.percentage ?? false);
    }
    private process_buffs(current: player, type: trigger)
    {

    }
    private draw_card(who: player, count: number = 1)
    {
        who.cards.push(...Array<card_no>(count).fill(cardgame.roll_card()));
    }
    private clean_buffs(current: player, type: alive_until)
    {
        current.buffs = current.buffs.filter(x => x.life !== x.life);   
    }
    private state(): game_state {
        if (this.players[0].health === 0 && this.players[1].health === 0) return game_state.draw;
        if (this.players[0].health === 0) return game_state.win_p2;
        if (this.players[1].health === 0) return game_state.win_p1;
        return game_state.unfinished;
    }
}
