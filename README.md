# Türk Programcılar Bot

[Türk Programcılar Discord Sunucusu Üyeleri](https://disboard.org/server/698972054740795453) tarafından geliştirilen bot

## Eski mimari
[README.md](legacy/README.md) dosyasından eski mimari için bilgilere ulaşılabilir. TPBOT yeni mimarisinde eski mimari yüklenmesine izin vermektedir ve geriye dönük uyumludur.

## Yeni mimari
@TODO
### TPBOT_TOKEN
TPBOT_TOKEN ile başlayan her ortam değişkeni (environment variable) sistem 
tarafından TOKEN olarak kabul edilir. Örneğin:
    `TPBOT_TOKEN`    `TPBOT_TOKEN123`    `TPBOT_TOKEN_BOT`
Birden fazla TOKEN belirtmeniz dahilinde tüm bot hesapları `tpbot.yaml` dosyası 
altında modül yükleme görevi tanımlanmışsa `moduleMapping` kısmında her biri
yüklenecektir.
### TPBOT_SHELL
TPBOT_SHELL ortam değişkeni (environment variable) shell için kullanılacak olan
bot hesabı TOKEN değerini içermelidir. Bu bot hesabını sunucuya sokmamanız ve
gizli tutabilirsiniz. Veya tercihe göre herhangi bir modül görevi olan bota da
tanımlayabilirsiniz sunucu içerisinde bulunan. Bu bot DM kanalından shell
komutları kabul edecektir. `tpbot.yaml` dosyasında `shellAccess` kısmında DM
kanalından kimlerin shell komutu çalıştıracağını tanımlayabilirsiniz.

## Geliştirme ve katkıda bulunma
@TODO: camelCase PascalCase

# Türk Programcılar Discord Sunucusu

Türk Programcılar discord sunucusu programlamaya yeni başlayan ve her seviyeden insanlara yardım etmeyi hedefleyen bireylerin toplantığı bir platformdur. Birbirimizi motive ettiğimiz, her gün yeni birşeyler öğrenmeye teşvik ettiğimiz sunucumuzda; kodlama yarışmaları ve eğlenceli birçok diğer aktiviteleri de keşvedebilirsin.

Hemen aramıza katıl!

[https://disboard.org/server/698972054740795453](https://disboard.org/server/698972054740795453)

Şu an sunucudaki bulunan ve her gün genişleyen kanal listemiz: Assembly, C, C++, C#, Dart, Go, Haskell, Java, JavaScript, EcmaScript, Kotlin, Lua, Perl, Python, Ruby, Rust, Sql, Mssql, Mysql, TypeScript, VBNET, Flutter, NodeJs, ReactJs, Angular, AspNet, Bootstrap, Django, Html CSS, Mean, MongoDb, ExpessJs, Laravel, Php, Ruby on Rails, Scss, Sass, Stylus...

![Kedi animasyon gif resmi](https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif)
