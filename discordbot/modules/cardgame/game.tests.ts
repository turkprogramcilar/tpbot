import { fail } from 'assert';
import { expect } from 'chai';
import { describe } from 'mocha'
import { game, game_state } from './game';
import { card_no, cards } from './data';

const tr = card_no.tatar_ramazan;

const basicgame = () => new game([tr, tr, tr], [tr, tr, tr]);
const rng: (states: boolean[]) => () => boolean = (states: boolean[]) => {
    let i = 0;
    return () => states[i++];
}

const card_test = (card: card_no, false_at: number, p1damage: number, p2damage: number) => () => {
    let booleans = Array(10).fill(true);
    booleans[false_at] = false;

    const game = new game([card], [], rng(booleans));

    const p1was = game.players[1].health;
    const p2was = game.players[2].health;

    game.play_card(1, card);
    game.end_round();
    expect(game.players[1].health).equals(p1was - p1damage);
    expect(game.players[2].health).equals(p2was - p2damage);
};

describe('kart oyunu', () => {

    it("oyunu birinci oyuncudan baslar", () => {
        const game = basicgame();
        expect(game.turn).is.equal(1);
    });

    it("birden fazla saldiri kartini ayni tur icerisinde kullanilmasina izin vermez", () => {
        const game = basicgame();
        const saldiri_karti = tr; // tatar ramazan bir saldiri kartidir

        // birinci oyuncu icin kontrol
        expect(game.play_card(1, saldiri_karti).OK).to.be.true;
        expect(game.play_card(1, saldiri_karti).OK).to.be.false;
        game.end_round();

        // ikinci oyuncu icin kontrol
        expect(game.play_card(2, saldiri_karti).OK).to.be.true;
        expect(game.play_card(2, saldiri_karti).OK).to.be.false;
    });

    it("bir oyuncunun cani 0a duserse oyunu diger oyuncu kazanir", () => {

        let game = new game([tr, tr, tr], [tr, tr, tr], rng([true, true, true, true, true, true]));

        game.play_card(1, tr);
        game.end_round();
        game.play_card(2, tr);
        game.end_round();
        game.play_card(1, tr);
        game.end_round();
        game.play_card(2, tr);
        game.end_round();
        expect(game.play_card(1, tr).state).equals(game_state.win_p1);
        expect(game.players[1].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(40);
        expect(game.players[2].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(0);

        game = new game([tr, tr, tr], [tr, tr, tr], rng([true, true, true, true, true, true]));

        //game.play_card(1, tr);
        game.end_round();
        game.play_card(2, tr);
        game.end_round();
        game.play_card(1, tr);
        game.end_round();
        game.play_card(2, tr);
        game.end_round();
        game.play_card(1, tr);
        game.end_round();
        expect(game.play_card(2, tr).state).equals(game_state.win_p2);
        expect(game.players[2].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(40);
        expect(game.players[1].health, "geri kalan cani, eger bozulursa belki hasarlar degistirilmistir").equals(0);
    });
});

// kart testleri
describe('tatar ramazan karti', () => {

    it("50% sansla karsi tarafa hasar verir", () => {
        const game = new game([tr, tr, tr], [tr, tr, tr], rng([true, false]));

        const p1was = game.players[1].health;
        const p2was = game.players[2].health;

        const damage = cards[tr].flips![0].heads!.attack!.target;
        if (!damage) fail("kartin hasari yok. olmali");

        // 50% sansla vur
        game.play_card(1, tr);
        game.end_round();
        expect(game.players[1].health).equals(p1was);
        expect(game.players[2].health).equals(p2was - damage);

        // 50% sansla vurama
        game.play_card(2, tr);
        game.end_round();
        expect(game.players[1].health).equals(p1was);
        expect(game.players[2].health).equals(p2was - damage);

        expect(game.turn).is.equal(1);
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