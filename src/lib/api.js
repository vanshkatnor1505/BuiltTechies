import { supabase } from "./supabase";

export async function fetchWithSupabaseSession(input, init = {}) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error("Please sign in to use AI features.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(input, { ...init, headers });
}
