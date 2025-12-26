# ⚡ Energy Bill Analyzer

Applicazione web completa per l'analisi delle bollette elettriche italiane. Permette di inserire i dati della propria bolletta e ricevere un'analisi dettagliata dei costi, suggerimenti personalizzati per ottimizzare i consumi e un confronto con le migliori offerte disponibili sul mercato.

## 🎯 Caratteristiche Principali

### Funzionalità
- **📊 Analisi Dettagliata Costi**: Breakdown completo delle voci di spesa (materia energia, trasporto, oneri di sistema, imposte)
- **📈 Visualizzazioni Grafiche**: Grafici interattivi per comprendere la composizione dei costi e il profilo di consumo
- **💡 Suggerimenti Personalizzati**: Raccomandazioni su misura per ridurre i costi energetici
- **🏆 Confronto Offerte**: Comparazione automatica con le offerte disponibili sul mercato
- **☀️ Supporto Fotovoltaico**: Analisi specifica per utenti con impianti di autoproduzione
- **💾 Storico**: Salvataggio delle analisi precedenti per monitorare l'evoluzione nel tempo
- **🚀 Dati di Esempio**: Caricamento rapido di bollette di esempio per testare l'applicazione

### Design Moderno
- **🎨 UI/UX Professionale**: Design contemporaneo con gradient, glassmorphism e microinterazioni
- **✨ Animazioni Fluide**: Transizioni smooth e animazioni CSS personalizzate
- **🌈 Color System**: Palette di colori vibrante con gradient dinamici
- **📱 Responsive Design**: Ottimizzato per desktop, tablet e mobile
- **🔮 Glassmorphism Effects**: Effetti backdrop-blur per un look moderno
- **💫 Hover Effects**: Interazioni visive al passaggio del mouse
- **📐 Rounded Corners**: Border-radius generosi per un aspetto moderno

## 🛠️ Tecnologie Utilizzate

- **Next.js 15** - Framework React con App Router e Server Components
- **TypeScript** - Type safety e migliore developer experience
- **Tailwind CSS** - Styling utility-first responsive
- **Recharts** - Libreria per grafici e visualizzazioni
- **Zustand** - State management leggero e performante
- **React Hook Form** - Gestione form con validazione
- **Zod** - Schema validation (predisposto per uso futuro)

## 📦 Installazione

```bash
# Clone del repository
cd energy-bill-analyzer

# Installazione dipendenze
npm install

# Avvio server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

## 🚀 Utilizzo

### 1. Inserimento Dati Bolletta

Compila il form multi-step con i dati della tua bolletta:

1. **Dati Cliente**: Tipologia cliente, codice POD, fascia oraria contatore
2. **Fornitura**: Potenza contrattuale, tensione, tipo di mercato
3. **Consumi**: Periodo di fatturazione e consumi per fascia oraria (F1, F2, F3)
4. **Costi**: Dettaglio delle spese (energia, trasporto, oneri, imposte)
5. **Autoproduzione**: Informazioni su eventuale impianto fotovoltaico

### 2. Test Rapido con Dati di Esempio

Utilizza i pulsanti "Carica dati di esempio" per testare rapidamente l'applicazione:

- **Consumo Medio (280 kWh)**: Bolletta domestica tipica
- **Consumo Alto (420 kWh)**: Abitazione con consumi elevati
- **Con Fotovoltaico**: Utente con impianto di autoproduzione

### 3. Visualizzazione Risultati

Dopo l'analisi, visualizzerai:

- **Riepilogo Costi**: Costo totale, costo medio per kWh, costi fissi e variabili
- **Grafici**:
  - Composizione percentuale dei costi (Pie Chart)
  - Profilo di consumo per fascia oraria (Bar Chart)
- **Suggerimenti di Ottimizzazione**: Interventi raccomandati con risparmio stimato
- **Confronto Offerte**: Migliori offerte disponibili con calcolo risparmio

## 📊 Struttura del Progetto

```
energy-bill-analyzer/
├── src/
│   ├── app/
│   │   └── page.tsx                 # Pagina principale
│   ├── components/
│   │   ├── BillInputForm.tsx        # Form multi-step input dati
│   │   ├── ResultsDashboard.tsx     # Dashboard risultati
│   │   ├── charts/                  # Componenti grafici
│   │   │   ├── CostBreakdownChart.tsx
│   │   │   └── ConsumptionProfileChart.tsx
│   │   └── results/                 # Componenti sezioni risultati
│   │       ├── CostSummary.tsx
│   │       ├── InterventionsSection.tsx
│   │       └── OffersSection.tsx
│   ├── lib/
│   │   ├── services/                # Servizi business logic
│   │   │   ├── arera-data.service.ts        # Dati ARERA (PUN, tariffe, oneri)
│   │   │   ├── cost-analysis.service.ts     # Analisi costi
│   │   │   ├── optimization.service.ts      # Algoritmo suggerimenti
│   │   │   └── offer-comparison.service.ts  # Confronto offerte
│   │   ├── store/
│   │   │   └── bill-store.ts        # Zustand store
│   │   └── sample-data.ts           # Dati di esempio per testing
│   └── types/
│       └── bill.ts                  # TypeScript types e interfaces
├── package.json
├── tsconfig.json
└── README.md
```

## 📖 Dettaglio Funzionalità

### Analisi Costi

L'applicazione scompone i costi della bolletta in:

1. **Spesa Materia Energia**
   - Quota fissa
   - Quota variabile (€/kWh)
   - Identificazione spread fornitore vs. PUN

2. **Spesa Trasporto e Gestione Contatore**
   - Quota fissa annua
   - Quota potenza (€/kW/anno)
   - Quota energia (€/kWh)

3. **Oneri di Sistema**
   - ASOS (Oneri generali)
   - ARIM (Smantellamento nucleare)

4. **Imposte**
   - Accise
   - IVA

### Algoritmo di Ottimizzazione

Il sistema genera suggerimenti basati su:

1. **Analisi Offerta**: Confronto spread fornitore con media mercato
2. **Analisi Potenza**: Verifica adeguatezza potenza contrattuale
3. **Analisi Comportamento**: Valutazione distribuzione consumi per fascia oraria
4. **Analisi Efficienza**: Confronto consumi con medie nazionali
5. **Analisi Autoproduzione**: Ottimizzazione utilizzo energia fotovoltaica

### Confronto Offerte

Confronto automatico con offerte di mercato:

- **Offerte a Prezzo Fisso**: Prezzo bloccato per durata contratto
- **Offerte Indicizzate**: PUN + spread fisso
- **Offerte Biorarie**: Prezzi differenziati F1 / F23
- **Offerte Triorarie**: Prezzi differenziati F1 / F2 / F3

Calcolo automatico del risparmio stimato in base al profilo di consumo.

## 🔮 Sviluppi Futuri

### Già Predisposti

- Validazione form con Zod
- Integrazione API GME reali per prezzi PUN
- Integrazione Portale Offerte ARERA
- Export PDF dell'analisi
- Storico analisi (già salvato in localStorage)

### Roadmap

- [ ] Autenticazione utenti
- [ ] Database persistente
- [ ] Export PDF personalizzato
- [ ] Grafici storici evoluzione consumi
- [ ] Notifiche cambiamento tariffe
- [ ] Integrazione API GME reali
- [ ] Integrazione Portale Offerte ARERA
- [ ] Calcolo carbon footprint
- [ ] Suggerimenti fotovoltaico personalizzati

## 📝 Dati di Riferimento

I dati utilizzati per l'analisi sono basati su:

- **Tariffe ARERA**: Delibere ufficiali per trasporto e oneri di sistema
- **Prezzi PUN**: Valori medi storici GME (Gestore Mercati Energetici)
- **Offerte Mercato**: Campione rappresentativo fornitori italiani

⚠️ **Nota**: I calcoli e i suggerimenti hanno scopo puramente informativo. Per informazioni ufficiali consultare:
- [ARERA](https://www.arera.it) - Autorità di Regolazione per Energia Reti e Ambiente
- [Portale Offerte](https://www.ilportaleofferte.it) - Confronto offerte luce e gas

## 🧪 Testing

```bash
# Build di produzione (include type checking)
npm run build

# Linting
npm run lint
```

## 🎨 Build e Deploy

```bash
# Build ottimizzata
npm run build

# Start server produzione
npm start
```

Deploy su Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/energy-bill-analyzer)

## 📄 Licenza

Progetto sviluppato per scopi didattici e dimostrativi.

## 🤝 Contributi

Contributi, segnalazioni di bug e richieste di funzionalità sono benvenuti!

## 📧 Contatti

Per domande o supporto, aprire una issue nel repository.

---

**Energy Bill Analyzer** - Analizza, ottimizza, risparmia! ⚡💰
