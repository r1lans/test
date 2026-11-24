# Global Education Karshi — demo (sayt + telefon ilovasi)

Bitta papka = sayt ham, telefon ilovasi ham (PWA).

## 1. GitHub Pages’ga qo‘yish (sayt)
1. GitHub’da yangi repo oching, masalan `gek-demo` (Public).
2. **Add file → Upload files** — shu papkadagi hamma fayllarni tashlang: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`.
3. **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. 1–2 daqiqadan keyin manzil: `https://<github-login>.github.io/gek-demo/`

## 2. Telefonga ilova sifatida o‘rnatish
- **Android (Chrome):** saytni oching → ⋮ menyu → **Ilovani o‘rnatish / Add to Home screen**.
- **iPhone (Safari):** saytni oching → Ulashish → **Add to Home Screen**.
Ilova o‘z ikonkasi bilan ochiladi, brauzer paneli ko‘rinmaydi, internetsiz ham ochiladi.

## 3. Android APK fayl kerak bo‘lsa
1. https://www.pwabuilder.com ga GitHub Pages manzilini kiriting.
2. **Package for stores → Android → Generate** — APK/AAB yuklab olinadi.
3. APK’ni telefonga yuborib o‘rnatish mumkin; Google Play’ga chiqarish uchun Google Play Console akkaunti kerak (bir martalik $25).

## Muhim
- Bu demo: ma’lumotlar namunaviy va faqat shu brauzerda saqlanadi.
- Haqiqiy versiya uchun server (bazasi, login, Telegram-bot, mock saytdan natijalarni qabul qilish) qo‘shiladi.
