import { expect } from 'chai';
import { describe } from 'mocha'
import { cardgame, card_db, card_no, game_state } from './cardgame';

const tr = card_no.tatar_ramazan;

const basicgame = () => new cardgame([tr,tr,tr], [tr,tr,tr]);
const rng : (states : boolean[]) => () => boolean = (states : boolean[]) => {
    let i = 0;
    return () => states[i++];
}

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
        
        let game = new cardgame([tr,tr,tr], [tr,tr,tr], rng([true, true, true, true, true, true]));

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
        
        game = new cardgame([tr,tr,tr], [tr,tr,tr], rng([true, true, true, true, true, true]));

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
        const game = new cardgame([tr,tr,tr], [tr,tr,tr], rng([true, false]));

        const p1was = game.players[1].health;
        const p2was = game.players[2].health;

        const damage = card_db[tr].flips![0].heads!.attack!.target;

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

    it("5 kere yazi gelme sonucu 100 hasar verir", () => {
        const game = new cardgame([card_no.korkusuz_korkak], [], rng([true, true, true, true, true, true]));

        const p1was = game.players[1].health;
        const p2was = game.players[2].health;

        const damage = card_db[card_no.korkusuz_korkak].flips![0].heads!.attack!.target;

        // 50% sansla vur
        game.play_card(1, card_no.korkusuz_korkak);
        game.end_round();
        expect(game.players[1].health).equals(p1was);
        expect(game.players[2].health).equals(p2was - damage * 5);
    });
    it("0 kere yazi gelme sonucu 0 hasar verir", () => {
        const game = new cardgame([card_no.korkusuz_korkak], [], rng([false, true, true, true, true, true]));

        const p1was = game.players[1].health;
        const p2was = game.players[2].health;

        const damage = card_db[card_no.korkusuz_korkak].flips![0].heads!.attack!.target;

        // 50% sansla vur
        game.play_card(1, card_no.korkusuz_korkak);
        game.end_round();
        expect(game.players[1].health).equals(p1was);
        expect(game.players[2].health).equals(p2was - damage * 0);
    });
    it("1 kere yazi gelme sonucu 20 hasar verir", () => {
        const game = new cardgame([card_no.korkusuz_korkak], [], rng([true, false, true, true, true, true]));

        const p1was = game.players[1].health;
        const p2was = game.players[2].health;

        const damage = card_db[card_no.korkusuz_korkak].flips![0].heads!.attack!.target;

        // 50% sansla vur
        game.play_card(1, card_no.korkusuz_korkak);
        game.end_round();
        expect(game.players[1].health).equals(p1was);
        expect(game.players[2].health).equals(p2was - damage * 1);
    });
    it("2 kere yazi gelme sonucu 40 hasar verir", () => {
        const game = new cardgame([card_no.korkusuz_korkak], [], rng([true, true, false, true, true, true]));

        const p1was = game.players[1].health;
        const p2was = game.players[2].health;

        const damage = card_db[card_no.korkusuz_korkak].flips![0].heads!.attack!.target;

        // 50% sansla vur
        game.play_card(1, card_no.korkusuz_korkak);
        game.end_round();
        expect(game.players[1].health).equals(p1was);
        expect(game.players[2].health).equals(p2was - damage * 2);
    });

});