"use client";

import { useRouter } from "next/navigation";

export default function HakkindaPage() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-lg mx-auto">
      <button
        onClick={handleBack}
        className="text-sm text-brand font-medium mb-6 inline-flex items-center gap-1"
        type="button"
      >
        ← Geri
      </button>

      <h1 className="font-display text-3xl text-ink mb-6">Soru Deposu</h1>

      <p className="text-ink mb-6">
        Öğrenciniz bir soruyu çözemediğinde, o an fark etmezseniz genelde
        unutulur gider. Soru Deposu, öğrencilerin çözemediği veya tekrar
        çalışması gereken soruları tek bir yerde toplayan, öğretmen ve
        öğrenci için birlikte tasarlanmış bir takip sistemidir.
      </p>

      <h2 className="font-display text-xl text-ink mb-3 mt-8">
        Öğrenci tarafında nasıl işliyor?
      </h2>
      <ul className="list-disc list-inside text-ink flex flex-col gap-2">
        <li>Çözemediği soruyu fotoğraflayıp sisteme yükler</li>
        <li>
          Neden çözemediğini kısaca belirtir (bilgi eksikliği, işlem hatası,
          soruyu anlayamama gibi)
        </li>
        <li>Soruyu tekrar çözdüğünde kendisi &quot;çözdüm&quot; olarak işaretler</li>
        <li>
          Geçmiş soruları, durumlarına göre (bekleyen / tekrar çözülecek /
          tamamlanan) kendi sayfasında görür
        </li>
      </ul>

      <h2 className="font-display text-xl text-ink mb-3 mt-8">
        Öğretmen tarafında nasıl işliyor?
      </h2>
      <ul className="list-disc list-inside text-ink flex flex-col gap-2">
        <li>
          Bir öğrenci yeni soru yükleyince veya bir soruyu çözünce anında
          bildirim alırsınız
        </li>
        <li>
          Dashboard&apos;da haftalık özet: kaç yeni soru geldi, kaç tanesi
          çözüldü, kaç öğrenci bekliyor
        </li>
        <li>
          &quot;En fazla zorlanılan konular&quot; listesi otomatik oluşur —
          hangi konuda kaç kez soru/tekrar geldiğini gösterir
        </li>
        <li>
          Öğrenci bazında geçmişe dönük tüm sorulara ve konulara göre
          filtreleyip arama yapabilirsiniz
        </li>
        <li>
          Öğrencileri tek tek veya toplu (isim listesi ile) davet edebilir,
          kolayca hesap açabilirsiniz
        </li>
      </ul>

      <h2 className="font-display text-xl text-ink mb-3 mt-8">
        Siz gözlemlersiniz, öğrenci takip eder
      </h2>
      <p className="text-ink mb-6">
        Sistemin mantığı basit: soruları tek tek çözdürmek veya kontrol
        etmek size kalmıyor. Öğrenci kendi sürecini kendi yönetiyor, siz ise
        genel tabloya bakıp nerede müdahale etmeniz gerektiğine karar
        veriyorsunuz. Böylece zamanınızı soru takibiyle değil, asıl önemli
        olan öğretmenlikle geçirirsiniz.
      </p>

      <h2 className="font-display text-xl text-ink mb-3 mt-8">Kimin için?</h2>
      <p className="text-ink mb-6">
        Şu an yalnızca 8. sınıf matematik dersi soru takibi için
        hazırlanmıştır. Birebir veya grup ders veren, öğrencilerinin
        eksiklerini derse girmeden önce bilmek isteyen matematik öğretmenleri
        için tasarlandı. Kağıt not tutmaya, WhatsApp&apos;ta soru fotoğrafı
        biriktirmeye gerek kalmıyor — her şey tek yerde, düzenli ve geriye
        dönük olarak izlenebilir.
      </p>

      <p className="text-muted text-sm mt-10">
        Şu an aktif geliştirme aşamasında, gerçek kullanıcı geri
        bildirimleriyle şekilleniyor.
      </p>
    </main>
  );
}
