# FiltraLens — Photo Filter Studio

Generator filter foto berbasis web dengan algoritma determinan (pixel-by-pixel).
Semua pemrosesan dilakukan **di browser**, tanpa upload ke server.

## Struktur File

```
photo-filter-generator/
├── script
  ├── about.js
  ├── app.js
  ├── landingpage.js
├── src
├── style
  ├── about.css
  ├── landingpage.css
  ├── style.css
├── index.html  
├── about.html   
├── FilterPage.html      
└── README.md    
```

## Cara Pakai

1. Buka `index.html` di browser modern (Chrome, Firefox, Edge, Safari)
2. Upload foto dengan klik atau seret ke zona upload
3. Pilih filter preset dari grid
4. Fine-tune dengan slider (Kecerahan, Kontras, Saturasi, Kehangatan, Pudar)
5. Tambahkan Blend, Vignette, dan Grain opsional
6. Unduh hasil dalam format JPEG / PNG / WEBP

## Filter Tersedia

| Filter    | Deskripsi                              |
|-----------|----------------------------------------|
| Original  | Foto asli tanpa perubahan              |
| Grayscale | Abu-abu menggunakan luminance weights  |
| Sepia     | Efek foto klasik coklat keemasan       |
| Warm      | Nada hangat, merah-kuning              |
| Cool      | Nada dingin, biru-cyan                 |
| Vintage   | Gaya retro faded                       |
| Noir      | Hitam putih high-contrast              |
| Chrome    | Metalik silver                         |
| Fade      | Soft washed-out                        |
| Sunset    | Oranye hangat matahari terbenam        |
| Forest    | Hijau emerald alam                     |
| Invert    | Negatif foto                           |

## Fitur

- **12 Filter Preset** dengan thumbnail langsung
- **5 Fine-tune Slider**: brightness, contrast, saturation, warmth, fade
- **Blend Intensity**: campurkan filter dengan foto asli
- **Vignette**: efek gelap di sudut
- **Film Grain**: tekstur grain analog
- **Compare Mode**: geser untuk bandingkan sebelum/sesudah
- **Export**: JPEG / PNG / WEBP dengan kontrol kualitas
- **Copy Clipboard**: salin gambar langsung
- **Keyboard Shortcuts**: D (download), R (reset), C (compare)
- **Drag & Drop**: seret foto langsung ke halaman

## Teknologi

- Vanilla HTML / CSS / JavaScript — tanpa dependency
- Canvas API untuk pemrosesan pixel determinan
- FileReader API untuk baca file lokal
- Clipboard API untuk salin ke clipboard

## Algoritma Filter

Setiap filter menggunakan fungsi determinan pixel-per-pixel:
```js
// Contoh Sepia
apply: (r, g, b) => [
  Math.min(255, r * 0.393 + g * 0.769 + b * 0.189),
  Math.min(255, r * 0.349 + g * 0.686 + b * 0.168),
  Math.min(255, r * 0.272 + g * 0.534 + b * 0.131),
]
```
