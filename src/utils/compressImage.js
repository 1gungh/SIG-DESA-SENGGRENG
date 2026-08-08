/**
 * compressImage.js
 * Kompres & resize gambar di sisi browser sebelum diupload ke Supabase Storage,
 * memakai Canvas API (tidak perlu install library tambahan).
 *
 * Taruh file ini di src/utils/compressImage.js
 */

/**
 * @param {File} file - file gambar asli dari <input type="file">
 * @param {Object} opsi
 * @param {number} opsi.maxWidth - lebar maksimum hasil kompres (default 1280px)
 * @param {number} opsi.quality - kualitas JPEG 0-1 (default 0.75)
 * @returns {Promise<File>} file baru hasil kompres, format JPEG
 */
export function compressImage(file, { maxWidth = 1280, quality = 0.75 } = {}) {
  return new Promise((resolve, reject) => {
    // Kalau bukan file gambar, lewati saja (misal PDF, dll — tidak relevan di sini
    // tapi jaga-jaga)
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Resize proporsional kalau lebih lebar dari maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal mengompres gambar"));
              return;
            }
            // Ganti nama file jadi .jpg karena hasil kompres selalu JPEG
            const namaBaru = file.name.replace(/\.[^.]+$/, "") + ".jpg";
            const fileBaru = new File([blob], namaBaru, { type: "image/jpeg" });
            resolve(fileBaru);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar untuk dikompres"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}