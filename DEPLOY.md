# Návod na nasazení (Deployment)

> **DŮLEŽITÉ:** Pro kompletní nastavení (API klíče, Pravidla databáze) si prosím přečtěte nejprve **[MANUAL_PRO_UZIVATELE.md](MANUAL_PRO_UZIVATELE.md)**.


Vaše aplikace je připravena k nasazení na Firebase Hosting. Postupujte podle těchto kroků v příkazovém řádku (terminálu).

**Předpoklad:** Máte nainstalované `firebase-tools`. Pokud ne, spusťte:
```bash
npm install -g firebase-tools
```

## Postup nasazení

1.  **Přihlášení do Firebase**
    ```bash
    firebase login
    ```
    (Postupujte podle pokynů v prohlížeči)

2.  **Inicializace (pokud se zeptá)**
    Tento projekt již obsahuje `firebase.json` a `.firebaserc`, takže `firebase init` by neměl být nutný, pokud jste již propojen s Firebase projektem. Pokud vám `deploy` nahlásí chybu, spusťte:
    ```bash
    firebase use --add
    ```
    A vyberte svůj existující Firebase projekt.

3.  **Build aplikace** (Vytvoření produkční verze)
    ```bash
    npm run build
    # nebo pokud vám to nejde kvůli PowerShellu:
    cmd /c "npm run build"
    ```

4.  **Nasazení na internet**
    ```bash
    firebase deploy --only hosting
    ```

    Pokud budete chtít nasadit i funkce (až je budete mít odladěné):
    ```bash
    firebase deploy --only functions
    ```
    *Pozor: Pro Cloud Functions (backend) musíte mít v Firebase projektu nastavený "Blaze" (placený) plán, i když v rámci free tieru často nic neplatíte.*

## Rychlé aktualizace
Až uděláte v kódu jakoukoliv změnu, stačí znovu spustit:
```bash
npm run build
firebase deploy --only hosting
```
A změny se projeví na webu během pár sekund.

## Automatické nasazení přes GitHub (Doporučeno)
Pokud chcete, aby se web aktualizoval sám pokaždé, když nahrajete kód na GitHub, můžete nastavit automatický deploy.

1.  Spusťte tento příkaz:
    ```bash
    firebase init hosting:github
    ```

2.  Postupujte podle instrukcí:
    *   Přihlásíte se přes prohlížeč.
    *   Vyberete svůj repozitář na GitHubu (např. `uzivatel/collabio-web`).
    *   Na otázku "Set up the workflow to run a build script before every deploy?" odpovězte **Yes**.
    *   Jako skript zadejte: `npm ci && npm run build` (nebo jen `npm run build` pokud nepoužíváte `package-lock.json`).
    *   Na otázku "Set up automatic deployment to your site's live channel when a PR is merged?" odpovězte **Yes**.
    *   Jako větev pro live channel zadejte `main` (nebo `master`).

Tím se vytvoří soubor `.github/workflows/firebase-hosting-merge.yml` a GitHub bude automaticky nasazovat vaši aplikaci při každém pushi.
