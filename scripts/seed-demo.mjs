// Demo veri oluşturma scripti.
// Çalıştırmadan önce .env.local dosyasında SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.
//
// Kullanım:
//   node --env-file=.env.local scripts/seed-demo.mjs
//
// Oluşturur:
//   - 1 demo öğretmen  (ogretmen@demo.com / Demo1234!)
//   - 3 demo öğrenci   (ahmet@demo.com, ayse@demo.com, mehmet@demo.com / Demo1234!)
//   - konulara ve tarihlere yayılmış demo sorular + etiketler

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const PASSWORD = "Demo1234!";
const PLACEHOLDER_IMG =
  "https://placehold.co/600x800/F7F5EF/23262B?text=Soru+Foto%C4%9Fraf%C4%B1";

async function createAuthUser(email, fullName) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  console.log("Demo öğretmen oluşturuluyor...");
  const teacherId = await createAuthUser("ogretmen@demo.com", "Koray Öğretmen");

  await supabase.from("users").insert({
    id: teacherId,
    role: "teacher",
    full_name: "Koray Öğretmen",
    email: "ogretmen@demo.com",
  });
  await supabase.from("teachers").insert({ id: teacherId });

  const { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .eq("name", "Matematik")
    .single();

  const { data: topics } = await supabase
    .from("topics")
    .select("id, name")
    .eq("subject_id", subject.id);

  const topicByName = Object.fromEntries(topics.map((t) => [t.name, t.id]));

  const students = [
    { email: "ahmet@demo.com", name: "Ahmet Yılmaz" },
    { email: "ayse@demo.com", name: "Ayşe Demir" },
    { email: "mehmet@demo.com", name: "Mehmet Kaya" },
  ];

  const studentIds = {};

  for (const s of students) {
    console.log(`Demo öğrenci oluşturuluyor: ${s.name}`);
    const id = await createAuthUser(s.email, s.name);
    await supabase.from("users").insert({
      id,
      role: "student",
      full_name: s.name,
      email: s.email,
    });
    await supabase.from("students").insert({ id, teacher_id: teacherId });
    await supabase.from("teacher_students").insert({
      teacher_id: teacherId,
      student_id: id,
    });
    studentIds[s.name] = id;
  }

  const statuses = [
    "BEKLIYOR",
    "DERSTE_ELE_ALINDI",
    "TEKRAR_COZULECEK",
    "OGRENCI_COZDU",
    "TAMAMLANDI",
  ];
  const tags = [
    "bilgi_eksikligi",
    "islem_hatasi",
    "dikkat_hatasi",
    "soruyu_anlayamama",
    "strateji_eksikligi",
    "kavram_yanilgisi",
  ];

  // Ahmet'e ağırlıklı olarak "Kareköklü İfadeler" sorusu ekle (analiz sayfasında uyarı tetiklesin)
  const plan = [
    { student: "Ahmet Yılmaz", topic: "Kareköklü İfadeler", count: 11, daysBack: 20 },
    { student: "Ahmet Yılmaz", topic: "Üslü İfadeler", count: 6, daysBack: 45 },
    { student: "Ahmet Yılmaz", topic: "Çarpanlar ve Katlar", count: 4, daysBack: 60 },
    { student: "Ayşe Demir", topic: "Doğrusal Denklemler", count: 8, daysBack: 15 },
    { student: "Ayşe Demir", topic: "Üçgenler", count: 5, daysBack: 40 },
    { student: "Mehmet Kaya", topic: "Veri Analizi", count: 7, daysBack: 10 },
    { student: "Mehmet Kaya", topic: "Eşitsizlikler", count: 3, daysBack: 5 },
  ];

  let totalQuestions = 0;

  for (const p of plan) {
    for (let i = 0; i < p.count; i++) {
      const daysAgo = Math.max(0, p.daysBack - i * 2 - Math.floor(Math.random() * 3));
      const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const { data: q, error } = await supabase
        .from("questions")
        .insert({
          student_id: studentIds[p.student],
          teacher_id: teacherId,
          subject_id: subject.id,
          topic_id: topicByName[p.topic],
          image_url: PLACEHOLDER_IMG,
          student_note: "Bu soruda nereden başlayacağımı anlamadım.",
          status,
          created_at: createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        continue;
      }

      if (status === "TAMAMLANDI" || status === "TEKRAR_COZULECEK") {
        const tag = tags[Math.floor(Math.random() * tags.length)];
        await supabase.from("question_tags").insert({ question_id: q.id, tag });
      }

      totalQuestions++;
    }
  }

  console.log(`\nTamamlandı. ${totalQuestions} demo soru oluşturuldu.`);
  console.log("\nGiriş bilgileri (şifre hepsinde: Demo1234!):");
  console.log("  Öğretmen: ogretmen@demo.com");
  students.forEach((s) => console.log(`  Öğrenci:  ${s.email}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
