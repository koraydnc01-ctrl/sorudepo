"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell() {
  const supabase = createClient();
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { count: unread } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setCount(unread ?? 0);
    }
    load();
  }, []);

  if (count === 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-status-bekliyor text-white text-[10px] font-medium">
      {count > 9 ? "9+" : count}
    </span>
  );
}
