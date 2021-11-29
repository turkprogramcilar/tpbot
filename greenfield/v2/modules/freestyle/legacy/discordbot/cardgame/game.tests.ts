// tslint:disable no-unused-expression
import { fail } from 'assert';
import { expect } from 'chai';
import { describe } from 'mocha'
import { cardgame, game_state } from './game';
import { card_no, cards, rarity, buff_id } from './data';

const tr = card_no.tatar_ramazan;

const gamewith = (x: card_no) => new cardgame([x, x, x], [x, x, x]);
/**
 * three tatar ramazan card for each player at beginning
 * @returns three attack carded deck for each player game
 */
const basicgame = gamewith.bind(this, tr);
const rng: (states: boolean[]) => () => boolean = (states: boolean[]) => {
    let i = 0;
    return () => states[i++];
}

const card_test = (card: card_no, false_after: number, p1damage: number, p2damage: number) => () => {
    const booleans = Array(false_after).fill(true);
    booleans.push(...Array(10).fill(false));

    const game = new cardgame([card], [], rng(booleans));

    const p1was = game.players[0].health;
    const p2was = game.players[1].health;

    game.play_card(0);
    game.end_round();
    expect(game.players[0].health).equals(p1was - p1damage);
    expect(game.players[1].health).equals(p2was - p2damage);
};
const card_test_heal = (card: card_no, false_after: number, p1_heal: number, p2_heal: number) => () => {

    const booleans = Array(false_after).fill(true);
    booleans.push(...Array(10).fill(false));

    const game = new cardgame([card, card, card], [], rng(booleans));

    const p1was = game.players[0].health;
    const p2was = game.players[1].health;

    game.play_card(0);
    expect(game.players[0].health, "full candayken degisim olmaz").equals(p1was);
    expect(game.players[1].health, "full candayken degisim olmaz").equals(p2was);
    game.end_round();
    game.end_round();
    
    game.players[0].health -= p1_heal;
    game.players[1].health -= p2_heal;
    expect(game.players[0].health + p1_heal, "can dustugunden emin olalim").equals(p1was);
    expect(game.players[1].health + p2_heal, "can dustugunden emin olalim").equals(p2was);
    game.play_card(0);
    expect(game.players[0].health, "kart oynandiktan sonra belirtilen miktar can dolar").equals(p1was);
    expect(game.players[1].health, "kart oynandiktan sonra belirtilen miktar can dolar").equals(p2was);

    game.players[0].health -= p1_heal/2;
    game.players[1].health -= p2_heal/2;
    expect(game.players[0].health + p1_heal/2, "1/2 test: can dustugunden emin olalim").equals(p1was);
    expect(game.players[1].health + p2_heal/2, "1/2 test: can dustugunden emin olalim").equals(p2was);
    game.play_card(0);
    expect(game.players[0].health, "1/2 test: fullu gecmez, kart oynandiktan sonra belirtilen miktar can dolar").equals(p1was);
    expect(game.players[1].health, "1/2 test: fullu gecmez, kart oynandiktan sonra belirtilen miktar can dolar").equals(p2was);

};
const card_test_heal_per = (card: card_no, false_after: number,
    p1_heal_per: number, p2_heal_per: number) =>
    card_test_heal(card, false_after, 
        cardgame.max_health * p1_heal_per,
        cardgame.max_health * p2_heal_per);

describe('kart oyunu', () => {

    it("oyuncu round basi kart alir ve karti yoksa kart oynayamaz", () => {
        const game = new cardgame([], [], undefined, () => tr);
        expect(game.play_card(0).OK).to.be.true;
        expect(game.play_card(0).OK).to.be.false;
        game.end_round();
        expect(game.play_card(0).OK).to.be.true;
        expect(game.play_card(0).OK).to.be.false;
    })

    it("birden fazla saldiri kartini ayni tur icerisinde kullanilmasina izin vermez", () => {
        const game = basicgame();
        const saldiri_karti = 0; // tatar ramazan bir saldiri kartidir

        // birinci oyuncu icin kontrol
        expect(game.play_card(saldiri_karti).OK).to.be.true;
        expect(game.play_card(saldiri_karti).OK).to.be.false;
        game.end_round();

        // ikinci oyuncu icin kontrol
        expect(game.play_card(saldiri_karti).OK).to.be.true;
        expect(game.play_card(saldiri_karti).OK).to.be.false;
    });

    it("birinci tur saldiri karti oynanir ikincisi oynanamaz ve ikinci tur saldiri karti oynanabilir tekrardan", () => {
        const game = basicgame();
        const saldiri_karti = 0; // tatar ramazan bir saldiri kartidir

        // birinci oyuncu icin kontrol
        expect(game.play_card(saldiri_karti).OK).to.be.true;
        expect(game.play_card(saldiri_karti).OK).to.be.false;
        game.end_round();

        // ikinci oyuncu round atlatir
        game.end_round();
        expect(game.play_card(saldiri_karti).OK).to.be.true;
        expect(game.play_card(saldiri_karti).OK).to.be.false;
    });

    it("bir oyuncunun cani 0a duserse oyunu diger oyuncu kazanir", () => {

        let game = new cardgame([tr, tr, tr], [tr, tr, tr], rng([true, true, true, true, true, true]));

        game.play_card(0);
        game.end_round();
        game.play_card(0);
        game.end_round();
        game.play_card(0);
        game.end_round();
        game.play_card(0);
        game.end_round();
        expect(game.play_card(0).state).equals(game_state.win_p1);
        expect(game.players[0].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(20);
        expect(game.players[1].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(0);

        game = new cardgame([tr, tr, tr], [tr, tr, tr], rng([true, true, true, true, true, true]));

        // ilk roundu kart oynamadan atlat ve p2 kazansin
        // game.play_card(0);
        game.end_round();
        game.play_card(0);
        game.end_round();
        game.play_card(0);
        game.end_round();
        game.play_card(0);
        game.end_round();
        game.play_card(0);
        game.end_round();
        expect(game.play_card(0).state).equals(game_state.win_p2);
        expect(game.players[1].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(20);
        expect(game.players[0].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(0);
    });
});

describe("zar sistemi", () => {

    it("random 0 atilan kart en kolay ilk kattir", () => {
        const no: card_no = cardgame.roll_card(() => 0);
        const first_common = 1+cardgame.grouped_by_rarity[0][0];
        expect(no, "ilk yaygin olan karta esit olmali").equals(card_no.usta_rakun);
    });

    it("random 0.99999 atilan kart en son destansi karttir", () => {
        const l = (a: any[]) => a[a.length-1];
        const no = cardgame.roll_card(() => 0.99999);
        const last_legend = l(l(cardgame.grouped_by_rarity));
        expect(no, "son destansi olan karta esit olmali").equals(last_legend);
    });

    it("tum kartlar icin araliklar vardir", () => {
        const concat = <T>(arr: T[][]) => arr.reduce((a,c)=>{a.push(...c);return a;},[]);
        const sum = cardgame.roll_scale.reduce((a, c) => a+= c, 0);
        let s = 0;
        for (const [scale, scale_i] of cardgame.roll_scale.map((x, i) => [x, i])) {
            const lower_bound = s;
            s += scale;
            const upper_bound = s;
            const rarity_index = scale_i;
            const current_cards = cardgame.grouped_by_rarity[rarity_index];

            // burada zar atmak icin hileli zar kullaniyoruz once tur kumesi
            // secimi daha sonra bu tur kumesi icinden kart secimi yapiliyor
            const bounds = [lower_bound/sum, upper_bound/sum*0.99];
            const rolls = concat(bounds.map(f => 
                current_cards.map((x, i) => [f, i/current_cards.length, i])
            ));
            for (const [first, second, card_index] of rolls) {
                const expected = cardgame.grouped_by_rarity[rarity_index][card_index];
                expect(
                    cardgame.roll_card([].shift.bind([first, second]) as any),
                    "Tür aralığının alt ve üst şans sınırları verildiğinde " +
                    "o türden kart geri döndürmeli"
                ).equals(expected);
            }
        }
    });
});

// tek zar atma testi
describe('Tatar /amazan karti', () => {

    it("50% sansla karsi tarafa hasar verir", () => {
        const game = new cardgame([tr, tr, tr], [tr, tr, tr], rng([true, false]));

        const p1was = game.players[0].health;
        const p2was = game.players[1].health;

        const damage = cards[tr].flips![0].heads!.attack!.target;
        if (!damage) fail("kartin hasari yok. olmali");

        // 50% sansla vur
        game.play_card(0);
        game.end_round();
        expect(game.players[0].health).equals(p1was);
        expect(game.players[1].health).equals(p2was - damage);

        // 50% sansla vurama
        game.play_card(0);
        game.end_round();
        expect(game.players[0].health).equals(p1was);
        expect(game.players[1].health).equals(p2was - damage);

    });

});
// ard arda zar atma mekanigi testi
describe('Korkusuz Korkak karti', () => {

    for (let i = 0; i <= 5; i++)
        it(`${i} kere yazi gelme sonucu ${i * 20} hasar verir`, card_test(card_no.korkusuz_korkak, i, 0, i * 20));

    it(`5 kere yazi gelme sonucu sistem durur ve 100 hasar verir sistem`, card_test(card_no.korkusuz_korkak, 7, 0, 5 * 20));
});

describe('Tivorlu Ismail karti', () => {

    it("direkt olarak 20 hasar verir", card_test(card_no.tivorlu_ismail, 0, 0, 20));
    it("1 yazida 30 hasar verir", card_test(card_no.tivorlu_ismail, 1, 0, 30));
    it("2 yazida 40 hasar verir", card_test(card_no.tivorlu_ismail, 2, 0, 40));
    it("3 yazida 50 hasar verir fakat oyuncu 20 hasar alir", card_test(card_no.tivorlu_ismail, 3, 20, 50));
});

describe('Kara Murat benim karti', () => {

    const tested_card = card_no.kara_murat_benim;

    it("direkt olarak 10 hasar verir", card_test(tested_card, 0, 0, 10));
    it("1 yazida 20 hasar verir", card_test(tested_card, 1, 0, 20));
    it("2 yazida 30 hasar verir", card_test(tested_card, 2, 0, 30));
})

describe("Usta Rakun karti", () => {

    it("secilen karti yokeder")
});
// kart çekme mekaniği testi
describe("Ricardo Milos karti", () => {

    it("Oynandığında oyuncunun 2 tane daha kartı olur", () => {
        const game = gamewith(card_no.ricardo_milos);
        const before = game.current_player().cards.length;
        game.play_card(0);
        const after = game.current_player().cards.length;
        //  card played + card gained
        expect(before-1+2).equals(after);
    })
})
// basit buff sistemi testi burada etki olmadikca buff
// sonsuza kadar duruyor ayrica sifa testi
describe("Bump! karti", () => {
    
    it("Oyuncuya şifa verir", card_test_heal(card_no.bump, 0, 20, 0));
    it("Bump statusu verir ve status etki olmadikca durur", () => {
        const game = gamewith(card_no.bump);
        game.play_card(0);
        expect(game.current_player().has_buff(buff_id.bump),
            "kart oynanir oynanmaz bump statusu olmali");
        game.end_round();
        expect(game.target_player().has_buff(buff_id.bump),
            "round bitince rakipe gecse de bump statusu olmali");
        game.end_round();
        expect(game.current_player().has_buff(buff_id.bump),
            "rakibin roundu bitip kendine sira gelince de bump statusu olmali");

    });
    it("Bump statusu verir purge etkisi olunca silinir");    
})
// purge etkisi testi ve full heal
const efsane = it;
describe("Efsanevi Atatürk", () => {

    efsane("Oyuncunun canını tamamen doldurur", 
        card_test_heal_per(card_no.efsanevi_ataturk, 0, 1.0, 0));    
})