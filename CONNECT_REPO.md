# Jak napojit projekt na nový GitHub repozitář

Pokud máte na GitHubu vytvořený **nový prázdný repozitář**, postupujte takto:

1.  **Otevřete terminál** (příkazový řádek) ve složce projektu.

2.  **Přidejte odkaz na repozitář:**
    (Nahraďte `VAS_UZIVATEL` a `NAZEV_REPOZITARE` vašimi údaji. Odkaz najdete na GitHubu pod tlačítkem "Code".)

    **Varianta A: Pokud ještě žádný remote nemáte:**
    ```bash
    git remote add origin https://github.com/VAS_UZIVATEL/NAZEV_REPOZITARE.git
    ```

    **Varianta B: Pokud už tam nějaký starý je a chcete ho změnit:**
    ```bash
    git remote set-url origin https://github.com/VAS_UZIVATEL/NAZEV_REPOZITARE.git
    ```

3.  **Přejmenujte větev na main (standard):**
    ```bash
    git branch -M main
    ```

4.  **Uložte změny a odešlete (Push):**
    ```bash
    git add .
    git commit -m "Prvni upload - kompletni projekt"
    git push -u origin main
    ```

---

## Časté problémy
*   **"fatal: remote origin already exists."** -> Použijte příkaz z Varianty B.
*   **"error: src refspec main does not match any"** -> Zkuste nejdřív udělat commit (krok `git add .` a `git commit ...`).
