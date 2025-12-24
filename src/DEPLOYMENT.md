# 🚀 Collabio - Deployment Guide

## ✅ Co už funguje
- ✅ Registrace uživatelů (Talent i Firma)
- ✅ Přihlášení a odhlášení
- ✅ Frontend aplikace

## 📋 Co potřebujete nasadit

Backend běží jako Supabase Edge Function. Musíte ho nasadit, aby aplikace měla plně funkční API.

---

## 🔧 Krok 1: Instalace Supabase CLI

### Mac/Linux:
```bash
brew install supabase/tap/supabase
```

### Windows:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Nebo stáhněte z: https://github.com/supabase/cli/releases

---

## 🔑 Krok 2: Přihlášení do Supabase

```bash
supabase login
```

Otevře se prohlížeč - přihlaste se pomocí vašeho Supabase účtu.

---

## 📤 Krok 3: Deploy Edge Function

Z root složky projektu spusťte:

```bash
supabase functions deploy make-server-7e99ffa9 --project-ref <VÁŠ_PROJECT_ID>
```

**Kde najdete PROJECT_ID:**
- Jděte na https://supabase.com/dashboard
- Otevřete váš projekt
- Project ID je v URL: `https://supabase.com/dashboard/project/<PROJECT_ID>`
- Nebo v Settings → General → Reference ID

**Příklad:**
```bash
supabase functions deploy make-server-7e99ffa9 --project-ref abcdefghijklmnop
```

---

## ✅ Krok 4: Ověření deploymentu

### 4.1 Zkontrolujte v Supabase dashboardu:
1. Jděte do **Edge Functions** v levém menu
2. Měli byste vidět funkci `make-server-7e99ffa9`
3. Měla by mít status **Active** (zelená)

### 4.2 Otestujte API endpoint:
Otevřete v prohlížeči nebo Postman:
```
https://<VÁŠ_PROJECT_ID>.supabase.co/functions/v1/make-server-7e99ffa9/health
```

**Měli byste dostat:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T..."
}
```

### 4.3 Zkontrolujte logy:
```bash
supabase functions logs make-server-7e99ffa9 --project-ref <VÁŠ_PROJECT_ID>
```

---

## 🎯 Krok 5: Test v aplikaci

1. **Otevřete aplikaci** v prohlížeči
2. **Přihlaste se** (pokud ještě nejste)
3. **Jděte na Profil** (tlačítko v headeru)
4. Měli byste vidět vaše údaje z backendu (ne mock data)

---

## 🐛 Řešení problémů

### Problem: "Function not found"
**Řešení:**
```bash
# Znovu deployněte
supabase functions deploy make-server-7e99ffa9 --project-ref <PROJECT_ID> --no-verify-jwt
```

### Problem: "CORS error"
**Řešení:**
Backend už má CORS správně nastavený. Pokud vidíte CORS error, pravděpodobně funkce neběží.
Zkontrolujte logy:
```bash
supabase functions logs make-server-7e99ffa9 --project-ref <PROJECT_ID>
```

### Problem: "Unauthorized" nebo 401
**Řešení:**
Buď:
1. Nejste přihlášení - přihlaste se
2. Session expirovala - odhlaste se a přihlaste znovu

### Problem: API vrací 500 Error
**Řešení:**
1. Zkontrolujte logy edge funkce
2. Problém je většinou v backendu - zkontrolujte error message v console
3. Zkuste restartovat funkci (redeploy)

---

## 📊 Environment Variables

Backend automaticky používá tyto env variables (nastavené v Supabase):
- `SUPABASE_URL` - automaticky
- `SUPABASE_ANON_KEY` - automaticky  
- `SUPABASE_SERVICE_ROLE_KEY` - automaticky
- `SUPABASE_DB_URL` - automaticky

**Nepotřebujete je nastavovat ručně!**

---

## 🔄 Redeploy (aktualizace)

Když uděláte změny v backendu (`/supabase/functions/server/index.tsx`):

```bash
supabase functions deploy make-server-7e99ffa9 --project-ref <PROJECT_ID>
```

---

## 📝 Důležité poznámky

### KV Store
Backend používá `kv_store_7e99ffa9` tabulku pro ukládání dat:
- Uživatelé
- Projekty
- Nabídky
- Zprávy
- atd.

Tabulka se vytvoří **automaticky při prvním použití**.

### Cesty API
Všechny API endpointy mají prefix:
```
/make-server-7e99ffa9/<endpoint>
```

Příklady:
- `/make-server-7e99ffa9/health` - health check
- `/make-server-7e99ffa9/signup` - registrace
- `/make-server-7e99ffa9/users/:id` - uživatelský profil
- `/make-server-7e99ffa9/projects` - seznam projektů
- atd.

### Autentizace
Frontend posílá `Authorization: Bearer <access_token>` v hlavičkách.
Backend ověřuje token přes Supabase Auth.

---

## 🎉 Hotovo!

Po nasazení backendu bude aplikace plně funkční:
- ✅ Registrace a přihlášení
- ✅ Uživatelské profily (Talent & Firma)
- ✅ Marketplace
- ✅ Projekty a nabídky
- ✅ Chat
- ✅ Hodnocení
- ✅ Admin dashboard
- ✅ Escrow platby (Stripe Connect)

---

## 🆘 Potřebujete pomoc?

1. **Zkontrolujte logy:**
   ```bash
   supabase functions logs make-server-7e99ffa9 --project-ref <PROJECT_ID>
   ```

2. **Restartujte funkci** (redeploy)

3. **Zkontrolujte browser console** - všechny API errors se tam logují

4. **Dokumentace Supabase:**
   https://supabase.com/docs/guides/functions

---

**Poslední aktualizace:** 26. října 2025
