import { CardEffect } from "./CardEffect";
import { CardTitle } from "./CardProperties";

export const CardEffectDatabase: {[key in CardTitle]: CardEffect} =
{
    // tslint:disable: no-string-literal
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
    }),
    [CardTitle["Kara Murat benim"]]: new CardEffect((x) => 
    {
        return {owner: x};
    }),
    [CardTitle["Yossi Kohen"]]: new CardEffect((x) => 
    {
        return {owner: x};
    }),
    [CardTitle["Usta Rakun"]]: new CardEffect((x) => 
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
    }),
    // tslint:enable: no-string-literal
}