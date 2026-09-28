# 🚀 Sheetbotics WhatsApp SaaS — AWS Windows Server Deployment Guide

Ye guide step-by-step batati hai ki **GitHub pe kon kon si files dalni hain**, aur **AWS Windows Server** pe is system ko `https://whatsapp.sheetbotics.in` domain ke sath live kaise chalana hai.

---

## 📁 Part 1: GitHub pe Kon-Kon si Files Dalni Hain?

### ✅ Ye Files GitHub pe JAYENGI (Include):
| File / Folder | Kaam / Description |
|---|---|
| `src/` | Saare React components, pages, context, styles, logic |
| `server/` | `index.js` (Express backend, Meta webhook gateway, API handlers) |
| `server/db.json.example` | Database configuration template |
| `index.html` | Frontend entry point |
| `package.json` | Project dependencies aur run scripts |
| `package-lock.json` | Exact dependency lock file |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Styling and color configuration |
| `postcss.config.js` | CSS post-processor config |
| `.gitignore` | Ignore list taaki unwanted files na jayein |
| `production_start.bat` | Windows Server pe 1-click start script |
| `start.bat` | Local development launch script |
| `SYSTEM_BRAIN.md` | Architecture and platform documentation |
| `README.md` | Project overview |

---

### ❌ Ye Files GitHub pe KABHI NAHI DALNI (Strictly Excluded):
> Note: `.gitignore` file humne pehle se bana di hai jo in files ko automatically block kar degi.

| File / Folder | Kyu Nahi Dalna? |
|---|---|
| `node_modules/` | Bahut heavy hoti hai (200MB+), server pe `npm install` se khud banegi. |
| `dist/` | Production build folder hai, server pe `npm run build` se generate hogi. |
| `server/db.json` | Isme aapke live tokens aur customer data hota hai (leak ho sakta hai). |
| `*.log` | Debugging logs jo runtime pe bante hain. |
| `.env` | Secret environment keys (agar banayein). |

---

## 📤 Part 2: GitHub pe Push Kaise Karein?

Apne local computer ke terminal / VS Code / Command Prompt me ye commands chalayein:

```bash
# 1. Git repository initialize karein (agar pehle se nahi hai)
git init

# 2. Files add karein (.gitignore automatically node_modules & dist ko chhod dega)
git add .

# 3. Commit banayein
git commit -m "feat: complete Sheetbotics WhatsApp Cloud API SaaS with Meta health and webhooks"

# 4. GitHub main branch set karein
git branch -M main

# 5. Apni GitHub repository ka URL link karein (Apna repo URL daalein)
git remote add origin https://github.com/YOUR_USERNAME/meta_whatsapp_saas.git

# 6. GitHub pe push karein
git push -u origin main
```

---

## 🖥️ Part 3: AWS Windows Server Setup

### Step 1: AWS Security Group (Firewall Rules)
AWS Console me jaakar apne Windows EC2 Instance ke **Security Group** me **Inbound Rules** check karein:
- **Port 80 (HTTP)** — Source: `0.0.0.0/0` (Anywhere)
- **Port 443 (HTTPS)** — Source: `0.0.0.0/0` (Anywhere) ⚠️ *Meta Webhook ke liye mandatory hai*
- **Port 3389 (RDP)** — Source: `My IP` (Server Remote Desktop connect karne ke liye)
- *(Optional)* **Port 5000** — Testing ke liye open kar sakte hain.

---

### Step 2: Domain DNS Pointing (`whatsapp.sheetbotics.in`)
Apne DNS provider (Cloudflare, GoDaddy, Hostinger, etc.) me jaakar:
1. **Type:** `A`
2. **Name / Host:** `whatsapp`
3. **Value / Points to:** `YOUR_AWS_WINDOWS_PUBLIC_IP` (e.g. `13.234.xxx.xxx`)
4. **TTL:** `Auto` ya `300`

---

### Step 3: AWS Windows Server ke Andar Softwares Install Karein
Server pe Remote Desktop (RDP) se login karein aur browser khol kar ye 2 softwares install karein:
1. **Node.js LTS** (v20 ya v22 LTS) — [https://nodejs.org](https://nodejs.org)
2. **Git for Windows** — [https://git-scm.com/download/win](https://git-scm.com/download/win)

---

### Step 4: Code Clone aur Build Karein
Windows Server me **PowerShell** ya **Command Prompt** khol kar:

```cmd
# 1. Project folder me jayein
cd C:\

# 2. GitHub se repository clone karein
git clone https://github.com/YOUR_USERNAME/meta_whatsapp_saas.git

# 3. Folder ke andar jayein
cd meta_whatsapp_saas

# 4. Dependencies install karein
npm install

# 5. Production build banayein (dist folder banega)
npm run build
```

---

## 🔒 Part 4: Domain & Free SSL Setup (Caddy Server - Recommended)

Meta Cloud API Webhook **sirf valid HTTPS (SSL)** URL accept karta hai. 
Windows Server par automatic free Let's Encrypt SSL chalane ka sabse aasan aur fast tareeqa **Caddy** hai:

1. Windows Server me **Caddy for Windows** download karein:
   - Link: [https://caddyserver.com/download](https://caddyserver.com/download) (Windows amd64 exe download karein).
   - `caddy.exe` ko `C:\caddy\caddy.exe` me rakh dein.
2. `C:\caddy\` folder me ek file banayein jiska naam ho `Caddyfile` (bina kisi extension ke):
   ```caddy
   whatsapp.sheetbotics.in {
       reverse_proxy localhost:5000
   }
   ```
3. Command Prompt me run karein:
   ```cmd
   cd C:\caddy
   caddy run
   ```
   🎉 **Caddy automatically `whatsapp.sheetbotics.in` ke liye free SSL certificate issue aur renew kar dega!**
   Ab aapka app `https://whatsapp.sheetbotics.in` par live open hoga.

---

## ⚙️ Part 5: Server ko 24/7 Running Rakhna (PM2)

Remote Desktop band karne par bhi Node.js backend aur webhooks chalu rahein, iske liye **PM2** use karein:

```cmd
# PM2 globally install karein
npm install -g pm2

# WhatsApp Platform start karein
cd C:\meta_whatsapp_saas
pm2 start server/index.js --name "sheetbotics-whatsapp"

# Status check karein
pm2 status

# Server reboot hone par auto-start ke liye
pm2 save
```

---

## 🧪 Part 6: Meta Webhook Verify Karna

1. Browser me open karein:
   `https://whatsapp.sheetbotics.in/api/health`
   Expected response:
   ```json
   {
     "status": "ok",
     "service": "Sheetbotics WhatsApp SaaS Backend & Super Admin API"
   }
   ```

2. Meta Developer Portal (`developers.facebook.com`) me jayein:
   - **Callback URL:** `https://whatsapp.sheetbotics.in/webhook/whatsapp`
   - **Verify Token:** `sheetbotics_live_token_2026`
   - Click **Verify and Save** &rarr; Meta handshake instantly verify ho jayega!
