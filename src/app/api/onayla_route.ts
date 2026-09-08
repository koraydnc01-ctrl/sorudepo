import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { teacherId } = await request.json();
  if (!teacherId) {
    return NextResponse.json({ error: "teacherId zorunludur." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!me?.is_admin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("teachers")
    .update({ approved: true })
    .eq("id", teacherId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
