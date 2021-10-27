import { action, card_no, cards, limit, card } from "./cardgame.data";

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
interface player {
    buffs: buff[],
    health: number,
    cards: card_no[],
}

const a = {
    [limit.attack_category]: true,
    300: false
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

    players: { [key: number]: player };
    // total rounds so far
    round: number = 1;
    //who's turn?
    turn: number = 1;
    round_result: round_result = { ...default_round_result };
    // current round limits

    // ctor (lol put some green text here as a place holder so it fits nicely as a single line)
    constructor(p1cards: number[], p2cards: number[],
        private flipper: (() => boolean) = () => (Math.random() < .5),
        private logger: (msg: string) => void = (s) => { }) {
        const starting_health = 120;
        this.players = {
            1: {
                health: starting_health,
                cards: p1cards,
                buffs: [],
            },
            2: {
                health: starting_health,
                cards: p2cards,
                buffs: [],
            },
        }
    }

    // plays the given card for the player, since player can play theoritically all cards
    // in hands this method could be called more than once
    public play_card(player: number, no: card_no): { OK: boolean, state: game_state, flips?: boolean[], reason?: string } {

        if (this.turn != player) throw new Error("Illegal operation on play_card. Turn is not equal to player number");

        //@TODO check if player has the card?! at index probably


        // get the card object
        const card = cards[no];

        // check if this is a attack card and player has already used one before
        if (card.play_limit == limit.attack_category) {
            if (this.limits[limit.attack]) return { OK: false, state: this.state(), reason: "Bu tur içerisinde başka saldırı kartı oynayamazsınız" };
            this.limits[limit.attack] = true;
        }

        // direct damage if any @TODO instant_damage is removed. iterate each instant_effect @FIX
        /*if (card.instant_damage) {
            this.target_hit(card.instant_damage.target);
            if (card.instant_damage.self) this.self_hit(card.instant_damage.self);
        }*/ 

        // unroll the flips if any
        this.flip_coins(card);
        

        // remove the card from the deck @TODO
        return { OK: true, state: this.state(), flips: flips };
    }
    private flip_coins(card: card) {
        const flips: boolean[] =  [];
        for (const { heads: heads_action, tails: tails_action } of card.flips ?? []) {

            let action: action | null;

            const heads = this.flipper();
            flips.push(heads);
            if (heads && heads_action !== undefined)
                action = heads_action;
            else if (tails_action !== undefined)
                action = tails_action;
            else
                action = null;

            if (action != null) {
                // test if this effect has attack ability
                if (action.attack) {
                    //this.target_hit(action.attack.target); @TODO FIX THIS @FIX
                    if (action.attack.self) this.self_hit(action.attack.self);
                }
                // test other cases
                //..
            }

            if (!heads && card.tail_break) break;
        }
        return flips;
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
        this.limits = { ...default_abilities };
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