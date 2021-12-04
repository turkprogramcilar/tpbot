import { CardText } from "./CardText";
import { CardRarity, CardTitle } from "./CardProperties";

/*******************************************************************72*/
export const CardTextDatabase: {[key in CardTitle]: CardText} =
{
    // tslint:disable: no-string-literal
    [CardTitle["Efsanevi Atatürk"]]: new CardText(CardTitle["Efsanevi Atatürk"],
        CardRarity.Destansı,
        "Oyuncuyu tum zararli buyulerden kurtarir, gucunu tamamen yeniler ve dusmanin tum yararli buyulerini bozar.",
        "https://media1.tenor.com/images/2f94086d9d8d7616090e8dabb8e17ff7/tenor.gif?itemid=15462494"
    ),
    [CardTitle["Şakasına gülünmeyen adam"]]: new CardText(CardTitle["Şakasına gülünmeyen adam"],
        CardRarity.Esrarengiz,
        "Hoca komik bir laz fikrasi anlatir ve dusman bir tur boyunca afallar",
        "https://media1.tenor.com/images/726bfd542c9483c0831bbef0b658d978/tenor.gif"
    ),
    [CardTitle["Muzlu Ajdar"]]: new CardText(CardTitle["Muzlu Ajdar"],
        CardRarity.Güzide,
        "Popstar Ajdar teknesinden dusmanina dogru bir bakis attiktan sonra muzundan bir isirik alir. Dusman kendini Turkiye'nin stari karsisinda gucsuz hisseder.",
        "https://media1.tenor.com/images/ef02df106010033ce4edc91c3a602308/tenor.gif?itemid=15700432"
    ),
    [CardTitle["Koca isteyen kari"]]: new CardText(CardTitle["Koca isteyen kari"],
        CardRarity.Güzide,
        "Koca isteyen kari polislerin elinde rehin durumdadir ve Oyuncu yazi tura atar. Yazi gelmesi halinde Koca isteyen kari polislerin elinden bir hazimle kurtularak oyuncuyu zararli buyulerden defeder. Bu durumda Oyuncu bir daha yazi tura atar. Eger tekrar yazi gelirse Koca isteyen kari dusmanina aldigi depar sonucu kafa atar ve ona X hasar verir",
        "https://media1.tenor.com/images/34121fc8c9f07be8fc19a13f300df98f/tenor.gif?itemid=11898048"
    ),
    [CardTitle["KorkusuzBöyle"]]: new CardText(CardTitle["KorkusuzBöyle"],
        CardRarity.İhtişamlı,
        "Korkusuz Korkak dusmanini tokat yagmuruna tutar. Oyuncu en fazla bes kere ard arda yazi tura atar. Her gelen yazi icin dusmani 20 saglik kaybeder. Ilk gelen tura ardindan yazi tura atma kesilir.",
        "https://media1.tenor.com/images/b93b5c2d5566ff7420f53679cfa49ac3/tenor.gif?itemid=12492940"
    ),
    [CardTitle["Kara Murat benim"]]: new CardText(CardTitle["Kara Murat benim"],
        CardRarity.Esrarengiz,
        "Kara Murat 2 tane klon kardeşini oluşturup kara murat benim diye haykırır ve sesi aynı anda echo yapar. Kara murat kardeşleriyle sağ gösterip sol vurur. Rakip gerçek Kara Murat tarafından 10 hasar alır. Klon kardeşleri yazı atarsa düşmana 10 hasar verir.",
        "https://media.tenor.com/images/fad02d9f6cf14dd6dd116f3739d55b4b/tenor.gif"
    ),
    [CardTitle["Yossi Kohen"]]: new CardText(CardTitle["Yossi Kohen"],
        CardRarity.İhtişamlı,
        "Yahudi is adami Yossi Kohen cok fazla guler ve bunun sonucunda dusman yapmis oldugu saldirinin aynisini kendi hanesine uygular. Ayni zamanda Yossi Kohen firsat buldukca duzenli tras oldugu icin dusmanin uzerinde bulunan iyilestirmelerden Oyuncu ayni sekilde faydalanir",
        "https://cdn.discordapp.com/attachments/842470001155899430/842499112858419200/1395444_306438912828769_165980884_n.png"
    ),
    [CardTitle["Usta Rakun"]]: new CardText(CardTitle["Usta Rakun"],
        CardRarity.Yaygın,
        "Elindeki bir karti sec ve karsi rakibe goster. Sonra bu karti yoket ve destenden yeni bir kart sec. Yeni sectigin karti da rakibe goster.",
        "https://media.tenor.com/images/904da7243ad3d7dfd5c553b48b374d0b/tenor.gif"
    ),
    [CardTitle["Zikir halkası"]]: new CardText(CardTitle["Zikir halkası"],
        CardRarity.Esrarengiz,
        "Oyuncu elindeki tum kartlari desteye geri koyar, kartlari karistitir ve tekrar ayni miktarda kart geri ceker.",
        "https://media1.tenor.com/images/a5841e7db62735c0c85b6c6ddf670afe/tenor.gif?itemid=18466605"
    ),
    [CardTitle["Erotik Ajdar"]]: new CardText(CardTitle["Erotik Ajdar"],
        CardRarity.İhtişamlı,
        "Popstar Ajdar bir esinti edasi ile dans etmeye baslar. Erotik figurleri karsisinda gozleri kamasmis olan dusmanin elinden tum kartlari masaya acilir ve gizli emelleri apacik ortaya tezahur eder.",
        "https://media1.tenor.com/images/dc1947baee381b7b23a02d6a6b4596d3/tenor.gif?itemid=15700431"
    ),
    [CardTitle["Yengec Risitas"]]: new CardText(CardTitle["Yengec Risitas"],
        CardRarity.İhtişamlı,
        "Oyuncunun yaninda destek olmak icin Yengec Risitas ringe cikar ve saldirgan bir sekilde yengec dansi yapmaya baslar. Rakip kendi sirasi bitiminde yazi tura atar. Yazi gelirse Risitas knock-out olur ancak tura gelirse Risitas kiskaclariyla rakibe 20 hasar verir ve hayatta kalmaya devam eder.",
        "https://media1.tenor.com/images/0ac10f80d848a929d272edcff0acb9a4/tenor.gif?itemid=19258334"
    ),
    [CardTitle["Gözleri kayan Acun"]]: new CardText(CardTitle["Gözleri kayan Acun"],
        CardRarity.İhtişamlı,
        "Oyuncu medya sahibi Acun'u sahaya davet eder ve rakip bir sonraki tur yapacagi darbe Acun'a isabet eder. Acunun gozleri kayar. Oyuncu hasar almaz.",
        "https://media.tenor.com/images/02c2e5da032abca1e18228c759c7a895/tenor.gif"
    ),
    [CardTitle["Halay"]]: new CardText(CardTitle["Halay"],
        CardRarity.Güzide,
        "Oyuncu halaya dahil olur ve oynamaya baslar. Halay sirasinda halay basi yazi tura atar. Eger yazi gelirse Oyuncu destesinden istedigi bir karti alir.",
        "https://media.tenor.com/images/9f3d15280ecb7c20d4c6d3d35a52ce26/tenor.gif"
    ),
    [CardTitle["Tivorlu İsmail"]]: new CardText(CardTitle["Tivorlu İsmail"],
        CardRarity.Esrarengiz,
        "Tivorlu Ismail Hela Vela Velvela adli eserini canlandirmaya baslar. Hay Masallah dedikten sonra Zih der ve Aaaa diye yukselmeye baslar. Rakip 20 hasar alir. Tivorlu Ismail Aaaaa nakaratini tekrarladikca oyuncu yazi tura atar. Her yazi ardina tekrar yazi tura atar ve rakibine 10 hasar verir. Oyuncu yazi turayi 3 kere kombolama hakkinda sahiptir. Eger oyuncu 3 kere yazi tutturursa Ismail Hay masallah diyip parcasini bitirir ve Oyuncu kendine 20 hasar verir.",
        "https://media.discordapp.net/attachments/829256056156586044/840294047314739210/tumblr_m38mn15UyX1qfltf6o1_r2_2501.gif"
    ),
    [CardTitle["ChangerBöyle"]]: new CardText(CardTitle["ChangerBöyle"],
        CardRarity.Destansı,
        "Karsi rakibin herhangi bir kartini taklit edebilir.",
        "https://cdn.discordapp.com/attachments/842470001155899430/847973979326382090/unknown.png"
    ),
    [CardTitle["Tatar Ramazan"]]: new CardText(CardTitle["Tatar Ramazan"],
        CardRarity.Esrarengiz,
        "Yazi tura at. Yazi gelirse dusmana 40 hasar yapistir.",
        "https://cdn.discordapp.com/attachments/842470001155899430/855528889660997692/insanlarin-uzerine-sag-tiklayip-ozellik-gormek_205223.png"
    ),
    [CardTitle["TP Moderatörlerin gazabı"]]: new CardText(CardTitle["TP Moderatörlerin gazabı"],
        CardRarity.Destansı,
        "TP Discord sunucusunu moderatörleri bir araya gelerek üyeler üzerinde yetkilerini kullanma suretiyle sunucuda terör estirmeye başlarlar. Korku içerisinde kalan rakip ne yapamayacağını bilemez ve 2 tur boyunca oyundan banlanır, kart çekemez.",
        "https://media3.giphy.com/media/XaLLCvwgRxpwlnnzkh/giphy.gif?cid=790b7611438c6d6c0cfddbdb168cc8b86b99d49cac4b7a29&rid=giphy.gif&ct=g"
    ),
    [CardTitle["Inshallah"]]: new CardText(CardTitle["Inshallah"],
        CardRarity.Güzide,
        "Türk programcı yazılım geliştirme yaparken takıldığı noktaları ve sorunları TP Discord sunucusunda paylaşır. Sunucu bireyleri oyuncuya destek olarak sorununu çözer, yardımcı olur ve inşallah gifi atarlar. Bunun sonunda motive olmuş üye kod yazmaya devam eder ve iki tur boyunca 20 iyileştirme alır.",
        "https://c.tenor.com/wnuXIUDfJLsAAAAC/ron-swanson-nick-offerman.gif"
    ),
    [CardTitle["Le Umut Peace"]]: new CardText(CardTitle["Le Umut Peace"],
        CardRarity.Esrarengiz,
        "Sunucuda Umut sohbetin tam ortasında durduk yere peace gifi atar ve ortadan kaybolur. Bunun sonucunda sunucu üyeleri afallar ve rakip 1 el boyunca hedefini ortada bulamaz.",
        "https://c.tenor.com/xjz_SE0yqXQAAAAC/peace-disappear.gif"
    ),
    [CardTitle["Kralın Soytarı gifi"]]: new CardText(CardTitle["Kralın Soytarı gifi"],
        CardRarity.İhtişamlı,
        "TP Kralı sunucuda Umutun peace gifi üzerine Soytarı Peace gifi atar. Oyuncu ortadan kaybolur ve rakip 1 el boyunca hedefini ortada bulamaz. Eğer herhangi bir oyuncu önceden Le Umut Peace kartı atmışsa bunun üzerine oynanan bu kart kombo etkisi yaratır ve ansızın modsuz kalan sunucuda kaos ortamı oluşur. İki oyuncu rastgele birer kart kaybeder ve 20 hasar puanı alırlar.",
        "https://c.tenor.com/a5d4lrIx9rIAAAAd/jimin-bye-jimin-bts.gif"
    ),
    [CardTitle["Küfürbaz Kral"]]: new CardText(CardTitle["Küfürbaz Kral"],
        CardRarity.Destansı,
        "TP Kralı sunucudan uzun bir süre uzakta kalır ve geri geldiğinde notification fırtınasına uğrar. Bunun sonucunda sinirlenir ve notification sayısı kadar düşmana hasar verir. Bu saldırı koruyucu büyüler tarafından engellenemez.",
        "https://media.giphy.com/media/PL4yLaVxeYreemo2kY/giphy.gif"
    ),
    [CardTitle["Tempolu Günaydın"]]: new CardText(CardTitle["Tempolu Günaydın"],
        CardRarity.Esrarengiz,
        "Oyuncu güne iyi başlar ve her round başı yazı tura atar. Yazı gelmesi durumunda tur başı çektiği kartın üzerine fazla bir kart çeker. Bu büyü uç tur sürer.",
        "https://c.tenor.com/_1z9JvYh7dwAAAAC/goose-silly.gif"
    ),
    [CardTitle[":IBOY:"]]: new CardText(CardTitle[":IBOY:"],
        CardRarity.Güzide,
        "Oyuncu TP sunucusunda en çok kullanılan emojiyi atar 1 kart çeker ve rakip 10 hasar alır. Oyuncu :IBOY: kartını ard ardına spamlaması durumunda her bir oynayış başı kartın hasarı 10 artar. Kart en fazla 30 hasara ulaşabilir.",
        "https://cdn.discordapp.com/attachments/842470001155899430/902335657274376192/unknown.png"
    ),
    [CardTitle["HainBöyle"]]: new CardText(CardTitle["HainBöyle"],
        CardRarity.Destansı,
        "RabirtBoyle TP Discord sunucunun sahibi olmak için hain planlar yapar ve bu emeller içinde oyuncuya aynı tur içerisinde ikinci bir saldırı kartı oynama ayrıcalığı verir.",
        "https://c.tenor.com/Rbfv2Nbq_u4AAAAC/swinging-chilling.gif"
    ),
    [CardTitle["İnş cnm ya :)"]]: new CardText(CardTitle["İnş cnm ya :)"],
        CardRarity.Güzide,
        "Belirsizliğin ortasında kalınıldığında sunucuda inş cnm ya gifi atılır. Ne olacağı belli olmayan bu durumda sorun yaşayan oyuncu ya 30 sağlık puanı kaybeder yada rakibine 30 hasar verir.",
        "https://media4.giphy.com/media/ob44JUxIej8jJEeEgp/giphy.gif?cid=790b7611a4c4375931ff92ee0e899e0c390702526109de29&rid=giphy.gif&ct=g"
    ),
    [CardTitle["@everyone"]]: new CardText(CardTitle["@everyone"],
        CardRarity.Güzide,
        "İki oyuncu sunucuda atılan everyone etiketinden dolayı bildirim alırlar. Kartı oynayan oyuncu yeni bir kart çeker.",
        "https://cdn.discordapp.com/emojis/725714391642931260.gif"
    ),
    [CardTitle["Etiket"]]: new CardText(CardTitle["Etiket"],
        CardRarity.Yaygın,
        "Sunucuda aktif olan iki oyuncudan biri yazı tura sonucu etiketlenir. Oyuncu tura atarsa kendine, yazı atarsa rakibine etiket atar. Kartı oynayan oyuncu yeni bir kart çeker",
        "https://c.tenor.com/V6vHhQ_A05YAAAAd/kamen-rider-kiva-otoya-kurenai.gif"
    ),
    [CardTitle["Çifte Bump"]]: new CardText(CardTitle["Çifte Bump"],
        CardRarity.İhtişamlı,
        "Sunucuda aktif olan iki oyuncu aynı anda bump yapar ve bump sayıları artar. Kartı oynayan oyuncu iki kart çeker",
        "https://cdn.discordapp.com/attachments/842470001155899430/909574126577004564/unknown.png"
    ),
    [CardTitle["Bump!"]]: new CardText(CardTitle["Bump!"],
        CardRarity.İhtişamlı,
        "Oyuncu sunucuda başarıyla bump yapar ve Ekselans Risitas tarafından ödüllerle kutsanır, 20 şifa puanı alır, bir kart çeker.",
        "https://cdn.discordapp.com/attachments/842470001155899430/909584680511234068/unknown.png"
    ),
    [CardTitle["Ricardo Milos"]]: new CardText(CardTitle["Ricardo Milos"],
        CardRarity.Esrarengiz,
        "Oyuncu destesinden bir kartı çekerken Ricardo ile göz göze gelir ve Ricardo gülümser, iki kart çekmesini söyler. Oyuncu Ricardo kartını oynar ve ardından iki kart çeker. ",
        "https://media2.giphy.com/media/W62wk6w0VI55Ijcnva/giphy.gif?cid=790b7611bff8340e5b25e79b3d4bb4cf177efb5725b6ba9d&rid=giphy.gif&ct=g"
    ),
    // tslint:enable: no-string-literal
}