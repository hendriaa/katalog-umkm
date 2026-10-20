"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/session";

/**
 * Server Action untuk login admin menggunakan Supabase Auth.
 * Menerima FormData dari form login dan menetapkan cookie sesi.
 */
export async function loginAdmin(prevState, formData) {
  // Mendukung pemanggilan via useActionState(prevState, formData) atau langsung (formData)
  const data = formData instanceof FormData ? formData : prevState;

  if (!(data instanceof FormData)) {
    return { error: "Data formulir tidak valid." };
  }

  const email = data.get("email")?.toString().trim();
  const password = data.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let berhasil = false;
  let pesanError = null;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      pesanError =
        error.message === "Invalid login credentials"
          ? "Email atau password salah. Silakan periksa kembali."
          : error.message || "Gagal masuk. Silakan coba lagi.";
    } else {
      berhasil = true;
    }
  } catch (err) {
    pesanError = err.message || "Terjadi kesalahan pada server saat mencoba masuk.";
  }

  if (pesanError) {
    return { error: pesanError };
  }

  if (berhasil) {
    redirect("/admin");
  }
}

/**
 * Server Action untuk keluar (logout) admin.
 * Mengakhiri sesi Supabase Auth, menghapus cookie, lalu mengalihkan ke /admin/login.
 */
export async function keluarAdmin() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika sudah tidak ada sesi aktif
  }

  redirect("/admin/login");
}

export const masukAdmin = loginAdmin;
export const logoutAdmin = keluarAdmin;

