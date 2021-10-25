// type definitions

export interface damage {
    self? : number,
    target: number,
}
export interface effect {
    attack?: damage,
}
export interface card {
    is_attack : boolean,
    damage? : damage,
    flips? : {heads?: effect, tails?: effect}[]
    tail_breaks? : boolean,
}

// card database

export enum card_no {
    efsanevi_ataturk = 1, 
    hasan_mezarci, muzlu_ajdar, koca_isteyen_kari,
    korkusuz_korkak, kara_murat_benim, yossi_kohen, usta_rakun, zikir_halkasi,
    erotik_ajdar, yengec_risitas, gozleri_kayan_acun, halay, tivorlu_ismail, 
    changerboyle, tatar_ramazan
}
export const cards : { [key in card_no] : card } = {
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
    [card_no.korkusuz_korkak]: { 
        is_attack: true,
        flips: Array(5).fill({heads: {attack: {target: 20}}}),
        tail_breaks: true,
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
    [card_no.tivorlu_ismail]: { 
        is_attack: true,
        damage: {target: 20},
        flips: [
            {heads: {attack: {target: 10}}},
            {heads: {attack: {target: 10}}},
            {heads: {attack: {target: 10, self: 20}}}
        ],
        tail_breaks: true,
    },
    15: { 
        is_attack: false
    },
    [card_no.tatar_ramazan]: { 
        is_attack: true,
        flips: [{heads: {attack: {target: 40}}}]
    },
}