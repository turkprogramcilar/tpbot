import { helper } from "../../helper";
import { action, card_no, cards, limit, card, target, damage } from "./data";
import { attack_cooldown, player } from "./player";
import { card_texts } from "./texts";

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

    private readonly roll_scale = 
        helper.get_enum_keys(card_no).map(x => card_texts[x as card_no].rarity as number)
    players: { [key: number]: player };
    // total rounds so far
    round: number = 1;
    //who's turn?
    turn: number = 1;
    round_result: round_result = { ...default_round_result };
    // current round limits

    // ctor (lol put some green text here as a place holder so it fits nicely as a single line)
    constructor(
        p1cards?: number[],
        p2cards?: number[],
        private flipper: (() => boolean) = () => (Math.random() < .5),
        private logger: (msg: string) => void = (s) => { }) 
    {
        this.players = {
            1: new player(p1cards as card_no[]),
            2: new player(p2cards as card_no[]),
        }
    }

    // plays the given card for the player, since player can play theoritically all cards
    // in hands this method could be called more than once
    public play_card(index: number): { OK: boolean, state: game_state, flips?: boolean[], reason?: string } {

        // set players
        const current_player = this.players[this.turn];
        const target_player = this.players[this.target_of(this.turn)];
        // get the card object
        const no: card_no | undefined = current_player.cards[index];
        if (no === undefined) {
            return this.result(false);
        }
        const played_card = cards[no];

        // check if this is a attack card and player has already used one before
        if (played_card.play_limit === limit.attack_category) {

            if (current_player.has_buff(attack_cooldown)) 
                return this.result(false, "Bu tur içerisinde başka saldırı kartı oynayamazsınız");

            current_player.buff(attack_cooldown);
        }

        // instant actions
        for (const action of played_card.actions ?? []) {

            this.process_action(action, current_player, target_player);
        }

        // flip the coins if any
        this.flip_card_coins(played_card, current_player, target_player);
        
        // remove the card from the deck @TODO
        return { OK: true, state: this.state(), flips: [] };
    }
    private result(r: boolean, s: string = "")
    {
        return { OK: r, state: this.state(), reason: s };
    }
    // card-related processing methods @TODO might separate responsibility into card class
    private flip_card_coins(card: card, current_player: player, target_player: player) {
        const flips: boolean[] =  [];
        for (const { heads: heads_action, tails: tails_action } of card.flips ?? []) {

            const flip = this.flipper();
            flips.push(flip);
            
            if (flip /*heads*/) {
                if (heads_action !== undefined)
                    this.process_action(heads_action, current_player, target_player);
            }
            else {
                if (tails_action !== undefined)
                    this.process_action(tails_action, current_player, target_player);

                if (card.tail_break)
                    break;
            }
        }
        return flips;
    }
    private process_action(action: action, current_player: player, target_player: player) {
        
        // attack
        this.process_damage(action.attack, current_player, target_player, (p) => p.hit.bind(p))
        // heal
        this.process_damage(action.heal, current_player, target_player, (p) => p.heal.bind(p))

    }
    private process_damage(damage: damage | undefined, current_player: player, target_player: player, get_function: (p: player) => ((amount: number, percentage: boolean) => void))
    {
        get_function(current_player)(damage?.self   ?? 0, damage?.percentage ?? false);
        get_function(target_player) (damage?.target ?? 0, damage?.percentage ?? false);
    }

    private state(): game_state {
        if (this.players[1].health == 0 && this.players[2].health == 0) return game_state.draw;
        if (this.players[1].health == 0) return game_state.win_p2;
        if (this.players[2].health == 0) return game_state.win_p1;
        return game_state.unfinished;
    }

    // ends the round for current player
    public end_round(): round_result {
        
        this.turn = this.target_of(this.turn);
        return this.round_result;
    }

    private target_hit(damage: number) {
        const target = this.players[this.target_of(this.turn)];

        this.hit_to(target, damage);
    }
    private self_hit(damage: number) {
        this.hit_to(this.players[this.turn], damage);
    }
    private hit_to(target: player, damage: number) {
        target.health -= damage;
        if (target.health < 0) target.health = 0;
    }
    private target_of(player: number): number {
        return player == 1 ? 2 : 1;
    }
}
