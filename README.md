# Türk Programcılar Bot

[Türk Programcılar Discord Sunucusu Üyeleri](https://disboard.org/server/698972054740795453) tarafından geliştirilen bot

## Eski mimari
[README.md](legacy/README.md) dosyasından eski mimari için bilgilere ulaşılabilir. TPBOT yeni mimarisinde eski mimari yüklenmesine izin vermektedir ve geriye dönük uyumludur.

## Yeni mimari
@TODO

## Ortam değişkenleri tanımlamaları (Environment variables)
### TPBOT_ROOT_DIR
Sistem TypeScript ile derlendiğinden varsayılan olarak tsconfig ayarlamasında
biz build/ klasörü içerisine çıkartma yapıyoruz. Fakat burada modüllerin 
birbirlerini yükleyebilmeleri için gerekli klasör yollarının çözümlenmesi
gerekiyor. Burada eğer varsayılan değişirse TypeScript çıkartmasının yolu ve
kök dizine olan uzaklığı değişeceğinden sizin kök dizine olan mesafeyi
belirtebilmeniz için oluşturulmuştur. Varsayılan değer build/ klasörüne çıkartım
yapıldığında `../` olmalıdır.

### TPBOT_TOKEN
TPBOT_TOKEN ile başlayan her ortam değişkeni (environment variable) sistem 
tarafından TOKEN olarak kabul edilir. Örneğin:
    `TPBOT_TOKEN`    `TPBOT_TOKEN123`    `TPBOT_TOKEN_BOT`
Birden fazla TOKEN belirtmeniz dahilinde tüm bot hesapları `tpbot.yaml` dosyası 
altında modül yükleme görevi tanımlanmışsa `moduleMapping` kısmında veya 
`shellBots` altında tanımlanmışsa her biri ilgili görev için yüklenecektir.

## tpbot.yaml ayar dosyası
### shellBots
Shell için kullanılacak olan bot hesabını sunucuya sokmanız gerekmez.
Gizli tutabilirsiniz. Veya tercihe göre herhangi bir modül görevi olan bota da
tanımlayabilirsiniz sunucu içerisinde bulunan. Bu bot DM kanalından shell
komutları kabul edecektir. `tpbot.yaml` dosyasında `shellBots` kısmında DM
kanalından kimlerin shell komutu çalıştıracağını tanımlayabilirsiniz.

## Geliştirme ve katkıda bulunma
@TODO: camelCase PascalCase

# Türk Programcılar Discord Sunucusu

Türk Programcılar discord sunucusu programlamaya yeni başlayan ve her seviyeden insanlara yardım etmeyi hedefleyen bireylerin toplantığı bir platformdur. Birbirimizi motive ettiğimiz, her gün yeni birşeyler öğrenmeye teşvik ettiğimiz sunucumuzda; kodlama yarışmaları ve eğlenceli birçok diğer aktiviteleri de keşvedebilirsin.

Hemen aramıza katıl!

[https://disboard.org/server/698972054740795453](https://disboard.org/server/698972054740795453)

Şu an sunucudaki bulunan ve her gün genişleyen kanal listemiz: Assembly, C, C++, C#, Dart, Go, Haskell, Java, JavaScript, EcmaScript, Kotlin, Lua, Perl, Python, Ruby, Rust, Sql, Mssql, Mysql, TypeScript, VBNET, Flutter, NodeJs, ReactJs, Angular, AspNet, Bootstrap, Django, Html CSS, Mean, MongoDb, ExpessJs, Laravel, Php, Ruby on Rails, Scss, Sass, Stylus...

![Kedi animasyon gif resmi](https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif)
