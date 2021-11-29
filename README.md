# Türk Programcılar Bot
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) ![Chat](https://img.shields.io/discord/698972054740795453?label=chat&logo=discord)

[Türk Programcılar Discord Sunucusu Üyeleri](https://disboard.org/server/698972054740795453) 
tarafından geliştirilen çoklu iş bazlı (multi-threading) bot.

Çoklu iş yapısı sayesinde birden fazla bot aynı sistem altında çalıştırılabilir 
ve birbirlerinden izole yapılar halinde çalışma prensibinden ötürü çökme veya 
hata alma durumlarından diğer botlar etkilenmez. Bu sunucu içerisinde 
geliştirilmekte olan modüllerin daha alfa aşamasından son aşamasına kadar test
edilmesine güvenli bir şekilde olanak sağlar.

## Gelecekte yapılması planlanan yenilikler
- Threading yapısı genişletilerek process yapısına geçilip gerektiğinde herhangi
bir işlemi başlatılarak takibin yapılabilmesi. Bu kapsamda öncü olarak python
discord modüllerinin çalıştırılması planlanmaktadır.
- Hot reload/plugin yapısı getirilerek botun ana çekirdek yapısı, yürümekte olan
bot işlemlerini etkilemeden yeni modüllerin sisteme dahil olup anlık 
yürütülmesi veya aksi bir durumda yeniden başlatılabilmesi. Canlı ortamda 
bulunan botun her seferde githubdan yeni bir commit çekerek kendini kapatıp
yeniden açması hem masraflı hemde canlı yürüyen sürecin aksamasına sebebiyet 
vermektedir. Sunucu ortamında canlıda bulunan botlar bu sistem sayesinde 
etkilenmeden arka planda modüllerin yeni versiyonlarını içlerine aktarip 
yükleyebilecekler.

## Eski mimari
[README.md](greenfield/v2/modules/freestyle/legacy/README.md) dosyasından eski 
mimari için bilgilere ulaşılabilir. TPBOT yeni mimarisinde eski mimari 
yüklenmesine izin vermektedir ve geriye dönük uyumludur. 
`freestyles/legacy/main` noktasından yaml dosyasına `freestyle` modül 
tanımlaması yapılarak eski mimaride çalışan modüllerin tamamı yüklenebilir.

## Ortam değişkenleri tanımlamaları (Environment variables)

### TPBOT_ROOT_DIR
Sistem TypeScript ile derlendiğinden varsayılan olarak tsconfig ayarlamasında
biz build/ klasörü içerisine çıkartma yapıyoruz. Fakat burada modüllerin 
birbirlerini yükleyebilmeleri için gerekli klasör yollarının çözümlenmesi
gerekiyor. Burada eğer varsayılan değişirse TypeScript çıkartmasının yolu ve
kök dizine olan uzaklığı değişeceğinden sizin kök dizine olan mesafeyi
belirtebilmeniz için oluşturulmuştur. Varsayılan değer build/ klasörüne çıkartım
yapıldığında `../` olmalıdır. Varsayılan değişmediği sürece bu tanımlamanın 
yapılmasına gerek yoktur. 

### TPBOT_TOKEN
TPBOT_TOKEN ile başlayan her ortam değişkeni (environment variable) sistem 
tarafından TOKEN olarak kabul edilir. Örneğin:
    `TPBOT_TOKEN`    `TPBOT_TOKEN123`    `TPBOT_TOKEN_BOT`

### TPBOT_SHELL_TAG
TPBOT_SHELL_TAG ile başlayan her ortam değişkeni (environment variable) sistem 
tarafından shell bot ile tag eşleştirmesinde kullanılır. Örneğin:
    `TPBOT_SHELL_TAG`    `TPBOT_SHELL_TAG123`    `TPBOT_SHELL_TAG_BOT`

## tpbot.yaml ayar dosyası
Tüm fonksiyonlarıyla örnek bir tanımlama kaynak kodları içerisindedir ve yorum 
satırlarıyla gerekli alanlarda açıklama mevcuttur.

### TpbotShell modülü
Shell için kullanılacak olan bot hesabını sunucuya sokmanız gerekmez.
Gizli tutabilirsiniz. Veya tercihe göre herhangi bir modül görevi olan bota da
tanımlayabilirsiniz. Bu bot DM kanalından shell
komutları kabul edecektir. Environment değerlerinde ilgili hesabın `TOKEN` 
tanımlamasını yapıp aynı şekilde bu botun `TAG` değerini `SHELL_TAG` kısmında 
açıklandığı gibi yapmanız gerekmektedir.

## Geliştirme ve katkıda bulunma
### Kodlama stili
Süslü parantezler `class` ve fonksiyonlarda satır başı, diğer heryerde
satır sonundan açılır. `import` tanımlamaları dosyanın başında yapılır.

`class` ilk süslü parantezinden sonra ve son süslü parantezden
önce, `class` içerisinde static ve sınıf tanımlamaları arasında 72 karakterlik
yorum satırı ayracı kullanılır.

Her bir `class` bir dosya içerisinde tanımlanır ve class içindeki tanımlamalar
boşluk konulmadan yapılır.

`static` alan tanımlamaları sınıf içerisinde önce gelir. Diğer sınıfa ait
tanımlamalar static alanından sonra gelir. Bu iki bölümde önce değişkenler
sonra fonksiyon tanımlamaları yapılır. `public` tanımlamalar için başına public
yazılmaz, `typescript` varsayılan olarak public yapar. `private` değişkenlerin
başına özel olmaları için yazmak zorundayız ve bu alanlar `public` alanlardan
sonra gelirler.
```ts
import { baslangicta } from "yapilir"
class susluParantezlerYeniSatira
{
/*******************************************************************72*/
static publicAlanOnceGelirEnFazlaYetkiOnce: string;
static readonly okumalikSonraGelirBirazAzYetki: number;
protected static hayatindaProtectedBirStaticAlan: undefined;
protected readonly static yazmayiBirakGormemissindirBile: null;
private static alanlarEnSonGelirOzelAlan: Date[];
private static readonly bayaKisitliBirAlan: {[key in string]: number};
static publicAlanBasinaPublicYazilmaz()
{
}
protected static protectedVePrivateIcinYazilir()
{
}
private static fonksiyonEnSondaKaldi()
{
}
/*******************************************************************72*/
publicBirAlan: number;
readonly sadeceOkumaHakkiVar: string;
protected kalitimaAcik: boolean;
protected readonly kalitimaOkumayaAcik: number;
private ozelAlan;
private readonly devletSirri: null | undefined;
constructor()
{
}
fonksiyonSusluParantezYeniSatira()
{
    // diger suslu parantezler satir sonundan acilir
    if () {
    }
    else if {
    }
    else {
    }
    for () {
    }
    while () {
    }
    do {
    } while ()
    
    switch () {
    case "case geriden yazilir":
        break;
    case "case switch ile ayni hizadadir":
        break;
    default:
        break;
    }
}
protected sanirimSenBuIsiCozdun()
{
}
private fonksiyonlarArasiBoslukBirakilmazSaflariSikTutalimCemaat()
{
    const hasSektor: string = "fonksiyon icerisinde rahat olun";

    if ("buralari hep dutluktu" === "her zaman üçlü eşittir kullanın") {
        return;
    }
}
/*******************************************************************72*/
}
```
Herhangi bir satır 80 karakteri aşamaz. Aşıldığında yeni satıra bölünmelidir.

Veri tipi isimlendirmeleri `PascalCase` yapılmalıdır. Geri kalan herşey için 
`camelCase` notasyonu kullanılır.
```ts
class VeriTipleriPascalCaseOlmalidir
{
// ...

private digerHerseyCamelCase<E extends keyof T>(digerParametreYeniSatira: E,
    dinleyici: (...milletAc: E[T]) => Lazim)
{
    this.log("fonksiyonu cok uzun bir string mesaji bastiracagim o kadar uzun"
        + " ki bu sekilde yeni satira boluyorum.");
}
```

# Türk Programcılar Discord Sunucusu

Türk Programcılar discord sunucusu programlamaya yeni başlayan ve her seviyeden insanlara yardım etmeyi hedefleyen bireylerin toplantığı bir platformdur. Birbirimizi motive ettiğimiz, her gün yeni birşeyler öğrenmeye teşvik ettiğimiz sunucumuzda; kodlama yarışmaları ve eğlenceli birçok diğer aktiviteleri de keşvedebilirsin.

Hemen aramıza katıl!

[https://disboard.org/server/698972054740795453](https://disboard.org/server/698972054740795453)

Şu an sunucudaki bulunan ve her gün genişleyen kanal listemiz: Assembly, C, C++, C#, Dart, Go, Haskell, Java, JavaScript, EcmaScript, Kotlin, Lua, Perl, Python, Ruby, Rust, Sql, Mssql, Mysql, TypeScript, VBNET, Flutter, NodeJs, ReactJs, Angular, AspNet, Bootstrap, Django, Html CSS, Mean, MongoDb, ExpessJs, Laravel, Php, Ruby on Rails, Scss, Sass, Stylus...

![Kedi animasyon gif resmi](https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif)
