# Kelime Bahçesi 🌱

> "Her kelime, çiftliğime yeni bir arkadaş getiriyor."

**Kelime Bahçesi**, 4–7 yaş arası çocuklar ve dil/konuşma terapistleri için tasarlanmış sevimli bir çiftlik koleksiyonu ve gelişim **Süper Uygulamasıdır** (Super App).

Oyun çocukların kelime dağarcığını, ses üretimini, dinleme/tanıma becerilerini ve kavram farkındalıklarını eğlenceli, stressiz ve teşvik edici bir ortamda destekler.

---

## 🎮 Özellikler

- **Sıfır Başarısızlık Hissi:** Yanlış cevaplarda kırmızı renk, buzzer veya ceza yoktur. Sadece nazik bir *"Hadi tekrar deneyelim!"* yönergesi ve hafif sallanma efekti verilir.
- **Duyusal Pekiştirme:** Doğru cevaplarda neşeli "bingg" tınısı, konfeti patlaması ve animasyonlu yeşil onay rozeti (✓).
- **Rehber Karakter (Pıtır):** Sevimli bahçıvan kuş Pıtır, çocuklara her ekranda hem görsel konuşma balonu hem de Türkçe sesli yönergeler verir.
- **Süper App Mimarisi (`HubScene`):**
  - **Kelime Bahçesi 🌱 (Aktif):** 8 çiftlik hayvanı ve 3 terapi mini oyunu.
  - **Hece Adası 🏝️ (Çok Yakında):** Hece farkındalığı ve ritim.
  - **Ses Treni 🚂 (Çok Yakında):** Fonolojik farkındalık ve ses vagonları.
  - **Cümle Ormanı 🌳 (Çok Yakında):** Cümle kurma ve ifade edici dil.
- **Terapist Kontrol Paneli (`TherapistScene`):**
  - Çocukların yanlışlıkla açmasını önleyen **3 saniye basılı tutma koruması**.
  - Hedef ses filtreleme (/r/, /s/, /k/, /t/ vb.).
  - Hayvan seçimi ve açma/kapatma.
  - Tur sayısı (3, 5, 8) ve kart sayısı (2 veya 3) yapılandırması.
  - Seans istatistikleri (yalnızca yerel `localStorage` içinde, veri gizliliği odaklı).
- **8 Çiftlik Hayvanı ve Vektör Çizimler:**
  - Kedi, Köpek, Kuzu, Tavuk, İnek, Ördek, At, Tavşan.

---

## 🕹️ Mini Oyunlar

1. **Bu Kim? (Dinleme & Kelime Tanıma):** Pıtır hayvanın adını seslendirir, çocuk doğru kartı seçer.
2. **Tekrar Et! (Artikülasyon):** Çocuk terapisti veya ebeveyniyle kelimeyi 3 kez tekrar eder. Terapist onayıyla yıldız kazanılır.
3. **Ne Yer? (Kategori & Anlamsal İlişki):** Hayvanın doğru yemini sürükleyip yedirme veya dokunarak eşleme oyunu.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18 veya üzeri önerilir)
- npm veya yarn

### Geliştirme Ortamı
```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda açın:
`http://localhost:8080/`

**Varsayılan Giriş Bilgileri:**
- **Kullanıcı Adı:** İstediğiniz isim veya hızlı profil seçimi (*Ali*, *Elif*, *Profil 1*)
- **Erişim Şifresi:** `1234` (veya `TERAPI`, `KELIME`)

### Üretim (Production) Derlemesi
```bash
npm run build-nolog
```
Çıktı `dist/` dizininde statik web sitesi olarak üretilir.

---

## 🛠️ Teknolojiler
- **Oyun Motoru:** Phaser 4.0.0
- **Dil:** TypeScript 5.7
- **Paketleyici:** Vite 6.3
- **Ses:** Web Audio API & Web Speech Synthesis API
- **Vektör Varlıklar:** Özel el çizimi SVG & 512x512 şeffaf PNG varlıklar

---

## 📄 Lisans
MIT License - Ersin Aka
