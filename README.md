# StudyMate AI - Ná»n Táº£ng Trá»£ LÃ½ Há»c Táº­p ThÃ´ng Minh

> **Äá»“ Ã¡n mÃ´n há»c**: Láº­p trÃ¬nh Web NÃ¢ng Cao  
> **Kiáº¿n trÃºc**: Client-Server (Frontend React + Backend Node.js Express)  
> **CÆ¡ sá»Ÿ dá»¯ liá»‡u**: SQLite  
> **TrÃ­ tuá»‡ nhÃ¢n táº¡o**: Google Gemini API

---

## 1. Giá»›i Thiá»‡u Dá»± Ãn

**StudyMate AI** lÃ  má»™t á»©ng dá»¥ng web há»— trá»£ sinh viÃªn há»c táº­p thÃ´ng minh. á»¨ng dá»¥ng cung cáº¥p cÃ¡c tÃ­nh nÄƒng trá»ng tÃ¢m:

- **Há»i Ä‘Ã¡p kiáº¿n thá»©c**: Giáº£i Ä‘Ã¡p cÃ¡c khÃ¡i niá»‡m, bÃ i táº­p thÃ´ng qua Gemini AI.
- **TÃ³m táº¯t bÃ i há»c**: Cháº¯t lá»c kiáº¿n thá»©c cá»‘t lÃµi tá»« cÃ¡c tÃ i liá»‡u hoáº·c bÃ i giáº£ng dÃ i.
- **Táº¡o cÃ¢u há»i tráº¯c nghiá»‡m Ã´n táº­p**: Sinh ngáº«u nhiÃªn cÃ¡c cÃ¢u há»i tráº¯c nghiá»‡m kÃ¨m giáº£i thÃ­ch chi tiáº¿t theo tá»«ng chá»§ Ä‘á» mÃ´n há»c.
- **LÆ°u trá»¯ lá»‹ch sá»­ há»c táº­p**: Tá»± Ä‘á»™ng lÆ°u láº¡i cÃ¡c phiÃªn há»i Ä‘Ã¡p, tÃ³m táº¯t vÃ  quiz vÃ o cÆ¡ sá»Ÿ dá»¯ liá»‡u cÃ¡ nhÃ¢n cá»§a tá»«ng sinh viÃªn.

---

## 2. PhÃ¢n CÃ´ng TrÃ¡ch Nhiá»‡m Trong NhÃ³m

| ThÃ nh viÃªn                          | Phá»¥ trÃ¡ch                           | Pháº¡m vi cÃ´ng viá»‡c                                                                                                                   |
| :---------------------------------- | :---------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| Pháº¡m Duy KhÃ¡nh                      | Giao diá»‡n vÃ  tráº£i nghiá»‡m ngÆ°á»i dÃ¹ng | PhÃ¡t triá»ƒn Frontend React, xÃ¢y dá»±ng giao diá»‡n vÃ  tá»‘i Æ°u tráº£i nghiá»‡m ngÆ°á»i dÃ¹ng.                                                     |
| Nguyá»…n Trung Äá»©c                    | CÃ¡c chá»©c nÄƒng AI                    | PhÃ¡t triá»ƒn Backend vÃ  tÃ­ch há»£p Gemini API cho cÃ¡c chá»©c nÄƒng há»i Ä‘Ã¡p, tÃ³m táº¯t tÃ i liá»‡u vÃ  táº¡o cÃ¢u há»i tráº¯c nghiá»‡m.                   |
| Äá»— ÄÄƒng DÆ°Æ¡ng                       | Lá»‹ch sá»­ há»c táº­p vÃ  kiá»ƒm thá»­         | Xá»­ lÃ½ lá»‹ch sá»­ há»c táº­p, lÃ m viá»‡c vá»›i Database vÃ  thá»±c hiá»‡n kiá»ƒm thá»­ há»‡ thá»‘ng.                                                        |
| Mai Tiáº¿n Äáº¡t (TrÆ°á»Ÿng nhÃ³m ká»¹ thuáº­t) | Auth, TÃ­ch há»£p, Test, Deploy, Docs  | XÃ¡c thá»±c JWT, cáº¥u hÃ¬nh SQLite, xÃ¢y dá»±ng middleware, káº¿t ná»‘i Gemini backend, kiá»ƒm thá»­ báº±ng Jest/Supertest vÃ  xÃ¢y dá»±ng tÃ i liá»‡u nhÃ³m. |

---

## 3. CÃ´ng Nghá»‡ Sá»­ Dá»¥ng

- **Frontend**: React (JavaScript), Vite, Axios, React Router DOM, Lucide Icons.
- **Backend**: Node.js, Express (ES Modules), SQLite (`better-sqlite3`), BcryptJS, JSON Web Token (JWT).
- **AI Service**: Google Gemini API (gá»i Ä‘á»™c quyá»n vÃ  báº£o máº­t táº¡i Backend qua `@google/genai`).
- **Kiá»ƒm thá»­ tá»± Ä‘á»™ng**: Jest, Supertest.

---

## 4. YÃªu Cáº§u MÃ´i TrÆ°á»ng CÃ i Äáº·t

TrÆ°á»›c khi cháº¡y dá»± Ã¡n, hÃ£y Ä‘áº£m báº£o mÃ¡y tÃ­nh Ä‘Ã£ cÃ i Ä‘áº·t:

1. **Node.js**: PhiÃªn báº£n `>= 18.0.0` (Khuyáº¿n nghá»‹ phiÃªn báº£n LTS `v20.x` hoáº·c `v24.x`).
2. **npm**: PhiÃªn báº£n `>= 9.x` (Ä‘i kÃ¨m sáºµn vá»›i Node.js).
3. **Git**: PhiÃªn báº£n má»›i nháº¥t Ä‘á»ƒ quáº£n lÃ½ phiÃªn báº£n.

Kiá»ƒm tra báº±ng terminal:

```bash
node -v
npm -v
git --version
```

---

## 5. HÆ°á»›ng Dáº«n Thiáº¿t Láº­p & Khá»Ÿi Cháº¡y Dá»± Ãn (Sau Khi HoÃ n Táº¥t CÃ i Äáº·t)

### BÆ°á»›c 1: Clone mÃ£ nguá»“n vá» mÃ¡y

```bash
git clone https://github.com/MaiTienDat1502/studymate-ai.git
cd studymate-ai
```

### BÆ°á»›c 2: Thiáº¿t láº­p Backend

```bash
cd backend
# 1. CÃ i Ä‘áº·t cÃ¡c thÆ° viá»‡n cáº§n thiáº¿t (khi Ä‘áº¿n Giai Ä‘oáº¡n 2)
npm install

# 2. Táº¡o file biáº¿n mÃ´i trÆ°á»ng tá»« máº«u
cp .env.example .env
# (TrÃªn Windows PowerShell: Copy-Item .env.example .env)

# 3. Má»Ÿ file .env vÃ  Ä‘iá»n:
# - Táº¡o mÃ£ JWT_SECRET ngáº«u nhiÃªn báº±ng lá»‡nh:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# - Äiá»n GEMINI_API_KEY láº¥y tá»« Google AI Studio

# 4. Khá»Ÿi cháº¡y server backend á»Ÿ cháº¿ Ä‘á»™ phÃ¡t triá»ƒn
npm run dev
# Server láº¯ng nghe táº¡i http://localhost:5000
```

### BÆ°á»›c 3: Thiáº¿t láº­p Frontend

Má»Ÿ má»™t cá»­a sá»• terminal má»›i:

```bash
cd frontend
# 1. CÃ i Ä‘áº·t thÆ° viá»‡n frontend
npm install

# 2. Khá»Ÿi cháº¡y giao diá»‡n React vá»›i Vite
npm run dev
# Má»Ÿ trÃ¬nh duyá»‡t táº¡i http://localhost:5173
```

### BÆ°á»›c 4: Cháº¡y kiá»ƒm thá»­ tá»± Ä‘á»™ng (Testing)

Táº¡i thÆ° má»¥c `backend/`:

```bash
npm test
```

---

## 6. TÃ i Liá»‡u Tham Kháº£o DÃ nh Cho ThÃ nh ViÃªn NhÃ³m

- [Äáº·c táº£ API Contract](docs/api-specs.md)
- [Quy chuáº©n lÃ m viá»‡c nhÃ³m vá»›i Git & Pull Request](docs/git-workflow.md)
- [CÆ¡ sá»Ÿ dá»¯ liá»‡u SQLite Schema](docs/database-schema.sql)

