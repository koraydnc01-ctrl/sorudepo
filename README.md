# Soru Takip

Bireysel özel ders öğretmenlerinin, öğrencilerin çözemediği soruları takip
edip hangi konularda zorlandıklarını görmesini sağlayan mobil öncelikli web
uygulaması.

## Teknolojiler

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend / DB:** Supabase (Postgres + RLS)
- **Auth:** Supabase Auth
- **Fotoğraf depolama:** Supabase Storage
- **Grafikler:** Recharts

## Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Supabase projesi oluştur

[supabase.com](https://supabase.com) üzerinde yeni bir proje oluştur.
Proje ayarlarından şu üç değeri al:

- Project URL
- `anon` public key
- `service_role` key (gizli tutulmalı, sadece sunucu tarafında kullanılır)

### 3. Ortam değişkenlerini ayarla

`.env.example` dosyasını `.env.local` olarak kopyala ve değerleri doldur:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
ANTHROPIC_API_KEY=xxxxx
```

`ANTHROPIC_API_KEY` [console.anthropic.com](https://console.anthropic.com) üzerinden
alınır ve yapay zeka özellikleri (konu tespiti, analiz özeti) için kullanılır.
Bu değer olmadan uygulamanın geri kalanı normal çalışır, sadece AI
özellikleri devre dışı kalır.

### 4. Veritabanı şemasını uygula

Supabase Dashboard → SQL Editor içine `supabase/migrations/0001_init.sql`
dosyasının tamamını yapıştırıp çalıştır.

Bu migration şunları oluşturur:

- Tüm tablolar (`users`, `teachers`, `students`, `invite_codes`,
  `questions`, `question_tags`, `teacher_notes`, `notifications`, vb.)
- Tüm RLS (Row Level Security) politikaları — her öğrenci yalnızca kendi
  sorularını, her öğretmen yalnızca kendi öğrencilerini görebilir
- Durum değişikliklerinde otomatik `notifications` kaydı oluşturan trigger'lar
- Matematik dersi ve 12 LGS konusu (seed data)
- Fotoğraflar için `question-images` adlı public Storage bucket'ı

### 5. (Opsiyonel) Demo veri oluştur

Gerçek kullanıcılarla denemeden önce demo bir öğretmen + 3 öğrenci + konulara
yayılmış demo sorular oluşturmak için:

```bash
node --env-file=.env.local scripts/seed-demo.mjs
```

Script tamamlandığında giriş bilgilerini terminale yazdırır
(şifre hepsinde `Demo1234!`):

- Öğretmen: `ogretmen@demo.com`
- Öğrenciler: `ahmet@demo.com`, `ayse@demo.com`, `mehmet@demo.com`

### 6. Geliştirme sunucusunu başlat

```bash
npm run dev
```

`http://localhost:3000` adresinden uygulamayı aç.

## Proje yapısı

```
src/
├── app/
│   ├── (auth)/              giriş, öğretmen-kayıt, öğrenci-kayıt
│   ├── (ogretmen)/          dashboard, öğrenci detay, analiz, arama
│   ├── (ogrenci)/           anasayfa, soru-ekle, sorularım
│   └── api/davet-kullan/    öğrenci davet kodu doğrulama (service role)
├── components/
│   ├── ogretmen/            öğretmen paneline özel bileşenler
│   ├── ogrenci/             öğrenci paneline özel bileşenler
│   └── ui/                  paylaşılan temel bileşenler
├── lib/
│   ├── supabase/            client / server / middleware yardımcıları
│   ├── types.ts             paylaşılan TypeScript tipleri
│   ├── constants.ts         durum etiketleri, renkler, LGS konuları
│   └── utils.ts             yardımcı fonksiyonlar
supabase/migrations/         SQL şema + RLS + seed
scripts/seed-demo.mjs        demo veri oluşturma scripti
```

## Kullanıcı akışı

**Öğretmen:** Kayıt ol → Dashboard'da "+ Öğrenci ekle" ile davet kodu üret →
Kodu öğrenciyle paylaş → Öğrenci soru yükledikçe panelde görün → Durum / not /
etiket güncelle → Analiz sayfasından konu bazlı zorlanmayı takip et.

**Öğrenci:** Öğretmenin verdiği davet koduyla kayıt ol → "+ Yapamadığım Soru
Ekle" ile fotoğraf çek, konu seç, gönder → Öğretmen "Öğrenci Tekrar Çözsün"
dediğinde soru "Tekrar Çözülecek" listesine düşer → Tekrar çözüp "Çözdüm" de.

## Yapay zeka özellikleri

Bu sürümde Claude (Anthropic API) ile iki entegrasyon var:

1. **Fotoğraftan otomatik konu tespiti** — Öğrenci soru fotoğrafını
   seçtiği anda, `/api/konu-tespit` route'u fotoğrafı Claude'a gönderip
   12 LGS konusundan en olası olanı tahmin eder. Öğrenci öneriye
   dokunarak kabul edebilir veya listeden manuel seçim yapabilir. AI
   isteği başarısız olursa akış bozulmaz, öğrenci normal şekilde
   manuel seçime devam eder.

2. **Öğretmen için AI analiz özeti** — Analiz sayfasında "Yapay zeka
   özeti" kartındaki "Oluştur" butonuna basıldığında, `/api/analiz-ozet`
   route'u o öğrencinin konu/etiket/not geçmişini Claude'a gönderip
   3-4 cümlelik Türkçe bir değerlendirme + öneri üretir.

Her iki route da sunucu tarafında çalışır, `ANTHROPIC_API_KEY` asla
tarayıcıya gönderilmez. İstekler öncesinde Supabase oturumu kontrol
edilir; sadece giriş yapmış kullanıcılar AI çağrısı tetikleyebilir.

## MVP sonrası planlanan özellikler

- OCR ile soru metni çıkarımı
- Soru benzerliği / tekrar önerisi
- Veli paneli
- Deneme sınavı analizi

## Notlar

- `Database` tipi şu an `any` olarak tanımlı (`src/lib/types.ts`). Gerçek
  projede `supabase gen types typescript --project-id <id>` ile otomatik
  üretilmesi önerilir.
- Bildirimler şu an yalnızca veritabanında (`notifications` tablosu) ve
  panellerdeki basit okunmamış-sayısı rozetinde tutulur; push/e-posta
  bildirimleri MVP sonrası kapsamdadır.
