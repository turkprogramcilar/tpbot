# Türk Programcılar Bot
Türk Programcılar Discord sunucusu tarafından geliştirilen bot

`Özellikler: (liste tam değildir)`
- Mega emoji kolezyum
- WebSockets sunucusu ile kanal yayını ( ~~şu an için geliştirilmesi devam etmiyor~~ __20.07.2021: destek geldi güncel olarak çalışıyor__)
- Exp sistemi
- Nvidia
- Gladyatör Ekselans ve Bakkal Risitas modülleri

`Environment variable` tanımlamaları
```
DCBOT_JSON             discord bot tokenların modüllere ayrıldığı JSON yapısı (örnek aşağıdadır)
DCBOT_PHPHOST          exp php host sunucu adı (örn: google.com formatında, http/s ve www koymayın)
DCBOT_DEBUG            Status mesajını farklı gösterir ve kolezyum kanalı olarak test kanalını kullanır (tanımlı olması yeter)
DCBOT_NOKOLEZYUM          Emoji bulunan mesajlarda kolezyumda otomatik mega yaratma 
                       özelliğin kapatır (tanımlı olması yeter)
DCBOT_PREFIX           komut öntakısı (bulunmazsa % varsayılan)
DCBOT_WEBSERVER        true, false: true ise WS özelliğini çalıştırır
DCBOT_WSPORT           WS portu (bulunmazsa varsayılan 3000)
```
`tanımlı olması yeter` ifadesi geçen değerlerin tanımlı olması yeterlidir.
Değeri önemsizdir. 1 yazabilirsiniz illaki değer tanımlamanız gerekiyorsa. 
Tanımladığınız herhangi rastgele değer ihmal edilecektir.

`JSON token örneği`
```json
{
    "ODUxMD23ODMzNOD8MzM4NzUy.YL2hxw.U9iB6Sk5XSwpgHvqKQP9Cfl4Ryg": ["ataturk","kolezyum"],
}
```
Yukarıda örneği verilen token karşısında bulunan 2 modül aynı bot içerisinde çalıştırılır.
```json
{
    "ODUxMD23ODMzNOD8MzM4NzUy.YL2hxw.4pDP6SkxQShBgHvqKQP9Cfl4Ryg": ["ataturk"],
    "ODUxMD23ODMzNOD8MzM4NzUy.YL2hxw.oVDhBnPxTLqYZh81KIwvZybDQy4": ["kolezyum"],
}
```
Yukarıda örneği verilen farkli tokenlar karşısında bulunan modüler ayrı botlar içerisinde çalıştırılır.

# Türk Programcılar Discord Sunucusu

Türk Programcılar discord sunucusu programlamaya yeni başlayan ve her seviyeden insanlara yardım etmeyi hedefleyen bireylerin toplantığı bir platformdur. Birbirimizi motive ettiğimiz, her gün yeni birşeyler öğrenmeye teşvik ettiğimiz sunucumuzda; kodlama yarışmaları ve eğlenceli birçok diğer aktiviteleri de keşvedebilirsin.

Hemen aramıza katıl!

[https://disboard.org/server/698972054740795453](https://disboard.org/server/698972054740795453)

Şu an sunucudaki bulunan ve her gün genişleyen kanal listemiz: Assembly, C, C++, C#, Dart, Go, Haskell, Java, JavaScript, EcmaScript, Kotlin, Lua, Perl, Python, Ruby, Rust, Sql, Mssql, Mysql, TypeScript, VBNET, Flutter, NodeJs, ReactJs, Angular, AspNet, Bootstrap, Django, Html CSS, Mean, MongoDb, ExpessJs, Laravel, Php, Ruby on Rails, Scss, Sass, Stylus...
