// type definitions

export enum limit {
    attack_category,
    unlimited,
}
export interface damage {
    self? : number,
    target? : number,
}
export enum pick_how {
    self_random,
    self_select,
    enemy_random,
    enemy_select,
}
export enum alive_until {
    flip_heads,
    flip_tails,
}
export enum trigger {
    round_begin,
    round_end
}
export interface buff {
    when : trigger,
    life : alive_until,
    effects : effect[],
}
export interface modifier {
}
export interface effect {
    attack? : damage,
    pick_card? : pick_how,
    // transforms card into the chosen card. do not destroy other card. replace it with the same as chosen.
    transform_card? : pick_how,

    // modifiers

    // emits the whole next damaging attack, if number > 1 it is said to have multiple times of this protection
    protection? : number,
    reveal_enemy_cards? : boolean,
}
export interface flip_coin {
    heads? : effect,
    tails? : effect,
}
export interface card {
    play_limit : limit,
    instants? : effect[],
    flips? : flip_coin[],
    // if true flips[] will be not fully iterated when a coin is tail
    tail_break? : boolean,
    buffs? : buff[],
    // buffs that applied to enemy
    debuffs? : buff[],
}

// card database

export enum card_no {
    efsanevi_ataturk = 1, 
    hasan_mezarci, muzlu_ajdar, koca_isteyen_kari, korkusuz_korkak, 
    kara_murat_benim, yossi_kohen, usta_rakun, zikir_halkasi, 
    // 10=
    erotik_ajdar, yengec_risitas, gozleri_kayan_acun, halay, tivorlu_ismail,
    // 15=
    changerboyle, tatar_ramazan
}
export const cards : { [key in card_no] : card } = {
    [card_no.efsanevi_ataturk]: { 
        play_limit: limit.unlimited
    },
    2: { 
        play_limit: limit.unlimited
    },
    3: { 
        play_limit: limit.unlimited
    },
    4: { 
        play_limit: limit.unlimited
    },
    [card_no.korkusuz_korkak]: { 
        play_limit: limit.attack_category,
        flips: Array(5).fill({heads: {attack: {target: 20}}}),
        tail_break: true,
    },
    6: { 
        play_limit: limit.unlimited
    },
    7: { 
        play_limit: limit.unlimited
    },
    8: { 
        play_limit: limit.unlimited
    },
    9: { 
        play_limit: limit.unlimited
    },
    [card_no.erotik_ajdar]: { 
        play_limit: limit.unlimited,
        instants: [
            {reveal_enemy_cards: true},
        ]
    },
    [card_no.yengec_risitas]: { 
        play_limit: limit.unlimited,
        debuffs: [
            { 
                when: trigger.round_end, 
                life: alive_until.flip_heads, 
                effects: [
                    { attack: {self: 20} }
                ] 
            },
        ]
    },
    [card_no.gozleri_kayan_acun]: { 
        play_limit: limit.unlimited,
        instants: [
            {protection: 1},
        ],
    },
    [card_no.halay]: { 
        play_limit: limit.unlimited,
        flips: [
            {heads: {pick_card: pick_how.self_select }}
        ],
    },
    [card_no.tivorlu_ismail]: { 
        play_limit: limit.attack_category,
        instants: [
            {attack: {target: 20}},
        ],
        flips: [
            {heads: {attack: {target: 10}}},
            {heads: {attack: {target: 10}}},
            {heads: {attack: {target: 10, self: 20}}}
        ],
        tail_break: true,
    },
    15: { 
        play_limit: limit.unlimited,
        flips: [
            {heads: {transform_card: pick_how.enemy_select }}
        ],
    },
    [card_no.tatar_ramazan]: { 
        play_limit: limit.attack_category,
        flips: [{heads: {attack: {target: 40}}}]
    },
}