import { fail } from 'assert';
import { expect } from 'chai';
import { describe } from 'mocha'
import { cardgame, game_state } from './game';
import { card_no, cards, rarity } from './data';

const tr = card_no.tatar_ramazan;

const basicgame = () => new cardgame([tr, tr, tr], [tr, tr, tr]);
const rng: (states: boolean[]) => () => boolean = (states: boolean[]) => {
    let i = 0;
    return () => states[i++];
}

const card_test = (card: card_no, false_at: number, p1damage: number, p2damage: number) => () => {
    const booleans = Array(10).fill(true);
    booleans[false_at] = false;

    const game = new cardgame([card], [], rng(booleans));

    const p1was = game.players[0].health;
    const p2was = game.players[1].health;

    game.play_card(0);
    game.end_round();
    expect(game.players[0].health).equals(p1was - p1damage);
    expect(game.players[1].health).equals(p2was - p2damage);
};

describe('kart oyunu', () => {

    it("oyuncu round basi kart alir ve karti yoksa kart oynayamaz", () => {
        const game = new cardgame([], []);
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
        //game.play_card(0);
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

// kart testleri
describe('tatar ramazan karti', () => {

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
describe('korkusuz korkak karti', () => {

    for (let i = 0; i <= 5; i++)
        it(`${i} kere yazi gelme sonucu ${i * 20} hasar verir`, card_test(card_no.korkusuz_korkak, i, 0, i * 20));

    it(`5 kere yazi gelme sonucu sistem durur ve 100 hasar verir sistem`, card_test(card_no.korkusuz_korkak, 7, 0, 5 * 20));
});

describe('tivorlu ismail karti', () => {

    it("direkt olarak 20 hasar verir", card_test(card_no.tivorlu_ismail, 0, 0, 20));
    it("1 yazida 30 hasar verir", card_test(card_no.tivorlu_ismail, 1, 0, 30));
    it("2 yazida 40 hasar verir", card_test(card_no.tivorlu_ismail, 2, 0, 40));
    it("3 yazida 50 hasar verir fakat oyuncu 20 hasar alir", card_test(card_no.tivorlu_ismail, 3, 20, 50));
});

describe("Usta rakun karti", () => {

    it("secilen karti yokeder")
});