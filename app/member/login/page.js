// app/member/login/page.jsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MemberLoginForm from "./MemberLoginForm";

export default async function MemberLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/member/dashboard");

  return <MemberLoginForm />;
}
