-- ============================================================
-- SORU TAKİP — İlk migration
-- Şema + RLS politikaları + seed data (dersler & LGS konuları)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUM TİPLERİ
-- ------------------------------------------------------------
create type user_role as enum ('teacher', 'student');

create type question_status as enum (
  'BEKLIYOR',
  'DERSTE_ELE_ALINDI',
  'TEKRAR_COZULECEK',
  'OGRENCI_COZDU',
  'TAMAMLANDI'
);

create type question_tag as enum (
  'bilgi_eksikligi',
  'islem_hatasi',
  'dikkat_hatasi',
  'soruyu_anlayamama',
  'strateji_eksikligi',
  'kavram_yanilgisi'
);

create type notification_type as enum (
  'yeni_soru',
  'tekrar_cozulecek',
  'ogrenci_cozdu'
);

-- ------------------------------------------------------------
-- USERS  (auth.users ile 1-1; role burada tutulur)
-- ------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- TEACHERS
-- ------------------------------------------------------------
create table public.teachers (
  id uuid primary key references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- STUDENTS
-- ------------------------------------------------------------
create table public.students (
  id uuid primary key references public.users(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- INVITE_CODES  (öğrenci daha kayıt olmadan önce öğretmen kod üretir)
-- ------------------------------------------------------------
create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  student_name text not null,
  used boolean not null default false,
  student_id uuid references public.students(id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

-- ------------------------------------------------------------
-- TEACHER_STUDENTS (çoklu-öğretmen ihtimaline karşı bağlantı tablosu)
-- ------------------------------------------------------------
create table public.teacher_students (
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, student_id)
);

-- ------------------------------------------------------------
-- SUBJECTS / TOPICS
-- ------------------------------------------------------------
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  unique (subject_id, name)
);

-- ------------------------------------------------------------
-- QUESTIONS
-- ------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_id uuid not null references public.subjects(id),
  topic_id uuid not null references public.topics(id),
  image_url text not null,
  student_note text,
  status question_status not null default 'BEKLIYOR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index questions_student_idx on public.questions(student_id);
create index questions_teacher_idx on public.questions(teacher_id);
create index questions_topic_idx on public.questions(topic_id);
create index questions_status_idx on public.questions(status);
create index questions_created_idx on public.questions(created_at);

-- image'lar ayrı tabloda tutuluyor (ileride çoklu foto desteği için)
create table public.question_images (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table public.question_status_history (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  old_status question_status,
  new_status question_status not null,
  changed_at timestamptz not null default now()
);

create table public.question_tags (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  tag question_tag not null,
  created_at timestamptz not null default now(),
  unique (question_id, tag)
);

create table public.teacher_notes (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type notification_type not null,
  question_id uuid references public.questions(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, is_read);

-- ------------------------------------------------------------
-- updated_at otomatik güncelleme
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger questions_set_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

-- status değiştiğinde otomatik geçmiş kaydı + resolved_at
create or replace function public.log_question_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into public.question_status_history(question_id, old_status, new_status)
    values (new.id, old.status, new.status);

    if new.status = 'TAMAMLANDI' then
      new.resolved_at = now();
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger questions_log_status
  before update on public.questions
  for each row execute function public.log_question_status_change();

-- ------------------------------------------------------------
-- BİLDİRİMLER: otomatik tetikleyiciler
-- ------------------------------------------------------------

-- yeni soru yüklendiğinde öğretmene bildirim
create or replace function public.notify_new_question()
returns trigger as $$
begin
  insert into public.notifications(user_id, type, question_id)
  values (new.teacher_id, 'yeni_soru', new.id);
  return new;
end;
$$ language plpgsql;

create trigger questions_notify_new
  after insert on public.questions
  for each row execute function public.notify_new_question();

-- durum değişikliklerinde ilgili tarafa bildirim
create or replace function public.notify_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    if new.status = 'TEKRAR_COZULECEK' then
      insert into public.notifications(user_id, type, question_id)
      values (new.student_id, 'tekrar_cozulecek', new.id);
    elsif new.status = 'OGRENCI_COZDU' then
      insert into public.notifications(user_id, type, question_id)
      values (new.teacher_id, 'ogrenci_cozdu', new.id);
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger questions_notify_status
  after update on public.questions
  for each row execute function public.notify_status_change();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.users enable row level security;
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.invite_codes enable row level security;
alter table public.teacher_students enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_images enable row level security;
alter table public.question_status_history enable row level security;
alter table public.question_tags enable row level security;
alter table public.teacher_notes enable row level security;
alter table public.notifications enable row level security;

-- users: herkes kendi satırını okuyabilir/güncelleyebilir
create policy "users_select_own" on public.users
  for select using (id = auth.uid());
create policy "users_insert_own" on public.users
  for insert with check (id = auth.uid());
create policy "users_update_own" on public.users
  for update using (id = auth.uid());

-- teachers: kendi kaydı
create policy "teachers_select_own" on public.teachers
  for select using (id = auth.uid());
create policy "teachers_insert_own" on public.teachers
  for insert with check (id = auth.uid());

-- students: kendi kaydı VEYA bağlı olduğu öğretmen görebilir
create policy "students_select_self_or_teacher" on public.students
  for select using (
    id = auth.uid()
    or teacher_id = auth.uid()
  );
create policy "students_insert_own" on public.students
  for insert with check (id = auth.uid());
create policy "students_update_own_or_teacher" on public.students
  for update using (id = auth.uid() or teacher_id = auth.uid());

-- invite_codes: öğretmen kendi ürettiklerini görür. Öğrenci tarafı bu tabloya
-- doğrudan erişmez — kod doğrulama /api/davet-kullan route'unda service role ile yapılır.
create policy "invite_codes_select_own_teacher" on public.invite_codes
  for select using (teacher_id = auth.uid());
create policy "invite_codes_insert_own_teacher" on public.invite_codes
  for insert with check (teacher_id = auth.uid());

-- teacher_students
create policy "teacher_students_select" on public.teacher_students
  for select using (teacher_id = auth.uid() or student_id = auth.uid());
create policy "teacher_students_insert" on public.teacher_students
  for insert with check (teacher_id = auth.uid());

-- subjects & topics: herkes okuyabilir (referans veri)
create policy "subjects_select_all" on public.subjects for select using (true);
create policy "topics_select_all" on public.topics for select using (true);

-- questions: öğrenci kendi sorularını, öğretmen kendi öğrencilerinin sorularını görür
create policy "questions_select_own" on public.questions
  for select using (student_id = auth.uid() or teacher_id = auth.uid());
create policy "questions_insert_own_student" on public.questions
  for insert with check (student_id = auth.uid());
create policy "questions_update_owner" on public.questions
  for update using (student_id = auth.uid() or teacher_id = auth.uid());

-- question_images
create policy "question_images_select" on public.question_images
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.student_id = auth.uid() or q.teacher_id = auth.uid())
    )
  );
create policy "question_images_insert" on public.question_images
  for insert with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id and q.student_id = auth.uid()
    )
  );

-- question_status_history
create policy "qsh_select" on public.question_status_history
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.student_id = auth.uid() or q.teacher_id = auth.uid())
    )
  );

-- question_tags: sadece ilgili öğretmen ekleyip görebilir, öğrenci de görebilir
create policy "question_tags_select" on public.question_tags
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.student_id = auth.uid() or q.teacher_id = auth.uid())
    )
  );
create policy "question_tags_insert" on public.question_tags
  for insert with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id and q.teacher_id = auth.uid()
    )
  );
create policy "question_tags_delete" on public.question_tags
  for delete using (
    exists (
      select 1 from public.questions q
      where q.id = question_id and q.teacher_id = auth.uid()
    )
  );

-- teacher_notes
create policy "teacher_notes_select" on public.teacher_notes
  for select using (
    exists (
      select 1 from public.questions q
      where q.id = question_id
        and (q.student_id = auth.uid() or q.teacher_id = auth.uid())
    )
  );
create policy "teacher_notes_insert" on public.teacher_notes
  for insert with check (
    exists (
      select 1 from public.questions q
      where q.id = question_id and q.teacher_id = auth.uid()
    )
  );

-- notifications: sadece kendi bildirimlerini görür
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());
create policy "notifications_insert_any" on public.notifications
  for insert with check (true);

-- ------------------------------------------------------------
-- SEED: Dersler ve LGS Matematik konuları
-- ------------------------------------------------------------
insert into public.subjects (name) values ('Matematik');

insert into public.topics (subject_id, name, sort_order)
select s.id, t.name, t.sort_order
from public.subjects s
cross join (values
  ('Çarpanlar ve Katlar', 1),
  ('Üslü İfadeler', 2),
  ('Kareköklü İfadeler', 3),
  ('Veri Analizi', 4),
  ('Basit Olayların Olma Olasılığı', 5),
  ('Cebirsel İfadeler ve Özdeşlikler', 6),
  ('Doğrusal Denklemler', 7),
  ('Eşitsizlikler', 8),
  ('Üçgenler', 9),
  ('Eşlik ve Benzerlik', 10),
  ('Dönüşüm Geometrisi', 11),
  ('Geometrik Cisimler', 12)
) as t(name, sort_order)
where s.name = 'Matematik';

-- ------------------------------------------------------------
-- STORAGE: soru fotoğrafları için bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

create policy "question_images_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'question-images' and auth.role() = 'authenticated');

create policy "question_images_storage_select"
  on storage.objects for select
  using (bucket_id = 'question-images');
