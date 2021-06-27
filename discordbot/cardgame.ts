// card-related definitions

export enum card_no {
    efsanevi_ataturk = 1, 
    hasan_mezarci, muzlu_ajdar, koca_isteyen_kari,
    korkusuz_korkak, kara_murat_benim, yossi_kohen, usta_rakun, zikir_halkasi,
    erotik_ajdar, yengec_risitas, gozleri_kayan_acun, halay, tivorlu_ismail, 
    changerboyle, tatar_ramazan
}
interface damage {
    self? : number,
    target: number,
}
interface effect {
    attack?: damage,
}
interface card {
    is_attack : boolean,
    flips? : {heads?: effect, tails?: effect}[]
}

// game and round mechanic related definitions

enum ability {
    attack,
}
export enum game_state {
    unfinished = -1,
    draw = 0,
    win_p1,
    win_p2,
}
interface round_result {
    played_player : number,
    played_cards  : number[],
    flip_results  : effect[],
    next_player   : number,
    game_finished : boolean,
    game_result   : game_state,
}
interface player {
    health : number,
    cards  : card_no[],
}

// constants and fresh constants

const fresh_abilities : { [key in ability] : boolean } = {
    [ability.attack]: false,
};
const fresh_round_result : round_result = {
    played_player: 0,
    played_cards : [],
    flip_results : [],
    next_player  : 0,
    game_finished: false,
    game_result  : game_state.unfinished,
}
export const card_db : { [key in card_no] : card } = {
    [card_no.efsanevi_ataturk]: { 
        is_attack: false
    },
    2: { 
        is_attack: false
    },
    3: { 
        is_attack: false
    },
    4: { 
        is_attack: false
    },
    5: { 
        is_attack: false
    },
    6: { 
        is_attack: false
    },
    7: { 
        is_attack: false
    },
    8: { 
        is_attack: false
    },
    9: { 
        is_attack: false
    },
    10: { 
        is_attack: false
    },
    11: { 
        is_attack: false
    },
    12: { 
        is_attack: false
    },
    13: { 
        is_attack: false
    },
    14: { 
        is_attack: false
    },
    15: { 
        is_attack: false
    },
    [card_no.tatar_ramazan]: { 
        is_attack: true,
        flips: [{heads: {attack: {target: 40}}}]
    },
}

// game state engine class

export class cardgame {
    players : { [key: number]: player };
    // total rounds so far
    round : number = 1;
    //who's turn?
    turn  : number = 1;
    round_result : round_result = {...fresh_round_result};
    // current player's abilities
    used_abilities : { [key in ability]: boolean } = {...fresh_abilities};

    // ctor (lol put some green text here as a place holder so it fits nicely as a single line)
    constructor(p1cards : number[], p2cards : number[], private flipper : (() => boolean) = ()=>(Math.random()<.5)) {
        const starting_health = 120;
        this.players = {
            1: {                
                health: starting_health,
                cards: p1cards
            },
            2: {                
                health: starting_health,
                cards: p2cards
            },
        }
    }

    // plays the given card for the player, since player can play theoritically all cards
    // in hands this method could be called more than once
    public play_card(player : number, no : card_no) : {OK: boolean, state: game_state} {
        if (this.turn != player) throw new Error("Illegal operation on play_card. Turn is not equal to player number");

        //@TODO check if player has the card?! at index probably
        
        //@TODO alpha version constraint here, remove it when its no longer needed
        if (no!=16) throw new Error("Alpha");

        // get the card object
        const card = card_db[no];

        // check if this is a attack card and player has already used one before
        if (card.is_attack) {
            if (this.used_abilities[ability.attack]) return {OK: false, state: this.state()};
            this.used_abilities[ability.attack] = true;
        }

        // unroll the flips if any
        for (const {heads, tails} of card.flips ?? []) {

            let action : effect | null;

            if (this.flipper() && heads != undefined)
                action = heads;
            else  if (tails != undefined)
                action = tails;
            else
                action = null;

            if (action == null) break;
            
            // test if this effect has attack ability
            if (action.attack) {
                this.target_hit(action.attack.target);
                if (action.attack.self) this.self_hit(action.attack.self);
            }
            // test other cases
            //..
        }
        
        // remove the card from the deck
        return {OK: true, state: this.state()};
    }

    private state() : game_state {
        if (this.players[1].health == 0 && this.players[2].health == 0) return game_state.draw;
        if (this.players[1].health == 0) return game_state.win_p2;
        if (this.players[2].health == 0) return game_state.win_p1;
        return game_state.unfinished;
    }

    // ends the round for current player
    public end_round() : round_result {
        this.turn = this.target_of(this.turn);
        this.used_abilities = {...fresh_abilities};
        return this.round_result;
    }

    private target_hit(damage : number) {
        this.hit_to( this.players[this.target_of(this.turn)], damage);
    }
    private self_hit(damage : number) {
        this.hit_to(this.players[this.turn], damage);
    }
    private hit_to(target : player, damage : number) {
        target.health -= damage;
        if (target.health < 0) target.health = 0;
    }
    private target_of(player : number) : number {
        return player == 1 ? 2 : 1;
    }
}
console.log("OK");
let game = new cardgame([16], [16]);
console.log("OK");