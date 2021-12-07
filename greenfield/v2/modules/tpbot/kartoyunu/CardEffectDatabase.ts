import { MessageComponentInteraction } from "discord.js";
import { CardEffect } from "./CardEffect";
import { CardEffectResult } from "./CardEffectResult";
import { CardTitle } from "./CardProperties";
import { KartOyunu } from "./Main";

export const CardEffectDatabase: {[key in CardTitle]: CardEffect | undefined} =
{
    // tslint:disable: no-string-literal
    /*
    [CardTitle["Efsanevi Atatürk"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Şakasına gülünmeyen adam"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Muzlu Ajdar"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Koca isteyen kari"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["KorkusuzBöyle"]]: new CardEffect((x) =>
    {
        return { owner: x };
    }, 1),
    [CardTitle["Kara Murat benim"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Yossi Kohen"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["8 Top"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Zikir halkası"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Erotik Ajdar"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Yengec Risitas"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Gözleri kayan Acun"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Halay"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Tivorlu İsmail"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["ChangerBöyle"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Tatar Ramazan"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["TP Moderatörlerin gazabı"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Inshallah"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Le Umut Peace"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Kralın Soytarı gifi"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Küfürbaz Kral"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Tempolu Günaydın"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle[":IBOY:"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["HainBöyle"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["İnş cnm ya :)"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["@everyone"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Etiket"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Çifte Bump"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Bump!"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),
    [CardTitle["Ricardo Milos"]]: new CardEffect((x) =>
    {
        return {owner: x};
    }),*/
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
    5: undefined,
    6: undefined,
    7: undefined,
    8: undefined,
    9: undefined,
    10: undefined,
    11: undefined,
    12: undefined,
    13: undefined,
    14: undefined,
    15: undefined,
    16: undefined,
    17: undefined,
    18: undefined,
    19: undefined,
    20: undefined,
    21: undefined,
    22: undefined,
    23: undefined,
    24: undefined,
    25: undefined,
    26: undefined,
    27: undefined,
    28: undefined,
    29: undefined,
    30: undefined,
    31: undefined,
    32: undefined,
    33: undefined,
    34: undefined,
    35: undefined,
    36: undefined,
    37: undefined,
    38: undefined,
    39: undefined,
    40: undefined,
    41: undefined,
    43: undefined,
    44: undefined,
    45: undefined,
    46: undefined,
    47: undefined,
    42: undefined,
    48: undefined,
    49: undefined,
    50: undefined,
    51: undefined,
    52: undefined,
    53: undefined,
    54: undefined,
    55: undefined,
    56: undefined,
    57: undefined,
    58: undefined,
    59: undefined,
    60: undefined,
    61: undefined,
    62: undefined,
    [CardTitle["Echo"]]: new CardEffect
    (
        (module: KartOyunu) => new CardEffectResult()
            .setEffectInteraction(async (int: MessageComponentInteraction) =>
            {
                module.publicEcho.push([int.user.id, int.channelId]);
                await int.followUp({content: "Echo kart gücü aktifleştirildi. Bota"
                + " göndereceğiniz ilk özel mesaj echo olarak gönderilecektir.", 
                ephemeral: true});
            })
    ),
    64: undefined,
    // tslint:enable: no-string-literal
    
}