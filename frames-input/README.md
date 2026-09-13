# 🖼️ Custom Frames Input Directory

Tempatkan gambar frame **JPG** atau **JPEG** kamu di dalam folder ini.

Setelah itu, buka terminal (CMD/VSCode) dan jalankan:
```bash
npm run process-frames
```

Script akan secara otomatis:
1. Membaca gambar JPG kamu.
2. Memperjelas kualitasnya (sharpening + color enhancement).
3. Membuat **lubang transparan (transparent hole)** di tengah gambar.
4. Menyimpannya sebagai file **PNG** ke folder `public/frames/`.

Setelah selesai, gambar PNG siap digunakan di dalam web Photobox!
Kamu hanya perlu mendaftarkannya di file `src/lib/frames.ts`.
