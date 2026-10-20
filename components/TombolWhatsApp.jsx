import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  if (!produk) return null;

  // Format nomor WhatsApp internasional tanpa tanda + dan awalan 0 diubah menjadi 62
  const nomor = (toko.nomorWhatsApp || "").replace(/\D/g, "").replace(/^0/, "62");
  const pesan = `Halo, saya mau pesan ${produk.nama} (${formatRupiah(produk.harga)})`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={urlWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
