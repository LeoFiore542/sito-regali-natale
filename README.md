# 🎄 La Nostra Lista di Natale 🎁

Una web app moderna, festiva e reattiva pensata per le famiglie, per gestire facilmente i desideri e le liste dei regali di Natale.

Progettata per essere compilata ed eseguita sia in locale che pubblicata gratuitamente al 100% su **GitHub Pages** (senza bisogno di configurare server o database complessi).

---

## ✨ Funzionalità della Versione 1

- **🧑‍🧑‍🧒 Gestione Membri della Famiglia**:
  - Ogni membro ha il proprio profilo con icona natalizia (🎅, 🤶, 🎄, 🦌, ecc.).
  - Visualizzazione sia della lista individuale che della panoramica completa (*"Tutti i desideri"*).
  - Aggiunta e modifica al volo di nuovi membri.

- **🎁 Aggiunta e Gestione Regali**:
  - **Titolo / Nome del regalo** (obbligatorio).
  - **Descrizione e Note**: taglia, preferenze colore, negozi consigliati, dettagli.
  - **Foto / Immagini**:
    - **Upload diretto da file**: scatta o carica foto da smartphone o computer (con compressione ottimizzata in anteprima).
    - **Link Web**: inserisci l'indirizzo di un'immagine online.
  - **Link di Acquisto**: pulsante diretto per aprire Amazon, negozi online o boutique in una nuova scheda.
  - **Prezzo indicativo e Priorità** (🔥 Alta priorità, ⭐ Media, 💡 Idea carina).

- **🤝 "Ci penso io" (Evita regali doppi!)**:
  - Chiunque in famiglia può segnare *"Ci pensa Marco"* su un regalo per evitare doppioni segreti tra parenti.

- **📲 Condivisione su WhatsApp & Telegram**:
  - Pulsante con 1 click che formatta l'intera lista con emoji e link pronta da incollare nella chat di gruppo della famiglia.

- **💾 Persistenza & Backup**:
  - Salvataggio locale ultra-veloce e senza limiti di megabyte grazie a **IndexedDB**.
  - Tasto di Esportazione e Importazione del database in formato `.json`.

- **❄️ Atmosfera Natalizia**:
  - Grafica elegante con font natalizi, colori caldi (rubino, pino, oro), coriandoli all'aggiunta di un regalo e fiocchi di neve animati (attivabili/disattivabili con un clic).

---

## 🚀 Avvio in Locale

```bash
# 1. Installa le dipendenze (se non già fatto)
npm install

# 2. Avvia il server di sviluppo
npm run dev
```

Apri il browser su [http://localhost:5173](http://localhost:5173).

---

## 🌐 Come Pubblicarla su GitHub Pages (Completamente Gratuito)

L'app include già il file di configurazione per il deploy automatico tramite GitHub Actions (`.github/workflows/deploy.yml`):

1. **Crea una repository su GitHub** (es. `sito-regali-natale`).
2. **Carica il codice sulla repository**:
   ```bash
   git init
   git add .
   git commit -m "Prima versione lista regali di natale"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/sito-regali-natale.git
   git push -u origin main
   ```
3. Su GitHub, vai nella tua repository:
   - Clicca su **Settings** > **Pages** (nel menu laterale a sinistra).
   - Sotto **Build and deployment** > **Source**, seleziona **GitHub Actions**.
4. Fatto! In circa 1 minuto GitHub Actions compilerà il sito e ti fornirà il link pubblico (es. `https://tuo-username.github.io/sito-regali-natale/`) che puoi inviare su WhatsApp a tutta la famiglia!
