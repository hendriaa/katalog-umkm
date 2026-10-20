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

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memeriksa sesi admin di server, validasi panjang minimal 8 karakter, dan kecocokan konfirmasi.
 */
export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  if (!(data instanceof FormData)) {
    return { error: "Data formulir tidak valid." };
  }

  const passwordBaru = data.get("password_baru")?.toString() || "";
  const konfirmasiPassword = data.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  try {
    const supabase = await createSessionClient();

    // Verifikasi admin yang sedang login
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Sesi telah berakhir atau Anda belum login." };
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (error) {
      return { error: error.message || "Gagal mengganti password." };
    }

    return { success: true, message: "Password berhasil diganti." };
  } catch (err) {
    return {
      error: err.message || "Terjadi kesalahan pada server saat mengganti password.",
    };
  }
}

export const masukAdmin = loginAdmin;
export const logoutAdmin = keluarAdmin;
export const ubahPassword = gantiPassword;
