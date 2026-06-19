import React, { useEffect, useMemo, useRef, useState } from 'react';
import { auth, db, firebase } from './firebase';

const DISCRETE_UNITS = ['st','stuk','bl','blik','zak','pak','pot','fles','tube','bol','rol','doos','ei','teen','stronk','bos','krop','blikje','beker','sachet','sachets','cup','portie'];
const CART_EMPTY = 'data:image/png;base64,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';
const CART_FULL = 'data:image/png;base64,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';

    // ---------------- Utils ----------------
    function genId(prefix='') {
      return (prefix ? prefix + '_' : '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }


      function itemIdForProduct(productId) {
        return productId ? (`li_${productId}`) : genId('li');
      }


    function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

    function formatNum(n) {
      if (!isFinite(n)) return '';
      const rounded = Math.round(n * 100) / 100;
      const isInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
      const s = isInt ? String(Math.round(rounded)) : String(rounded);
      return s.replace('.', ',');
    }

    // Expose for safety (in case Babel wraps scopes)
    window.formatNum = formatNum;

    function searchRelevance(name, query) {
      const n = (name||'').toLowerCase();
      const q = query.toLowerCase();
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (n === q) return 0;                              // exact match
      // starts with query as standalone word (e.g. "kaas belegen 48+")
      const reStartWord = new RegExp('^' + esc + '($|\\s|/)');
      if (reStartWord.test(n)) return 1;
      // query as standalone word later in name (e.g. "houdbare halfvolle melk")
      const reWord = new RegExp('(\\s|/)' + esc + '($|\\s|/)');
      if (reWord.test(n)) return 2;
      // starts with query as part of compound word (e.g. "melkbiscuits")
      if (n.startsWith(q)) return 3;
      // query starts a word later in name (e.g. "houdbare melkchocolade")
      const reWordStart = new RegExp('(\\s|/)' + esc);
      if (reWordStart.test(n)) return 4;
      return 5;                                           // substring within a word (e.g. "karnemelk", "pindakaas")
    }

    function sortByRelevance(arr, query) {
      const q = query.trim().toLowerCase();
      if (!q) return arr;
      return arr.slice().sort((a,b) => {
        const ra = searchRelevance(a.name, q);
        const rb = searchRelevance(b.name, q);
        if (ra !== rb) return ra - rb;
        return (a.name||'').localeCompare(b.name||'', 'nl');
      });
    }

    function EditIcon({ className = "w-5 h-5" }) {
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 20h14a2 2 0 0 0 2-2v-7" />
          <path d="M4 20V6a2 2 0 0 1 2-2h7" />
          <path d="m13.5 15.5-4 1 1-4L17.8 5.2a1.8 1.8 0 0 1 2.5 2.5z" />
          <path d="m16.5 6.5 2 2" />
        </svg>
      );
    }

    function TrashIcon({ className = "w-5 h-5" }) {
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 7h16" />
          <path d="M9 7V5h6v2" />
          <path d="M7 7l1 13h8l1-13" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      );
    }

    function QuantityControl({ qty, onDec, onInc, plusTitle = "Meer", minusTitle = "Minder", collapseAtOne = false }) {
      const q = clamp(Number(qty) || 0, 0, 99);
      if (q <= 0 || (collapseAtOne && q <= 1)) {
        return (
          <button
            onClick={onInc}
            title={plusTitle}
            className="w-9 h-9 rounded-full border border-[#17372d]/20 bg-white text-[#17372d] text-sm font-medium flex items-center justify-center"
          >
            +
          </button>
        );
      }
      return (
        <div className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 p-1">
          <button
            onClick={onDec}
            title={minusTitle}
            className="w-7 h-7 rounded-full bg-white text-slate-700 text-sm border border-slate-200 flex items-center justify-center"
          >
            -
          </button>
          <div className="min-w-[22px] text-center text-sm font-medium text-slate-700 tabular-nums">{q}</div>
          <button
            onClick={onInc}
            title={plusTitle}
            className="w-7 h-7 rounded-full bg-white text-[#17372d] text-sm border border-[#17372d]/20 flex items-center justify-center"
          >
            +
          </button>
        </div>
      );
    }

    function ListQuantityControl({ itemId, qty, open, onOpen, onDec, onInc }) {
      const q = clamp(Number(qty) || 0, 0, 99);
      if (!open) {
        if (q > 1) {
          return (
            <button
              onClick={(e)=>{ e.stopPropagation(); onOpen(itemId); }}
              title="Aantal aanpassen"
              className="min-w-[34px] h-9 px-2 rounded-full border border-slate-200 bg-white text-slate-700 text-sm font-medium tabular-nums flex items-center justify-center"
            >
              {q}
            </button>
          );
        }
        return (
          <button
            onClick={(e)=>{ e.stopPropagation(); onInc(e); }}
            title="Meer"
            className="w-9 h-9 rounded-full border border-[#17372d]/20 bg-white text-[#17372d] text-sm font-medium flex items-center justify-center"
          >
            +
          </button>
        );
      }
      return (
        <div onClick={(e)=>e.stopPropagation()}>
          <QuantityControl
            qty={q}
            onDec={onDec}
            onInc={onInc}
          />
        </div>
      );
    }


    function titleFromLegacyDocId(docId) {
      // best-effort: "aardappelen_kruimig_3_kg" -> "aardappelen kruimig 3 kg"
      try {
        return String(docId || '').replace(/_/g,' ').trim();
      } catch(e) {
        return '';
      }
    }


    const CATEGORY_OPTIONS = [
      'Aardappelen, groente en fruit',
      'Verse maaltijden en gemak',
      'Vlees, vis en vega',
      'Brood en gebak',
      'Vleeswaren, kaas en tapas',
      'Zuivel, eieren, boter',
      'Vega en plantaardig',
      'Conserven, soepen, sauzen, oliën',
      'Wereldkeukens, kruiden, pasta en rijst',
      'Ontbijt, broodbeleg en bakproducten',
      'Koek, snoep, chocolade en chips',
      'Koffie en thee',
      'Frisdrank en sappen',
      'Bier en wijn',
      'Diepvries',
      'Drogisterij',
      'Huishouden',
      'Non-food en servicebalie',
      'Overig',
    ];

    // 6-letter code
    function makeCode() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let out = "";
      for (let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)];
      return out;
    }

    // Default products for new households (exported from De Hasseltjes)
    // To update: use "Producten exporteren" in manage menu, then paste here
    var DEFAULT_PRODUCTS = [{"name":"100% Dadel Stroop 330 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Becel Original 500 ml","category":"Zuivel, eieren, boter"},{"name":"Bloemenhoning 500 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Biologisch Tuinerwten 450g","category":"Diepvries"},{"name":"C'est La Room Brie 60+ 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Blauwe Bessen 125 g","category":"Aardappelen, groente en fruit"},{"name":"Biologisch Rundergehakt Mager 250 g","category":"Vlees, vis en vega"},{"name":"Chavroux Pure Geitenkaas 45+ 150 g","category":"Vleeswaren, kaas en tapas"},{"name":"Conimex Wokolie Oosterse 500 ml","category":"Conserven, soepen, sauzen, oliën"},{"name":"Bonne Maman Aardbeien en Frambozen 370 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Biologisch Zalm zonder Huid ca. 110 g","category":"Vlees, vis en vega"},{"name":"100% Pindakaas Naturel 600 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Bruine Linzen 400 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Boeren Tijger Volkoren","category":"Brood en gebak"},{"name":"Cappuccino Mousse met Biscuit 75g","category":"Zuivel, eieren, boter"},{"name":"Afwasborstel","category":"Huishouden"},{"name":"Biologisch Kipfilet ca. 400g","category":"Vlees, vis en vega"},{"name":"Alpro Mild & Creamy No Sugars Soyaproduct Nature 755 g","category":"Vega en plantaardig"},{"name":"Chili Bonen in Saus 380 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Biologische Kastanjechampignon 250g","category":"Aardappelen, groente en fruit"},{"name":"Aardappelen Kruimig 3 kg","category":"Aardappelen, groente en fruit"},{"name":"Bami Groente 450 g","category":"Verse maaltijden en gemak"},{"name":"Cookie Gelato 75 g","category":"Diepvries"},{"name":"Bonne Maman Aardbeien Confiture 370 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Arla Biologisch Volle Yoghurt 1 L","category":"Zuivel, eieren, boter"},{"name":"Calvé Pindakaas Stukjes Pinda 650 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Aviko Dunne Friet Supercrunch Airfryer","category":"Diepvries"},{"name":"Biologisch Shiitake 100 g","category":"Aardappelen, groente en fruit"},{"name":"Biscuits Yoghurt Aardbeiensmaak 5 x 2 Stuks","category":"Koek, snoep, chocolade en chips"},{"name":"Boon Kidneybonen in Chilisaus 380 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Biologisch Rundergehakt 500 g","category":"Vlees, vis en vega"},{"name":"Biologische Zwarte Bonen 405 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Bolletje Echte Beschuit","category":"Brood en gebak"},{"name":"Allesreiniger Waterlelie Katoen 1,25 L","category":"Huishouden"},{"name":"Biologisch Hamburger Rund 2 Stuks","category":"Vlees, vis en vega"},{"name":"Chocoladehagelslag Puur 600 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Avocado Eetrijp 2 Stuks","category":"Aardappelen, groente en fruit"},{"name":"Carbonell Kappertjes Nonpareilles 100 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Burrata 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"B'tween Mueslireep Melkchocolade 6 x 25g","category":"Koek, snoep, chocolade en chips"},{"name":"Bananen","category":"Aardappelen, groente en fruit"},{"name":"Aardappelen Vastkokend 1 kg","category":"Aardappelen, groente en fruit"},{"name":"Biologisch Eieren 10 Stuks","category":"Zuivel, eieren, boter"},{"name":"Biologisch Kipfilet ca. 100 g","category":"Vleeswaren, kaas en tapas"},{"name":"Bonne Maman Viervruchten Confiture 370 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Bloemkool","category":"Aardappelen, groente en fruit"},{"name":"Biologisch Tomaten Passata 680 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Coca-Cola Zero Sugar Zero Cafeïne 1,5 L","category":"Frisdrank en sappen"},{"name":"Aluminiumfolie 30 Meter","category":"Huishouden"},{"name":"Coca-Cola Zero Sugar 1,5 L","category":"Frisdrank en sappen"},{"name":"Belegen Kaas 48+ Stuk 545 g","category":"Vleeswaren, kaas en tapas"},{"name":"Biologisch Oesterzwam 150 g","category":"Aardappelen, groente en fruit"},{"name":"Biologische Pompoen","category":"Aardappelen, groente en fruit"},{"name":"Coca-Cola Zero Sugar 1 L","category":"Frisdrank en sappen"},{"name":"Bleekselderij","category":"Aardappelen, groente en fruit"},{"name":"Biologisch Gerookte Kipfilet ca. 100 g","category":"Vleeswaren, kaas en tapas"},{"name":"Biologisch Spekreepjes 2 x 100 g","category":"Vleeswaren, kaas en tapas"},{"name":"Bosui","category":"Aardappelen, groente en fruit"},{"name":"Brugse Zot Belgisch Blond 4 x 330ML","category":"Bier en wijn"},{"name":"Chocolade Hagelslag Puur 380 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Bimi 200 g","category":"Aardappelen, groente en fruit"},{"name":"Biologisch Avocado ca. 650 g","category":"Aardappelen, groente en fruit"},{"name":"Biologisch Aardappelen Kruimig 1 kg","category":"Aardappelen, groente en fruit"},{"name":"Biologisch Karnemelk 1 L","category":"Zuivel, eieren, boter"},{"name":"Cornets Vanille Smaak 16 Stuks","category":"Diepvries"},{"name":"Biologische Kipfilet 1 Stuk ca. 200 g","category":"Vlees, vis en vega"},{"name":"Biologisch Volkoren Havermout 500 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Biologisch Hele Sperziebonen 450g","category":"Diepvries"},{"name":"Biologische Komkommer","category":"Aardappelen, groente en fruit"},{"name":"Burrito Kruidenmix 15 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Biologisch Rode Uien 3 Stuks","category":"Aardappelen, groente en fruit"},{"name":"Cashewnoten Gezouten 200 g","category":"Koek, snoep, chocolade en chips"},{"name":"Candyman Vrieslollies 10 Stuks 500 ml","category":"Diepvries"},{"name":"Biologisch Citroen 2 Stuks","category":"Aardappelen, groente en fruit"},{"name":"Aardappelschijfjes 450 g","category":"Diepvries"},{"name":"Cashewnoten Gezouten Voordeelverpakking 500 g","category":"Koek, snoep, chocolade en chips"},{"name":"Biologisch Volle Yoghurt 1 L","category":"Zuivel, eieren, boter"},{"name":"Damme Abdijkaas 45+ Mild Stuk ca. 150g","category":"Vleeswaren, kaas en tapas"},{"name":"L'Oréal Paris Elnett Micro-Verstuiving Haarspray 75 ml","category":"Drogisterij"},{"name":"Glorix Bleek Original 3 x 750 ml","category":"Huishouden"},{"name":"Hartige Biscuits Kaas & Tomaat 4 x 3 Stuks","category":"Koek, snoep, chocolade en chips"},{"name":"Holie's Crunchy Bar Protein Peanut Chocolate 3 x 2 Stuks 6 x 20 g","category":"Koek, snoep, chocolade en chips"},{"name":"Kips Vega Tuinkruiden en Bospaddenstoelen Paté 125g","category":"Vega en plantaardig"},{"name":"Grana Padano Kaas 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Kokki Djawa Boemboe Saté Hot 500 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Doritos Nacho Cheese Tortilla Chips 272g","category":"Koek, snoep, chocolade en chips"},{"name":"Feta Kaas 43+ Plak 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Julienne Koolmix 150 g","category":"Aardappelen, groente en fruit"},{"name":"Garden Gourmet Vleesvervanger Falafel Spicy balletjes 190g","category":"Vega en plantaardig"},{"name":"Gebroken Sperziebonen 400 g","category":"Diepvries"},{"name":"Kastanje Champignons 400 g","category":"Aardappelen, groente en fruit"},{"name":"Iglo Vissticks 15 stuks 15 x 28 g","category":"Diepvries"},{"name":"Kaiser Broodjes 4 Stuks","category":"Brood en gebak"},{"name":"Geraspte Kaas Belegen 48+ 175 g","category":"Vleeswaren, kaas en tapas"},{"name":"Kastanje Champignons 250 g","category":"Aardappelen, groente en fruit"},{"name":"Keukenpapier Sterk & Absorberend 2 Lagen 3 Rollen","category":"Huishouden"},{"name":"Euroma Speculaaskruiden by Jonnie Boer","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Knorr Cup-a-Soup Indiase Kerrie 3 x 175 ml","category":"Conserven, soepen, sauzen, oliën"},{"name":"De Vegetarische Slager Pluimfeestburger Veganistisch 180 g","category":"Vega en plantaardig"},{"name":"Falafel Naturel Voordeelverpakking 360 g","category":"Vega en plantaardig"},{"name":"De Vegetarische Slager Cordon Blij Vegan 180 g","category":"Vega en plantaardig"},{"name":"Gekookte Bietjes Biologisch 500 g","category":"Aardappelen, groente en fruit"},{"name":"Kips Vega Paté 125 g","category":"Vega en plantaardig"},{"name":"Houdbare Halfvolle Melk Voordeelverpakking 6 x 1 L","category":"Zuivel, eieren, boter"},{"name":"Cornets Vanille Smaak 8 Stuks","category":"Diepvries"},{"name":"Courgette","category":"Aardappelen, groente en fruit"},{"name":"Drink me Chai Vegan Chai Latte 250 g","category":"Koffie en thee"},{"name":"Knorr Bouillon Blokjes Groente 15 tabletten","category":"Conserven, soepen, sauzen, oliën"},{"name":"Ei-Bieslook Salade 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"HAK Zwarte Bonen 380g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Kaasblokjes Jong Belegen 48+ 130 g","category":"Vleeswaren, kaas en tapas"},{"name":"Knoflook 100 g","category":"Aardappelen, groente en fruit"},{"name":"Kips Kleintje Vega Smeerworst 6 x 20 g","category":"Vega en plantaardig"},{"name":"Kernhem 60+ ca. 183 g","category":"Vleeswaren, kaas en tapas"},{"name":"Duvel 6.66% Blond 4 x 330ML","category":"Bier en wijn"},{"name":"HAK Linzencurry Protein Bowl 555g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Elstar Appels Voordeelverpakking 1,5 kg","category":"Aardappelen, groente en fruit"},{"name":"Knoppers Melk Crispy Wafel 5 Stuks 125g","category":"Koek, snoep, chocolade en chips"},{"name":"Cottage Cheese 200 g","category":"Zuivel, eieren, boter"},{"name":"IJsbergsla 1 Stuk","category":"Aardappelen, groente en fruit"},{"name":"Houmous Pikant 200 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Kaasstengels 150 g","category":"Koek, snoep, chocolade en chips"},{"name":"Katja Zure Matjes Mix 250 g","category":"Koek, snoep, chocolade en chips"},{"name":"Houdbare Halfvolle Melk 1 L","category":"Zuivel, eieren, boter"},{"name":"Emmi Raclette Classic","category":"Vleeswaren, kaas en tapas"},{"name":"Fijngesneden Opbakaardappelen 600 g","category":"Aardappelen, groente en fruit"},{"name":"Havermout Fijne Vlokken Volkoren Voordeelverpakking 1KG","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"HEMA Nagelborsteltje","category":"Drogisterij"},{"name":"Fijnproevers Mandarijnen 1 kg","category":"Aardappelen, groente en fruit"},{"name":"Desem Baguettes Wit 2 Stuks","category":"Brood en gebak"},{"name":"Grand'Italia Spaghetti Tradizionali Voordeelpak 1 kg","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Jonagold Appels Voordeelverpakking 1,5 kg","category":"Aardappelen, groente en fruit"},{"name":"ERU Goudkuipje Naturel 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Kabeljauwfilet Naturel ca. 260 g","category":"Vlees, vis en vega"},{"name":"Cottage Cheese Light 200 g","category":"Zuivel, eieren, boter"},{"name":"Gember Ontbijtkoek Ongesneden 465 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Julienne Wortel 150 g","category":"Aardappelen, groente en fruit"},{"name":"Crème Fraîche Light 50% Minder Vet 125 g","category":"Zuivel, eieren, boter"},{"name":"Koningsvogel Sambal Manis 280 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Holie's Granola Protein Peanut Butter 350 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Komo Huisvuilzakken + Sluitstrips 20 Stuks","category":"Huishouden"},{"name":"Dille 15 g","category":"Aardappelen, groente en fruit"},{"name":"HiPRO Protein Mousse Dark Chocolate 200 g","category":"Zuivel, eieren, boter"},{"name":"Galbani Grana Padano Kaas 150 g","category":"Vleeswaren, kaas en tapas"},{"name":"Faja Lobi Sandhia's Roti 4 Stuks 280 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Knolselderij","category":"Aardappelen, groente en fruit"},{"name":"Fruitbiscuits Appelsmaak 6 x 3 Stuks","category":"Koek, snoep, chocolade en chips"},{"name":"Griekse Olijvenmix 120 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Goldsteig Mozzarella Classic 220 g","category":"Vleeswaren, kaas en tapas"},{"name":"Knorr Pittige Tomaat Cup-a-Soup 3 x 175 ml","category":"Conserven, soepen, sauzen, oliën"},{"name":"Jan Pizzadeeg met zuurdesem en tomatensaus 600g","category":"Verse maaltijden en gemak"},{"name":"Fijne Champignons 250 g","category":"Aardappelen, groente en fruit"},{"name":"Kips Vega Filet Americain 125 g","category":"Vega en plantaardig"},{"name":"Druiven Wit Pitloos 500 g","category":"Aardappelen, groente en fruit"},{"name":"Fairtrade Bio Bananen 850 g","category":"Aardappelen, groente en fruit"},{"name":"Dikke Rijstwafels Zeezout 120 g","category":"Koek, snoep, chocolade en chips"},{"name":"La Place Kruiden Munt 15 Stuks","category":"Koffie en thee"},{"name":"Halloumi Grillkaas 225 g","category":"Vleeswaren, kaas en tapas"},{"name":"Dikke Maiswafels Zeezout 120 g","category":"Koek, snoep, chocolade en chips"},{"name":"Katja Biggetjes 255 g","category":"Koek, snoep, chocolade en chips"},{"name":"Italiaanse Kruiden 55 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Kips Groentespread Zongedroogde Tomaat 125g","category":"Vleeswaren, kaas en tapas"},{"name":"Go-Tan Kokosmelk 8% 500ml","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Ginger Ale 1 L","category":"Frisdrank en sappen"},{"name":"Kalkoenfilet 100 g","category":"Vleeswaren, kaas en tapas"},{"name":"Gesneden IJsbergsla 200 g","category":"Aardappelen, groente en fruit"},{"name":"Dr. Oetker Ristorante Pizza Margherita 295 g","category":"Diepvries"},{"name":"Kaas Belegen 48+ Stuk Voordeelverpakking 910 g","category":"Vleeswaren, kaas en tapas"},{"name":"Filet Americain Mager 150 g","category":"Vleeswaren, kaas en tapas"},{"name":"Frietjes Zoete Aardappel 400 g","category":"Diepvries"},{"name":"Extra Jam Bosvruchten 430 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"De Sinaasappelaere Sinaasappelsap 33 cl","category":"Frisdrank en sappen"},{"name":"Hak Mais 190 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Gemengde Drop Zoet & Zout 350 g","category":"Koek, snoep, chocolade en chips"},{"name":"Kokos Plantaardige Variatie op Yoghurt 400g","category":"Vega en plantaardig"},{"name":"Geitenkaas Schijfjes Naturel 125 g","category":"Vleeswaren, kaas en tapas"},{"name":"Fruitbiscuits Bosvruchten­smaak 6 x 3 Stuks","category":"Koek, snoep, chocolade en chips"},{"name":"Italiaanse Bollen 2 Stuks","category":"Brood en gebak"},{"name":"Franse Kwark Mager 1 kg","category":"Zuivel, eieren, boter"},{"name":"Kappertjes in Azijn 100 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Crunchy Muesli Appel & Rozijn 900g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"De Vegetarische Slager Lekker Burgerlijk Vegan 160 g","category":"Vega en plantaardig"},{"name":"Frutesse Stroop Maestrichter 450 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Gemengde Groente 450 g","category":"Diepvries"},{"name":"Fruitreep Appelsmaak 8 Stuks","category":"Koek, snoep, chocolade en chips"},{"name":"Druiven Rood/Blauw Pitloos 500 g","category":"Aardappelen, groente en fruit"},{"name":"Groene Olijven Basilicum 140g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Hot Salsa 230 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Goudse Kaas 48+ Belegen Stuk ca. 580 g","category":"Vleeswaren, kaas en tapas"},{"name":"Extra Zacht & Sterk Toiletpapier 4-Laags Voordeelverpakking 16 Rollen","category":"Huishouden"},{"name":"Karvan Cévitam Sinaasappel Original Siroop 600 ml","category":"Frisdrank en sappen"},{"name":"Koska Sesampasta 300g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Franse Frites 1 kg","category":"Diepvries"},{"name":"Ei Salade met Lente-Ui 150 g","category":"Vleeswaren, kaas en tapas"},{"name":"Kruidenkaas Italiaanse Stijl 50+ ca. 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"Komkommer","category":"Aardappelen, groente en fruit"},{"name":"Kropsla","category":"Aardappelen, groente en fruit"},{"name":"Hooghoudt Limonade Siroop Valencia 0,7 L","category":"Frisdrank en sappen"},{"name":"Hema Plastic Elastieken","category":"Non-food en servicebalie"},{"name":"Lasagnebladen Naturel 250 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Lay's Max Ribbel Chips Naturel 275 gr","category":"Koek, snoep, chocolade en chips"},{"name":"Lassie Zilvervliesrijst Voordeelpak 750 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Lay's Sensations Thai Sweet Chilli Chips 150 gr","category":"Koek, snoep, chocolade en chips"},{"name":"Lay's Max Ribbel Chips Heinz Tomaten Ketchup 185 gr","category":"Koek, snoep, chocolade en chips"},{"name":"Le Rustique Camembert 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"Minikrieltjes 600 g","category":"Aardappelen, groente en fruit"},{"name":"Mini Babybel Jonge 45+ kaas tussendoortje 20 g x 5","category":"Vleeswaren, kaas en tapas"},{"name":"Sambal Light 15+ Smeerkaas 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Roosvicee Vruchtenmix siroop 500 ml","category":"Frisdrank en sappen"},{"name":"Volkoren Biscuit 300 g","category":"Koek, snoep, chocolade en chips"},{"name":"Mineola 1 kg","category":"Aardappelen, groente en fruit"},{"name":"Stokbrood Rustiek Wit Afbakbrood 300 g","category":"Brood en gebak"},{"name":"Verse Gnocchi 400 g","category":"Verse maaltijden en gemak"},{"name":"Vivera Plantaardig Kruim Gehaakt 200 g","category":"Vega en plantaardig"},{"name":"Rösti Rondjes 600 g","category":"Diepvries"},{"name":"Maza Muhammara 200g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Muesli Vier Noten Voordeelverpakking 900 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Slagers Leverworst 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"Napoleon Citroen 225 g","category":"Koek, snoep, chocolade en chips"},{"name":"Pally Theekoekjes 300 g","category":"Koek, snoep, chocolade en chips"},{"name":"Sojadrink Ongezoet 1 L","category":"Vega en plantaardig"},{"name":"Ovengebakken Scharrel Kipfilet ca. 120 g","category":"Vleeswaren, kaas en tapas"},{"name":"Mini Snacks Airfryer & Oven ca. 16 Stuks","category":"Diepvries"},{"name":"Rivella Original 1,5 L","category":"Frisdrank en sappen"},{"name":"Sparkling Ice Tea 6 x 250ML","category":"Frisdrank en sappen"},{"name":"Pistachenoten Gezouten 200 g","category":"Koek, snoep, chocolade en chips"},{"name":"Naturel Ontbijtkoek 550 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Palingworst ca. 110g","category":"Vleeswaren, kaas en tapas"},{"name":"Plakjes Leverworst 175 g","category":"Vleeswaren, kaas en tapas"},{"name":"Mars Minimix chocolade repen uitdeelzak 500g","category":"Koek, snoep, chocolade en chips"},{"name":"Tagliatelle 500 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Snackgroente Komkommertjes 400 g","category":"Aardappelen, groente en fruit"},{"name":"Peroni Nastro Azzurro 0,0% Alcoholvrij 6 x 330ML","category":"Bier en wijn"},{"name":"Tijger Bollen 2 Stuks","category":"Brood en gebak"},{"name":"Naturel Light 15+ Smeerkaas 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Pataks mini Naan garlic & herbs","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Pangasiusfilet 270 g","category":"Vlees, vis en vega"},{"name":"Salted Caramel Stracciatella 70 g","category":"Zuivel, eieren, boter"},{"name":"Vivera Vegetarische Kaas Schnitzel 2 Stuks 150 g","category":"Vega en plantaardig"},{"name":"Snack Worteltjes 300 g","category":"Aardappelen, groente en fruit"},{"name":"Tortilla Volkoren 8 Stuks","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Rodekool met Appel 520 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Tiramisu Dessert 500 g","category":"Zuivel, eieren, boter"},{"name":"Maïskorrels 330 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Optimel Drinkyoghurt Mango Passievrucht 0% Vet 1L","category":"Zuivel, eieren, boter"},{"name":"Peterselie 40 g","category":"Aardappelen, groente en fruit"},{"name":"Stroop Wafels met Roomboter 468 g","category":"Koek, snoep, chocolade en chips"},{"name":"Plantaardige Worstenbroodjes 4 Stuks","category":"Vega en plantaardig"},{"name":"Venturino Bartolomeo Pesto alla Genovese 180 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"The Flower Farm Bakken Zonder Palmolie Value Pack 750 ml","category":"Zuivel, eieren, boter"},{"name":"Spruiten 500 g","category":"Aardappelen, groente en fruit"},{"name":"Pizzakit met Pizzadeeg en Tomatensaus","category":"Verse maaltijden en gemak"},{"name":"Mullrose Schoonmaakazijn Magic Vinax 1L","category":"Huishouden"},{"name":"Plantaardig Wokstukjes Oosterse Stijl 175g","category":"Vega en plantaardig"},{"name":"Tampons Super 32 Stuks","category":"Drogisterij"},{"name":"Viking Blue ca. 100 g","category":"Vleeswaren, kaas en tapas"},{"name":"Pinot Grigio Rosé Biologisch 750ML","category":"Bier en wijn"},{"name":"Stegeman Vegetarisch Broodbeleg met Mediterraanse Kruiden 100 g","category":"Vega en plantaardig"},{"name":"Maaltijd Pita's 5 Stuks","category":"Brood en gebak"},{"name":"Olijven Mammoet","category":"Conserven, soepen, sauzen, oliën"},{"name":"Veldsla 85 g","category":"Aardappelen, groente en fruit"},{"name":"Olijven Naturel 140 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Paracetamol 500mg 20tabl","category":"Drogisterij"},{"name":"Slagroom 250 g","category":"Zuivel, eieren, boter"},{"name":"Spices Chai 20 Stuks","category":"Koffie en thee"},{"name":"LU PiM's Koekjes Peer 150g","category":"Koek, snoep, chocolade en chips"},{"name":"Sultana FruitBiscuits Naturel 218 g","category":"Koek, snoep, chocolade en chips"},{"name":"Neuburger Coupe Danube Chocoladesmaak 200 g","category":"Zuivel, eieren, boter"},{"name":"Uien 1 kg","category":"Aardappelen, groente en fruit"},{"name":"Maggi Champignon Bouillon 80 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Risotto rijst Arborio 500 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Pickwick Pure Groene Thee 20 Stuks","category":"Koffie en thee"},{"name":"Sinaasappel Sap 1,5 L","category":"Frisdrank en sappen"},{"name":"Minikrieltjes 450 g","category":"Aardappelen, groente en fruit"},{"name":"Santa Maria Chunky Wrap Salsa Hot 230 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Lipton Yellow Label Classico 50 Stuks","category":"Koffie en thee"},{"name":"Traybake Knolselderij & Pompoen Mix 450 g","category":"Verse maaltijden en gemak"},{"name":"Spaghetti","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"MAGGI Jus Naturel Voordeel 125 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Maaltijd Pita's Griekse Stijl 5 Stuks","category":"Brood en gebak"},{"name":"Nacho Chips 200g","category":"Koek, snoep, chocolade en chips"},{"name":"Romige Vla Chocoladesmaak 1 L","category":"Zuivel, eieren, boter"},{"name":"Tros Tomaten 5 Stuks","category":"Aardappelen, groente en fruit"},{"name":"Plantaardige Balletjes Voorgegaard Voordeelverpakking 367 g","category":"Vega en plantaardig"},{"name":"Tomaten Sugo","category":"Conserven, soepen, sauzen, oliën"},{"name":"Sperziebonen 500 g","category":"Aardappelen, groente en fruit"},{"name":"Vivera Plantaardige Kipstukjes 175 g","category":"Vega en plantaardig"},{"name":"Platte Peterselie 15 g","category":"Aardappelen, groente en fruit"},{"name":"Ongeroosterde Pijnboompitten 100 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Plantaardig Spekreepjes met Rooksmaak 175g","category":"Vega en plantaardig"},{"name":"Maza Hoemoes Paprika & Oregano 200 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Verstegen Dille 17 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Mini Naan Knoflook Koriander 200 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Muntthee","category":"Koffie en thee"},{"name":"Verstegen Komijnzaad Gemalen 37 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Muesli Naturel 1 kg","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Reuze Rozijnenbollen 4 Stuks","category":"Brood en gebak"},{"name":"Snijworst 140 g","category":"Vleeswaren, kaas en tapas"},{"name":"Tarwe Gepoft 160 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Mozzarella di Bufala Campana DOP 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"Oranje Pompoen Biologisch","category":"Aardappelen, groente en fruit"},{"name":"Verstegen Paprikapoeder Pikant 35 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Neutral Waspoeder Parfumvrij Wit 18 wasbeurten","category":"Huishouden"},{"name":"Venkel","category":"Aardappelen, groente en fruit"},{"name":"Melkchocolade Caramel Zeezout 140 g","category":"Koek, snoep, chocolade en chips"},{"name":"Tomaten Gezeefd Passata 500 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Vegetarische Kaas Schnitzel 2 Stuks","category":"Vega en plantaardig"},{"name":"The Flower Farm Smeren Zonder Palmolie 375 g","category":"Zuivel, eieren, boter"},{"name":"Sultana Crunchers Kaas/Tomaat 175 g","category":"Koek, snoep, chocolade en chips"},{"name":"Patentbloem 1KG","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Paddenstoelen Bouillon Blokjes 8 Stuks","category":"Conserven, soepen, sauzen, oliën"},{"name":"Melkbiscuits 6 Stuks","category":"Koek, snoep, chocolade en chips"},{"name":"Plantaardige Gehakte Kruimige Stukjes Rui Gegaard 200 g","category":"Vega en plantaardig"},{"name":"Look-O-Look Zure Regenboog Streken Vegan 20 stuks","category":"Koek, snoep, chocolade en chips"},{"name":"Mozzarella Maxi 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"Maza Hoemoes 200 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Slagroom Luxe 250g","category":"Zuivel, eieren, boter"},{"name":"Venco Droptoppers Zacht & Salmiak 215 g","category":"Koek, snoep, chocolade en chips"},{"name":"Lutti Foppies Zuur Citric 175 g","category":"Koek, snoep, chocolade en chips"},{"name":"Vivera Plantaardige Shoarma 300 g","category":"Vega en plantaardig"},{"name":"Marcel's Green Soap wasverzachter Patchouli & Cranberry 750 ML","category":"Huishouden"},{"name":"Magnetron Popcorn Zout 3 x 90 g","category":"Koek, snoep, chocolade en chips"},{"name":"Paprika Mix 3 Stuks","category":"Aardappelen, groente en fruit"},{"name":"Topking VlamTosti's Lekker Pittig 2 Stuks 240 g","category":"Verse maaltijden en gemak"},{"name":"Royal Mediterranean Ontpitte Kalamata Variëteit Olijven 195 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Tiramisu 80 g","category":"Zuivel, eieren, boter"},{"name":"Speculoos Pasta 400 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Ongebrande Notenmix 200 g","category":"Koek, snoep, chocolade en chips"},{"name":"LU Mini Crackers Naturel 8 x 5 Stuks 250g","category":"Koek, snoep, chocolade en chips"},{"name":"Magioni Carrot Banana Pancakes 4 x 40 g","category":"Diepvries"},{"name":"Maza Hoemoes Spicy Mango 200 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Pannen Sponsen 2 Stuks","category":"Huishouden"},{"name":"Naturel 48+ Smeerkaas 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Mueslireep yoghurt & rood fruit","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Puur Chocopasta 400 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Roosjes Bloemkool & Broccoli 400 g","category":"Aardappelen, groente en fruit"},{"name":"Pranutti Duopasta 600g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"St. Paulin ca. 122 g","category":"Vleeswaren, kaas en tapas"},{"name":"Paddenstoelen Mix","category":"Aardappelen, groente en fruit"},{"name":"Optimel Drinkyoghurt Limoen 0% Vet 1L","category":"Zuivel, eieren, boter"},{"name":"Rucola Nootachtig & Licht Pittig 85 g","category":"Aardappelen, groente en fruit"},{"name":"Vegetarische Kaas Schnitzel Voordeelverpakking 400 g","category":"Vega en plantaardig"},{"name":"Mascarpone 250 g","category":"Zuivel, eieren, boter"},{"name":"Snackgroente Tomaatjes 250g","category":"Aardappelen, groente en fruit"},{"name":"Straffe Hendrik Brugs Tripel 330ML","category":"Bier en wijn"},{"name":"Vissticks Krokant 15 Stuks","category":"Diepvries"},{"name":"Roomboter Croissants 4 Stuks","category":"Brood en gebak"},{"name":"Schotel Meergranen Volkoren Knapperig en Vers","category":"Brood en gebak"},{"name":"Rucola 150 g","category":"Aardappelen, groente en fruit"},{"name":"Plakjes Gehaktbal 160 g","category":"Vleeswaren, kaas en tapas"},{"name":"Verse Friet 1 kg","category":"Aardappelen, groente en fruit"},{"name":"Mini Krieltjes 200 g","category":"Aardappelen, groente en fruit"},{"name":"Maza Baba Anoesch 200 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Red Phoenix Sriracha mayo","category":"Conserven, soepen, sauzen, oliën"},{"name":"Ongezouten Roomboter 250 g","category":"Zuivel, eieren, boter"},{"name":"Stacked Flavour Original Chips 170 g","category":"Koek, snoep, chocolade en chips"},{"name":"Vegan Bitterballen Airfryer & Oven ca. 12 Stuks","category":"Diepvries"},{"name":"Verstegen Koriander Gemalen 33 g","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Mandarijnen 1 kg","category":"Aardappelen, groente en fruit"},{"name":"Spitskool 2-3 Personen","category":"Aardappelen, groente en fruit"},{"name":"Pangasiusfilet Citroen/Peper","category":"Vlees, vis en vega"},{"name":"Neutral Waspoeder Kleur 18 wasbeurten","category":"Huishouden"},{"name":"Oreo Double Crème Koekjes 157g","category":"Koek, snoep, chocolade en chips"},{"name":"Maaslander Jong 30+ Kaas Plakken 150 g","category":"Vleeswaren, kaas en tapas"},{"name":"Scharrel Kipfilet 120 g","category":"Vleeswaren, kaas en tapas"},{"name":"Zalmfilet met Huid Naturel ca. 360 g","category":"Vlees, vis en vega"},{"name":"Zalmfilet met Huid Naturel ca. 125 g","category":"Vlees, vis en vega"},{"name":"Zoet & Sappig Mini Roma Trostomaten 300 g","category":"Aardappelen, groente en fruit"},{"name":"Vrije Uitloop Eieren M/L 10 Stuks","category":"Zuivel, eieren, boter"},{"name":"Waspeen 500 g","category":"Aardappelen, groente en fruit"},{"name":"Volkoren Meergranenbollen 2 Stuks","category":"Brood en gebak"},{"name":"Zoete Punt Paprika Mix 3 Stuks","category":"Aardappelen, groente en fruit"},{"name":"Wasa Sesam 250 g","category":"Koek, snoep, chocolade en chips"},{"name":"Vriesverse Bosvruchten Voordeelverpakking 750 g","category":"Diepvries"},{"name":"Yoghurt Griekse Stijl Naturel 10% Vet 1KG","category":"Zuivel, eieren, boter"},{"name":"Zeezout Boter 100 g","category":"Zuivel, eieren, boter"},{"name":"Zonnatura Crunch Sesam 3 x 50 g","category":"Koek, snoep, chocolade en chips"},{"name":"XL Tortilla Naturel 12 Stuks","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"XL Tortilla Naturel 6 Stuks","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Vriesverse Frambozen Blauwe Bessen 250 g","category":"Diepvries"},{"name":"Westmalle Trappist Dubbel 4 x 330ML","category":"Bier en wijn"},{"name":"Zuivelspread Naturel 200 g","category":"Vleeswaren, kaas en tapas"},{"name":"Zoetzuur Rode Uienringen 340 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Zoete Puntpaprika 500 g","category":"Aardappelen, groente en fruit"},{"name":"Worstenbroodjes 4 Stuks","category":"Brood en gebak"},{"name":"XL Tortilla Volkoren 6 Stuks","category":"Wereldkeukens, kruiden, pasta en rijst"},{"name":"Witlof 2-3 Personen 500g","category":"Aardappelen, groente en fruit"},{"name":"Wortelen 500 g","category":"Aardappelen, groente en fruit"},{"name":"Volkoren Pita's 5 Stuks","category":"Brood en gebak"},{"name":"Zongedroogde Sultana Rozijnen 500 g","category":"Ontbijt, broodbeleg en bakproducten"},{"name":"Yoghurt Griekse Stijl 0,1% Vet 1 kg","category":"Zuivel, eieren, boter"},{"name":"Zwarte Olijven Zonder Pit 340 g","category":"Conserven, soepen, sauzen, oliën"},{"name":"Witte Kaas Plak 250 g","category":"Vleeswaren, kaas en tapas"},{"name":"Prei","category":"Aardappelen, groente en fruit"},{"name":"Tomato Frito","category":"Conserven, soepen, sauzen, oliën"}];

    // ---------------- Auth hook ----------------
    function useAuth() {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const unsub = auth.onAuthStateChanged(u => {
          setUser(u);
          setLoading(false);
        });
        return () => unsub();
      }, []);

      return { user, loading };
    }

    // ---------------- User/Household hook ----------------
    function useUserProfile(user) {
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(!!user);

      useEffect(() => {
        if (!user) { setProfile(null); setLoading(false); return; }
        setLoading(true);
        const ref = db.doc(`users/${user.uid}`);
        const unsub = ref.onSnapshot(snap => {
          setProfile(snap.exists ? snap.data() : null);
          setLoading(false);
        }, err => {
          console.error("Profile listener error:", err);
          setLoading(false);
        });
        return () => unsub();
      }, [user]);

      async function setActiveListId(listId) {
        if (!user) return;
        try { await db.doc(`users/${user.uid}`).set({ activeListId: listId }, { merge: true }); }
        catch(e) { console.warn("setActiveListId failed:", e); }
      }

      return { profile, loading, setActiveListId };
    }

    function useHouseholdData(user, householdId, activeListId, setActiveListId) {
      const [members, setMembers] = useState([]);
      const [lists, setLists] = useState([]);
      const [products, setProducts] = useState([]);
      const [items, setItems] = useState([]);
      const [recipes, setRecipes] = useState([]);
      const [syncing, setSyncing] = useState(false);

      useEffect(() => {
        if (!user || !householdId) {
          setMembers([]); setLists([]); setProducts([]); setItems([]); setRecipes([]);
          return;
        }
        const hid = householdId;
        const unsubs = [];

        setSyncing(true);

        unsubs.push(
          db.collection(`households/${hid}/members`).onSnapshot(snap => {
            setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          }, err => console.error("Members listener error:", err))
        );

        unsubs.push(
          db.collection(`households/${hid}/lists_meta`).onSnapshot(snap => {
            const ls = snap.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a,b) => (a.createdAt?.seconds||0) - (b.createdAt?.seconds||0));
            setLists(ls);
          }, err => console.error("Lists_meta listener error:", err))
        );

        unsubs.push(
          db.collection(`households/${hid}/products`).onSnapshot(snap => {
            const psAll = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Only show v2 products (stable IDs) to avoid duplicates with legacy docs.
            const ps = psAll.filter(p => p.schemaVersion === 2 || (typeof p.id === 'string' && p.id.startsWith('p_')));
            setProducts(ps);
            setSyncing(false);
          }, err => { console.error("Products listener error:", err); setSyncing(false); })
        );

        unsubs.push(
          db.collection(`households/${hid}/recipes`).onSnapshot(snap => {
            const rs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
              .sort((a,b) => (a.updatedAt?.seconds||0) < (b.updatedAt?.seconds||0) ? 1 : -1);
            setRecipes(rs);
          }, err => console.error("Recipes listener error:", err))
        );

        return () => unsubs.forEach(fn => fn());
      }, [user, householdId]);

      useEffect(() => {
        if (!user || !householdId || !activeListId) { setItems([]); return; }
        const hid = householdId;
        const ref = db.collection(`households/${hid}/lists/${activeListId}/items`);
        const unsub = ref.onSnapshot(snap => {
          setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, err => console.error("List items listener error:", err));
        return () => unsub();
      }, [user, householdId, activeListId]);

      // Auto-select first list if none
      useEffect(() => {
        if (!householdId) return;
        if (lists.length > 0 && !activeListId) setActiveListId(lists[0].id);
      }, [lists, householdId, activeListId, setActiveListId]);

      return { members, lists, products, items, recipes, syncing };
    }

    // ---------------- UI bits ----------------
    function Button({ children, className='', ...props }) {
      return (
        <button
          className={
            "px-4 py-2.5 rounded-xl font-semibold text-sm " +
            "active:scale-[0.99] transition " +
            "disabled:opacity-60 disabled:active:scale-100 " +
            className
          }
          {...props}
        >
          {children}
        </button>
      );
    }

    function Card({ children }) {
      return <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">{children}</div>;
    }

    function Modal({ title, onClose, children }) {
      const ref = useRef(null);
      useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
      }, [onClose]);

      return (
        <div ref={ref} className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onMouseDown={(e) => { if (e.target === ref.current) onClose?.(); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="font-bold text-base">{title || ''}</div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-sm transform-gpu">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-4">{children}</div>
          </div>
        </div>
      );
    }

    // ---------------- WYSIWYG ----------------
    function WysiwygEditor({ valueHtml, onChangeHtml }) {
      const ref = useRef(null);

      useEffect(() => {
        if (!ref.current) return;
        // Only set if different (avoid caret jumps while typing)
        if (ref.current.innerHTML !== (valueHtml || '')) {
          ref.current.innerHTML = valueHtml || '';
        }
      }, [valueHtml]);

      function exec(cmd, arg=null) {
        ref.current?.focus();
        try { document.execCommand(cmd, false, arg); } catch(e) {}
        onChangeHtml?.(ref.current?.innerHTML || '');
      }

      function handleLink() {
        const url = prompt('Link URL (https://...)');
        if (!url) return;
        exec('createLink', url);
      }

      return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50">
            <button className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs" onMouseDown={(e)=>e.preventDefault()} onClick={()=>exec('bold')}>B</button>
            <button className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs italic" onMouseDown={(e)=>e.preventDefault()} onClick={()=>exec('italic')}>I</button>
            <button className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs underline" onMouseDown={(e)=>e.preventDefault()} onClick={()=>exec('underline')}>U</button>
            <span className="w-px h-6 bg-slate-200 mx-1"></span>
            <button className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs" onMouseDown={(e)=>e.preventDefault()} onClick={()=>exec('insertUnorderedList')}>• lijst</button>
            <button className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs" onMouseDown={(e)=>e.preventDefault()} onClick={()=>exec('insertOrderedList')}>1. lijst</button>
            <span className="w-px h-6 bg-slate-200 mx-1"></span>
            <button className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs" onMouseDown={(e)=>e.preventDefault()} onClick={handleLink}>link</button>
            <button className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs" onMouseDown={(e)=>e.preventDefault()} onClick={()=>exec('removeFormat')}>clear</button>
          </div>

          <div
            ref={ref}
            className="wysiwyg px-3 py-2 text-sm outline-none"
            contentEditable
            data-placeholder="Schrijf hier de bereiding…"
            onInput={() => onChangeHtml?.(ref.current?.innerHTML || '')}
          />
        </div>
      );
    }

    // ---------------- Household setup ----------------
    function SetupScreen({ user, onCreated }) {
      const [mode, setMode] = useState('join'); // join | create
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState('');
      const [code, setCode] = useState('');
      const [householdName, setHouseholdName] = useState('Ons huishouden');

      async function createHousehold() {
        setError('');
        setBusy(true);
        try {
          const householdId = genId('h');
          let inviteCode = makeCode();

          // ensure code uniqueness (best-effort)
          for (let i=0;i<5;i++) {
            const s = await db.doc(`invite_codes/${inviteCode}`).get();
            if (!s.exists) break;
            inviteCode = makeCode();
          }

          const listId = genId('l');

          // 1) Add as member first (needed for security rules)
          await db.doc(`households/${householdId}/members/${user.uid}`).set({
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

          // 2) Household meta
          await db.doc(`households/${householdId}/meta/info`).set({
            name: householdName.trim() || 'Ons huishouden',
            code: inviteCode,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: user.uid,
          });

          // 3) Invite code
          await db.doc(`invite_codes/${inviteCode}`).set({
            householdId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

          // 4) Default list
          await db.doc(`households/${householdId}/lists_meta/${listId}`).set({
            name: 'Boodschappen',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: user.uid,
          });

          // 5) Seed default products
          if (DEFAULT_PRODUCTS.length > 0) {
            const BATCH_SIZE = 400;
            for (let i = 0; i < DEFAULT_PRODUCTS.length; i += BATCH_SIZE) {
              const batch = db.batch();
              DEFAULT_PRODUCTS.slice(i, i + BATCH_SIZE).forEach(p => {
                const pid = genId('p');
                batch.set(db.doc(`households/${householdId}/products/${pid}`), {
                  name: p.name,
                  category: p.category || 'Overig',
                  cycle: '',
                  schemaVersion: 2,
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  updatedBy: user.uid,
                  updatedByName: user.displayName || '',
                  updatedByPhotoURL: user.photoURL || '',
                });
              });
              await batch.commit();
            }
          }

          // 6) LAST: link user to household (triggers UI transition via onSnapshot)
          await db.doc(`users/${user.uid}`).set({
            householdId,
            activeListId: listId,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            email: user.email || '',
          }, { merge: true });

          // Show invite code dialog
          onCreated({ code: inviteCode, name: householdName.trim() || 'Ons huishouden' });
        } catch (e) {
          console.error("Create household error:", e);
          setError(e?.message || 'Er ging iets mis bij het aanmaken.');
        }
        setBusy(false);
      }

      async function joinHousehold() {
        setError('');
        setBusy(true);
        try {
          const joinCode = code.trim().toUpperCase();
          if (joinCode.length !== 6) { setError('Code moet 6 tekens zijn.'); setBusy(false); return; }
          const codeSnap = await db.doc(`invite_codes/${joinCode}`).get();
          if (!codeSnap.exists) { setError('Code niet gevonden.'); setBusy(false); return; }
          const { householdId } = codeSnap.data();

          // 1) member eerst
          await db.doc(`households/${householdId}/members/${user.uid}`).set({
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          // 2) daarna: kies eerste lijst
          let activeListId = null;
          const listsSnap = await db.collection(`households/${householdId}/lists_meta`).orderBy('createdAt','asc').limit(1).get();
          if (!listsSnap.empty) activeListId = listsSnap.docs[0].id;

          if (!activeListId) {
            activeListId = genId('l');
            await db.doc(`households/${householdId}/lists_meta/${activeListId}`).set({
              name: 'Boodschappen',
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              createdBy: user.uid,
            });
          }

          await db.doc(`users/${user.uid}`).set({
            householdId,
            activeListId,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            email: user.email || '',
          }, { merge: true });
        } catch (e) {
          console.error("Join household error:", e);
          setError(e?.message || 'Er ging iets mis bij het deelnemen.');
        }
        setBusy(false);
      }

      return (
        <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-slate-900">Boodschappenlijstjesmaker</h1>
            <div className="flex items-center gap-2">
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-full bg-slate-200" />
              <button onClick={() => auth.signOut()} className="text-xs text-slate-500 underline">uitloggen</button>
            </div>
            </div>

          <Card>
            <div className="p-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">Kies wat je wil doen</div>
              <div className="flex gap-2 mb-4">
                <Button onClick={() => setMode('join')}
                  className={mode==='join' ? 'bg-emerald-600 text-white flex-1' : 'bg-white border border-slate-200 text-slate-700 flex-1'}>
                  Deelnemen
                </Button>
                <Button onClick={() => setMode('create')}
                  className={mode==='create' ? 'bg-emerald-600 text-white flex-1' : 'bg-white border border-slate-200 text-slate-700 flex-1'}>
                  Nieuw huishouden
                </Button>
              </div>

              {mode === 'join' ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">Huishoud-code</div>
                    <input value={code} onChange={(e)=>setCode(e.target.value.toUpperCase())}
                      placeholder="bijv. KRDPKY"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono tracking-wider" />
                    <div className="text-[11px] text-slate-400 mt-1">6 tekens (letters/cijfers).</div>
                  </div>
                  {error && <div className="text-sm text-rose-600">{error}</div>}
                  <Button onClick={joinHousehold} disabled={busy}
                    className={"w-full " + (busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white')}>
                    {busy ? 'Bezig…' : 'Deelnemen'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">Naam van je huishouden</div>
                    <input value={householdName} onChange={(e)=>setHouseholdName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white" />
                  </div>
                  {error && <div className="text-sm text-rose-600">{error}</div>}
                  <Button onClick={createHousehold} disabled={busy}
                    className={"w-full " + (busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 text-white')}>
                    {busy ? 'Bezig…' : 'Aanmaken'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    // ---------------- Header ----------------
    function Header({ user, householdId, householdInfo, members, syncing, storeMode, setStoreMode, onCopyCode, onSignOut }) {
      const [editingName, setEditingName] = useState(false);
      const [draftName, setDraftName] = useState(householdInfo?.name || '');
      const [showMenu, setShowMenu] = useState(false);
      const [showManage, setShowManage] = useState(false);

      const isOwner = householdInfo?.createdBy === user?.uid;

      useEffect(() => {
        setDraftName(householdInfo?.name || '');
      }, [householdInfo?.name, householdId]);

      async function saveName() {
        const next = (draftName || '').trim();
        setEditingName(false);
        if (!householdId) return;
        if (!next) return;
        try {
          await db.doc(`households/${householdId}/meta/info`).set({ name: next }, { merge: true });
        } catch (e) {
          console.error('Household name update failed', e);
        }
      }

      function HouseholdNameLine() {
        const name = householdInfo?.name || '';
        if (!editingName) {
          return (
            <button
              onClick={() => setEditingName(true)}
              className="text-left text-xs text-slate-500 mt-0.5 inline-flex items-center gap-2"
              title="Huishoudnaam wijzigen"
            >
              <span>🏠</span>
              <span className="truncate max-w-[14rem]">{name || "Mijn huishouden"}</span>
              <EditIcon className="w-3.5 h-3.5 text-slate-400" />
            </button>
          );
        }
        return (
          <div className="mt-0.5 inline-flex items-center gap-2">
            <span className="text-xs text-slate-500">🏠</span>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); saveName(); }
                if (e.key === 'Escape') { e.preventDefault(); setEditingName(false); setDraftName(householdInfo?.name || ''); }
              }}
              autoFocus
              placeholder="Huishoudnaam"
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white w-48"
            />
            <button
              onClick={saveName}
              className="text-[11px] px-2 py-1 rounded-lg bg-emerald-600 text-white"
            >
              Ok
            </button>
          </div>
        );
      }

      function Avatar({ m, i }) {
        const url = m?.photoURL || '';
        const name = m?.name || m?.displayName || 'Lid';
        const initial = (name.trim()[0] || '?').toUpperCase();
        return (
          <div
            key={m?.uid || i}
            className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-600"
            style={{ zIndex: 50 - i }}
            title={name}
          >
            {url ? <img src={url} className="w-full h-full object-cover" /> : initial}
          </div>
        );
      }

      const membersSorted = (members || []).slice().sort((a,b) => (a?.name||'').localeCompare(b?.name||''));
      const maxShow = 10;
      const show = membersSorted.slice(0, maxShow);
      const extra = Math.max(0, membersSorted.length - show.length);

      return (
        <header className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 leading-tight">Boodschappenlijstjesmaker</h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-1 cursor-pointer select-none"
                onClick={() => setStoreMode?.(!storeMode)}
                title={storeMode ? "Winkelmodus uit" : "Winkelmodus aan"}
              >
                <img src={storeMode ? CART_FULL : CART_EMPTY} className="w-6 h-6" style={{objectFit:'contain'}} />
                <div className={"relative w-11 h-6 rounded-full transition-colors duration-200 " + (storeMode ? "bg-emerald-500" : "bg-slate-300")}>
                  <div className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 " + (storeMode ? "translate-x-5" : "translate-x-0")} />
                </div>
              </div>
              {syncing ? <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Synchroniseren"></span>
                        : <span className="w-2 h-2 rounded-full bg-emerald-400" title="Gesynchroniseerd"></span>}
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 transform-gpu" style={{ WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}>
                  {user.photoURL ? <img src={user.photoURL} className="w-7 h-7 rounded-full transform-gpu" /> : <div className="w-7 h-7 rounded-full bg-slate-200 transform-gpu"></div>}
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden w-52">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <div className="text-xs font-semibold text-slate-900 truncate">{user.displayName || user.email}</div>
                        <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => { setShowMenu(false); setShowManage(true); }}
                          className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >⚙️ Huishouden beheren</button>
                      )}
                      <button
                        onClick={() => { setShowMenu(false); onSignOut(); }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100"
                      >🚪 Uitloggen</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {!storeMode && (
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <HouseholdNameLine />
              <div className="inline-flex items-center -space-x-2" aria-label="Leden">
                {show.map((m, idx) => <Avatar key={(m && (m.uid || m.id)) || idx} m={m} i={idx} />)}
                {extra > 0 && (
                  <div
                    className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600"
                    style={{ zIndex: 0 }}
                    title={`${extra} meer`}
                  >
                    +{extra}
                  </div>
                )}
              </div>
            </div>
          )}

          {showManage && (
            <Modal title="Huishouden beheren" onClose={() => setShowManage(false)}>
              {/* Invite code */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 mb-1">Uitnodigingscode</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono font-bold text-lg tracking-widest text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
                    {householdInfo?.code || '—'}
                  </div>
                  <button
                    onClick={() => {
                      if (householdInfo?.code) {
                        navigator.clipboard.writeText(householdInfo.code).catch(() => {});
                      }
                    }}
                    className="text-xs px-2 py-1.5 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"
                  >Kopieer</button>
                </div>
              </div>

              {/* Members list */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-500 mb-2">Leden ({(members || []).length})</div>
                <div className="space-y-2">
                  {(members || []).map(m => {
                    const mId = m?.uid || m?.id;
                    const mName = m?.name || m?.displayName || 'Lid';
                    const mPhoto = m?.photoURL || '';
                    const isMe = mId === user?.uid;
                    const isCreator = mId === householdInfo?.createdBy;
                    return (
                      <div key={mId} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-slate-50">
                        {mPhoto
                          ? <img src={mPhoto} className="w-6 h-6 rounded-full" />
                          : <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {(mName.trim()[0] || '?').toUpperCase()}
                            </div>
                        }
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {mName}{isMe ? ' (jij)' : ''}{isCreator ? ' ⭐' : ''}
                          </div>
                        </div>
                        {isOwner && !isMe && (
                          <button
                            onClick={async () => {
                              if (!confirm(`${mName} verwijderen uit het huishouden?`)) return;
                              try {
                                await db.doc(`households/${householdId}/members/${mId}`).delete();
                              } catch(e) {
                                console.error('Remove member error:', e);
                                alert('Kon lid niet verwijderen: ' + (e?.message || 'Onbekende fout'));
                              }
                            }}
                            className="text-[10px] px-2 py-1 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 shrink-0"
                          >Verwijderen</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete household */}
              {isOwner && (
                <div className="border-t border-slate-100 pt-4">
                  <button
                    onClick={async () => {
                      if (!confirm('Weet je zeker dat je het hele huishouden wilt verwijderen? Dit kan niet ongedaan worden.')) return;
                      if (!confirm('Echt zeker? Alle lijsten, producten en recepten worden verwijderd.')) return;
                      try {
                        // Delete invite code
                        if (householdInfo?.code) {
                          await db.doc(`invite_codes/${householdInfo.code}`).delete().catch(() => {});
                        }

                        // Helper to delete all docs in a collection
                        async function deleteCollection(path) {
                          const snap = await db.collection(path).get();
                          if (!snap.empty) {
                            const batch = db.batch();
                            snap.docs.forEach(d => batch.delete(d.ref));
                            await batch.commit();
                          }
                        }

                        // Delete subcollections
                        const listsMeta = await db.collection(`households/${householdId}/lists_meta`).get();
                        for (const listDoc of listsMeta.docs) {
                          await deleteCollection(`households/${householdId}/lists/${listDoc.id}/items`);
                        }
                        await deleteCollection(`households/${householdId}/lists_meta`);
                        await deleteCollection(`households/${householdId}/products`);
                        await deleteCollection(`households/${householdId}/recipes`);
                        await deleteCollection(`households/${householdId}/members`);

                        // Delete meta
                        await db.doc(`households/${householdId}/meta/info`).delete().catch(() => {});

                        // Clear own user doc (other members will see household is gone on next load)
                        await db.doc(`users/${user.uid}`).set({
                          householdId: firebase.firestore.FieldValue.delete(),
                          activeListId: firebase.firestore.FieldValue.delete(),
                        }, { merge: true }).catch(() => {});

                        setShowManage(false);
                        window.location.reload();
                      } catch(e) {
                        console.error('Delete household error:', e);
                        alert('Kon huishouden niet verwijderen: ' + (e?.message || 'Onbekende fout'));
                      }
                    }}
                    className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                  >🗑️ Huishouden verwijderen</button>
                </div>
              )}
            </Modal>
          )}
        </header>
      );
    }

    // ---------------- Products tab ----------------
    
function ProductsTab({ householdId, products, items, currentUser, activeListId }) {
  const [query, setQuery] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Overig');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Overig');

  // Cycle chips (W / 2W / 3W): clicking a chip puts those products on top AND selects them.
  const [cycleFlags, setCycleFlags] = useState(() => ({ W: false, '2W': false, '3W': false }));

  // Sorting inside the Products tab
  // - 'cycle': within the “cycle section” sort by W/2W/3W, then name
  // - 'az': name A–Z
  // - 'category': category, then name
  const [sortMode, setSortMode] = useState('az');

  function normCycle(c) {
    return String(c || '').toUpperCase().trim();
  }

  function cycleEnabled(c) {
    const nc = normCycle(c);
    return nc === 'W' || nc === '2W' || nc === '3W' ? !!cycleFlags[nc] : false;
  }

  // Selection for quick add
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  function cycleRank(cycle) {
    const c = String(cycle || '').toUpperCase();
    if (c === 'W') return 0;
    if (c === '2W') return 1;
    if (c === '3W') return 2;
    return 3; // none last
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = products || [];
    if (q) arr = arr.filter(p => (p.name||'').toLowerCase().includes(q));

    const cmpAZ = (a,b) => (a.name||'').localeCompare(b.name||'', 'nl');
    const cmpCategory = (a,b) => {
      const ca = (a.category || 'Overig');
      const cb = (b.category || 'Overig');
      const dc = ca.localeCompare(cb, 'nl');
      if (dc !== 0) return dc;
      return cmpAZ(a,b);
    };

    const innerCmp = q ? ((a,b) => {
      const ra = searchRelevance(a.name, q);
      const rb = searchRelevance(b.name, q);
      if (ra !== rb) return ra - rb;
      return (a.name||'').localeCompare(b.name||'', 'nl');
    }) : (sortMode === 'category') ? cmpCategory : cmpAZ;

    // Always put the chosen cycles on top (when any chip is active)
    const anyCycleActive = !!(cycleFlags.W || cycleFlags['2W'] || cycleFlags['3W']);

    arr = [...arr].sort((a,b) => {
      if (anyCycleActive) {
        const aOn = cycleEnabled(a.cycle);
        const bOn = cycleEnabled(b.cycle);
        if (aOn !== bOn) return aOn ? -1 : 1;
      }
      return innerCmp(a,b);
    });

    return arr;
  }, [products, query, cycleFlags, sortMode]);

  const groupedFiltered = useMemo(() => {
    const activeCycles = ['W','2W','3W'].filter(c => cycleFlags[c]);
    const hasActiveCycles = activeCycles.length > 0;
    const cycleItems = hasActiveCycles ? filtered.filter(p => cycleEnabled(p.cycle)) : [];
    const categoryItems = hasActiveCycles ? filtered.filter(p => !cycleEnabled(p.cycle)) : filtered;

    if (sortMode === 'az') {
      const flatGroups = categoryItems.length ? [{
        kind: 'flat',
        category: '',
        items: categoryItems,
      }] : [];
      if (!cycleItems.length) return flatGroups;
      const cycleLabel = activeCycles.length === 1
        ? (activeCycles[0] === 'W' ? 'Elke week' : (activeCycles[0] === '2W' ? 'Elke 2 weken' : 'Elke 3 weken'))
        : 'Geselecteerde herhaling';
      return [{
        kind: 'cycle',
        category: cycleLabel,
        items: cycleItems,
      }, ...flatGroups];
    }

    const map = {};
    categoryItems.forEach(p => {
      const cat = p.category || 'Overig';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    const groups = Object.keys(map).map(category => ({
      kind: 'category',
      category,
      items: map[category],
    }));
    if (!cycleItems.length) return groups;
    const cycleLabel = activeCycles.length === 1
      ? (activeCycles[0] === 'W' ? 'Elke week' : (activeCycles[0] === '2W' ? 'Elke 2 weken' : 'Elke 3 weken'))
      : 'Geselecteerde herhaling';
    return [{
      kind: 'cycle',
      category: cycleLabel,
      items: cycleItems,
    }, ...groups];
  }, [filtered, cycleFlags, sortMode]);


  async function createProduct() {
    const name = query.trim();
    if (!name || !householdId) return;
    const exists = (products||[]).some(p => (p.name||'').toLowerCase() === name.toLowerCase());
    if (exists) { alert('Dit product bestaat al (op naam).'); return; }

    const id = genId('p');
    const product = {
      id,
      schemaVersion: 2,
      name,
      category: newProductCategory || 'Overig',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: currentUser?.uid || '',
      updatedByName: currentUser?.displayName || '',
      updatedByPhotoURL: currentUser?.photoURL || '',
      cycle: '',
    };
    await db.doc(`households/${householdId}/products/${id}`).set(product);
    setQuery('');
    setNewProductCategory('Overig');
  }

  function startEdit(p) {
    setEditingId(p.id);
    setEditName(p.name || '');
    setEditCategory(p.category || 'Overig');
  }

  async function saveEdit() {
    if (!householdId || !editingId) return;
    const name = editName.trim();
    if (!name) return;
    await db.doc(`households/${householdId}/products/${editingId}`).set({
      name,
      category: editCategory || 'Overig',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: currentUser?.uid || '',
      updatedByName: currentUser?.displayName || '',
      updatedByPhotoURL: currentUser?.photoURL || '',
    }, { merge: true });
    setEditingId(null);
  }

  async function cycleProduct(p) {
    if (!householdId) return;
    const cur = (p.cycle || '');
    const next = cur === '' ? 'W' : (cur === 'W' ? '2W' : (cur === '2W' ? '3W' : ''));
    await db.doc(`households/${householdId}/products/${p.id}`).update({ cycle: next });
  }

  async function deleteProduct(p) {
    if (!householdId) return;
    if (!confirm(`Verwijder "${p.name}"?`)) return;
    await db.doc(`households/${householdId}/products/${p.id}`).delete();
    if (editingId === p.id) setEditingId(null);
    // also remove from selection
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(p.id);
      return next;
    });
  }

  function currentQty(it) {
    if (!it) return 0;
    const q = (it.qty != null) ? Number(it.qty) : NaN;
    if (!isNaN(q)) return clamp(q, 0, 99);
    const unit = String(it.unit || 'st').toLowerCase();
    const amt = parseFloat(String(it.amount ?? '0').replace(',','.'));
    if (!isNaN(amt) && DISCRETE_UNITS.includes(unit)) return clamp(Math.round(amt), 0, 99);
    return 0;
  }

  function findExistingByProductId(productId) {
    if (!productId) return null;
    const arr = (items || []);
    return arr.find(x => x.productId === productId && !x.checked) || arr.find(x => x.productId === productId) || null;
  }

  async function decItemFromProduct(p) {
    if (!activeListId) { alert('Maak eerst een lijst aan.'); return; }
    const existing = findExistingByProductId(p.id);
    if (!existing) return;
    const next = clamp(currentQty(existing) - 1, 0, 99);
    const ref = db.doc(`households/${householdId}/lists/${activeListId}/items/${existing.id}`);
    if (next <= 0) { await ref.delete(); return; }
    await ref.set({
      qty: next,
      amount: String(next),
      unit: 'st',
      checked: false,
      nameSnapshot: p.name || existing.nameSnapshot || '',
      categorySnapshot: p.category || existing.categorySnapshot || 'Overig',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: currentUser?.uid || '',
      updatedByName: currentUser?.displayName || '',
      updatedByPhotoURL: currentUser?.photoURL || '',
    }, { merge: true });
  }

  async function addItemFromProduct(p) {
    if (!activeListId) { alert('Maak eerst een lijst aan.'); return; }
    const existing = findExistingByProductId(p.id);
    if (existing) {
      const next = clamp(currentQty(existing) + 1, 0, 99);
      await db.doc(`households/${householdId}/lists/${activeListId}/items/${existing.id}`).set({
        qty: next,
        amount: String(next),
        unit: 'st',
        checked: false,
        nameSnapshot: p.name || existing.nameSnapshot || '',
        categorySnapshot: p.category || existing.categorySnapshot || 'Overig',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: currentUser?.uid || '',
        updatedByName: currentUser?.displayName || '',
        updatedByPhotoURL: currentUser?.photoURL || '',
      }, { merge: true });
      return;
    }
    const id = genId('li');
    await db.doc(`households/${householdId}/lists/${activeListId}/items/${id}`).set({
      id,
      productId: p.id,
      nameSnapshot: p.name || '',
      categorySnapshot: p.category || 'Overig',
      qty: 1,
      amount: '1',
      unit: 'st',
      checked: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: currentUser?.uid || '',
      createdByName: currentUser?.displayName || '',
      createdByPhotoURL: currentUser?.photoURL || '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: currentUser?.uid || '',
      updatedByName: currentUser?.displayName || '',
      updatedByPhotoURL: currentUser?.photoURL || '',
      source: 'product',
    });
  }

  function toggleSelected(productId) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function toggleCycleChip(cycle) {
    const c = String(cycle).toUpperCase();
    // Toggle chip flag
    setCycleFlags(prev => {
      const nextOn = !prev[c];
      const next = { ...prev, [c]: nextOn };

      // Auto-select / deselect products in this cycle when toggling
      setSelectedIds(selPrev => {
        const selNext = new Set(selPrev);
        (products || []).forEach(p => {
          if (normCycle(p.cycle) === c) {
            if (nextOn) selNext.add(p.id);
            else selNext.delete(p.id);
          }
        });
        return selNext;
      });

      return next;
    });
  }


  async function addSelection() {
    if (!activeListId) { alert('Maak eerst een lijst aan.'); return; }
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const byId = new Map((products||[]).map(p => [p.id, p]));
    for (const id of ids) {
      const p = byId.get(id);
      if (p) await addItemFromProduct(p);
    }
    // Clear selection after adding
    setSelectedIds(new Set());
  }

  const selectedCount = selectedIds.size;
  const editingProduct = editingId ? (products || []).find(p => p.id === editingId) : null;

  function cycleLabel(cycle) {
    const c = normCycle(cycle);
    if (c === 'W') return 'Elke week';
    if (c === '2W') return 'Elke 2 weken';
    if (c === '3W') return 'Elke 3 weken';
    return 'Geen herhaling';
  }

  return (
    <div className="pb-24">
      <div className="mb-3 space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)}
            onKeyDown={(e)=>{ if (e.key === 'Enter' && query.trim()) { e.preventDefault(); createProduct(); } if (e.key === 'Escape') { e.preventDefault(); setQuery(''); setNewProductCategory('Overig'); } }}
            placeholder="Zoek of maak product…"
            className="w-full sm:flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
          <select
            value={newProductCategory || 'Overig'}
            onChange={(e)=>setNewProductCategory(e.target.value)}
            className="w-full sm:w-56 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
            title="Categorie voor nieuw product"
          >
            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {query.trim() ? (
            <>
              <Button onClick={createProduct} className="bg-emerald-600 text-white w-full sm:w-12 px-0" title="Product aanmaken">✓</Button>
              <Button onClick={()=>{ setQuery(''); setNewProductCategory('Overig'); }} className="bg-rose-500 text-white w-full sm:w-12 px-0" title="Annuleren">✕</Button>
            </>
          ) : (
            <Button onClick={createProduct} className="bg-emerald-600 text-white w-full sm:w-12 px-0" title="Product aanmaken">+</Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1">
            {['W','2W','3W'].map(c => (
              <button
                key={c}
                onClick={() => toggleCycleChip(c)}
                className={"px-3 py-2 rounded-xl text-xs font-medium border " + (cycleFlags[c] ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200")}
                title={cycleFlags[c] ? `Cyclus ${c}: geselecteerd` : `Cyclus ${c}: niet geselecteerd`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1"><button
              onClick={() => setSortMode('az')}
              className={"px-3 py-2 rounded-xl text-xs font-medium border " + (sortMode === 'az' ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200")}
              title="Sorteer alfabetisch"
            >
              A–Z
            </button>
            <button
              onClick={() => setSortMode('category')}
              className={"px-3 py-2 rounded-xl text-xs font-medium border " + (sortMode === 'category' ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200")}
              title="Sorteer op categorie, daarna op naam"
            >
              Categorie
            </button>
          </div>
        </div>
      </div>

      <div className="relative left-1/2 w-screen -translate-x-1/2 space-y-3">
        {filtered.length === 0 ? (
          <div className="max-w-xl mx-auto bg-white border-y-2 border-slate-200 p-6 text-center text-slate-400">
            <div className="text-4xl mb-1">📋</div>
            <div className="text-sm">Geen producten</div>
          </div>
        ) : groupedFiltered.map(group => (
          <div key={`${group.kind}-${group.category}`}>
            {group.kind !== 'flat' && (
              <div className="max-w-xl mx-auto px-3 mb-0">
                <span
                  className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-tr-lg"
                  style={{
                    backgroundColor: group.kind === 'cycle' ? '#e7ece4' : categoryColor(group.category) + '29',
                    color: group.kind === 'cycle' ? '#536158' : '#33423d'
                  }}
                >
                  {group.category}
                </span>
              </div>
            )}
            <div
              className={"bg-white border-y-2 border-slate-200/80 " + (group.kind === 'flat' ? "" : "border-l-[4px]")}
              style={group.kind === 'flat' ? undefined : { borderLeftColor: (group.kind === 'cycle' ? '#d3dbcf' : categoryColor(group.category) + '88') }}
            >
              {group.items.map(p => {
                const existing = findExistingByProductId(p.id);
                const qty = currentQty(existing);
                const isSelected = selectedIds.has(p.id);

                return (
                  <div key={p.id} className="max-w-xl mx-auto px-3 py-3 flex items-center gap-2 border-b-2 border-slate-200/80 last:border-b-0">
                    <button
                      onClick={() => toggleSelected(p.id)}
                      className={
                        "w-6 h-6 rounded-lg border flex items-center justify-center text-xs shrink-0 " +
                        (isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-300 text-slate-400")
                      }
                      title={isSelected ? "Deselecteren" : "Selecteren"}
                    >
                      {isSelected ? "✓" : ""}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="font-normal text-[15px] text-slate-800 truncate">{p.name}</div>
                    </div>

                    <QuantityControl
                      qty={qty}
                      onDec={()=>decItemFromProduct(p)}
                      onInc={()=>addItemFromProduct(p)}
                      plusTitle="Toevoegen aan lijst"
                      collapseAtOne
                    />

                    <button onClick={()=>startEdit(p)} className="w-9 h-9 rounded-full bg-transparent text-slate-600 flex items-center justify-center" title="Product bewerken">
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="fixed left-0 right-0 bottom-0 pb-6 px-4 z-40">
          <div className="max-w-xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-3 py-3 flex items-center gap-2">
              <div className="flex-1 text-sm text-slate-700">
                Selectie: <span className="font-bold">{selectedCount}</span>
              </div>
              <Button onClick={addSelection} className="bg-emerald-600 text-white">Selectie toevoegen</Button>
            </div>
          </div>
        </div>
      )}

      {editingId && (
        <Modal title="Product bewerken" onClose={()=>setEditingId(null)}>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Naam</div>
              <input value={editName} onChange={(e)=>setEditName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">Categorie</div>
              <select value={editCategory} onChange={(e)=>setEditCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {editingProduct && (
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">Herhaling</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={()=>cycleProduct(editingProduct)}
                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold"
                  >
                    {cycleLabel(editingProduct.cycle)}
                  </button>
                  <div className="text-xs text-slate-400">Tik om te wisselen tussen W, 2W en 3W.</div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={()=>setEditingId(null)} className="bg-slate-100 text-slate-700 flex-1">Annuleren</Button>
              <Button onClick={saveEdit} className="bg-emerald-600 text-white flex-1">Opslaan</Button>
            </div>
            {editingProduct && (
              <button
                onClick={()=>deleteProduct(editingProduct)}
                className="w-full px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-sm font-semibold"
              >
                Product verwijderen
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}


    
      const SmallAvatar = React.memo(function SmallAvatar({ url, name, size = 24 }) {
        const nm = (name || '').trim();
        const initial = (nm ? nm[0] : '?').toUpperCase();
        const px = Math.max(16, Math.min(32, Number(size)||24));
        const style = { width: px + 'px', height: px + 'px' };
        return (
          <div
            style={style}
            className="rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0"
            title={nm ? `Laatst aangepast door ${nm}` : 'Laatst aangepast (onbekend)'}
          >
            {url ? <img src={url} alt={nm || 'avatar'} className="w-full h-full object-cover" /> : initial}
          </div>
        );
      });

// ---------------- List tab ----------------
    function categoryColor(cat) {
      const c = (cat || '').toLowerCase();
      if (c.includes('groente') || c.includes('aardappel') || c.includes('fruit')) return '#16a34a';
      if (c.includes('verse') || c.includes('maaltijd') || c.includes('gemak')) return '#0d9488';
      if (c.includes('vleeswaren') || c.includes('kaas') || c.includes('tapas')) return '#ea580c';
      if (c.includes('vlees') || c.includes('vis')) return '#e11d48';
      if (c.includes('vega') || c.includes('plantaardig')) return '#65a30d';
      if (c.includes('zuivel') || c.includes('eieren') || c.includes('boter')) return '#2563eb';
      if (c.includes('ontbijt') || c.includes('broodbeleg')) return '#ca8a04';
      if (c.includes('brood') || c.includes('gebak')) return '#d97706';
      if (c.includes('conserven') || c.includes('soep') || c.includes('saus') || c.includes('oli')) return '#7c3aed';
      if (c.includes('wereldkeuken') || c.includes('kruiden') || c.includes('pasta') || c.includes('rijst')) return '#c026d3';
      if (c.includes('koek') || c.includes('snoep') || c.includes('chocolade') || c.includes('chips')) return '#db2777';
      if (c.includes('koffie') || c.includes('thee')) return '#92400e';
      if (c.includes('frisdrank') || c.includes('sap')) return '#0891b2';
      if (c.includes('bier') || c.includes('wijn')) return '#b45309';
      if (c.includes('diepvries')) return '#0284c7';
      if (c.includes('drogist')) return '#4f46e5';
      if (c.includes('huishoud')) return '#64748b';
      return '#64748b';
    }

    function ListTab({ householdId, activeListId, products, items, currentUser, storeMode }) {
      const [newText, setNewText] = useState('');
      const [newCategory, setNewCategory] = useState('Overig');
      const [showSuggestions, setShowSuggestions] = useState(false);
      const [showAllDone, setShowAllDone] = useState(false);
      const addInputRef = useRef(null);

      // Mobile UX: "magnet" add bar to top on focus (especially iOS keyboard)
      const [stickyAdd, setStickyAdd] = useState(false);
      const [vvh, setVvh] = useState(() => (window.visualViewport ? window.visualViewport.height : window.innerHeight));
      const suggestionsRef = useRef(null);
      const [showAdders, setShowAdders] = useState(false);
      const [flashId, setFlashId] = useState(null);
      const [pendingCheckIds, setPendingCheckIds] = useState(() => new Set());
      const [openQtyId, setOpenQtyId] = useState(null);

      const STORE_CATEGORY_ORDER = [
        'Groente & fruit',
        'Brood & beleg',
        'Zuivel & eieren',
        'Vlees/vis/vega',
        'Vers / koeling',
        'Pasta/rijst/maaltijdpakketten',
        'Conserven',
        'Ontbijt & snacks',
        'Dranken',
        'Diepvries',
        'Huishoud',
        'Drogisterij',
        'Overig'
      ];

      function storeCatRank(cat) {
        const c = String(cat || 'Overig').trim();
        const idx = STORE_CATEGORY_ORDER.findIndex(x => x.toLowerCase() === c.toLowerCase());
        return idx === -1 ? 999 : idx;
      }


      function scrollAddBoxIntoView(alignTop = true) {
        const el = addInputRef.current;
        if (!el) return;

        const r = el.getBoundingClientRect();
        const topPad = 8; // small breathing space
        // Aim to place the input at the very top of the layout viewport.
        const target = window.scrollY + r.top - (alignTop ? topPad : 12);

        // iOS: keyboard opens AFTER focus; do a couple of passes.
        const doScroll = () => {
          const rr = el.getBoundingClientRect();
          const t = window.scrollY + rr.top - (alignTop ? topPad : 12);
          window.scrollTo({ top: Math.max(0, t), behavior: 'smooth' });
        };

        window.requestAnimationFrame(doScroll);
        setTimeout(doScroll, 50);
        setTimeout(doScroll, 180);
      }

      function formatNeedsLine(needsByRecipe) {
        const entries = Object.values(needsByRecipe || {});
        if (!entries.length) return "";
        const byUnit = new Map();
        const textBits = [];

        entries.forEach(e => {
          const unit = String(e?.unit || "").trim();
          if (e?.value != null && isFinite(Number(e.value))) {
            const cur = byUnit.get(unit) || 0;
            byUnit.set(unit, cur + Number(e.value));
          } else if (e?.valueText) {
            textBits.push(`${e.valueText} ${unit}`.trim());
          }
        });

        const parts = [];
        for (const [unit, total] of byUnit.entries()) {
          const nice = (Math.round(total * 100) / 100).toString().replace('.', ',');
          parts.push(`${nice} ${unit}`.trim());
        }
        parts.push(...textBits);

        const label = "nodig:";
        return `${label} ${parts.join(" + ")}`;
      }

      useEffect(() => {
        // Track viewport height (iOS keyboard shrinks visual viewport)
        const vv = window.visualViewport;
        if (!vv) return;
        const handler = () => setVvh(vv.height);
        vv.addEventListener('resize', handler);
        vv.addEventListener('scroll', handler);
        handler();

return () => {
          vv.removeEventListener('resize', handler);
          vv.removeEventListener('scroll', handler);
        };
      }, []);

      
      useEffect(() => {
        // While typing: keep the add bar pinned; prevent the page from scrolling under the keyboard.
        if (!stickyAdd) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // On iOS, body can still "rubberband" unless we actively block touchmove.
        const onTouchMove = (e) => {
          const root = suggestionsRef.current;
          if (root && e.target && root.contains(e.target)) {
            // allow scrolling inside the suggestions dropdown
            return;
          }
          e.preventDefault();
        };

        document.addEventListener('touchmove', onTouchMove, { passive: false });

        const onWheel = (e) => {
          const root = suggestionsRef.current;
          if (root && e.target && root.contains(e.target)) {
            return; // allow scrolling inside dropdown
          }
          e.preventDefault();
        };
        document.addEventListener('wheel', onWheel, { passive: false });


        return () => {
          document.body.style.overflow = prevOverflow;
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('wheel', onWheel);
        };
      }, [stickyAdd]);

useEffect(() => {
        // When the add bar is "magnetized", keep it pinned after keyboard transitions.
        if (!stickyAdd) return;
        scrollAddBoxIntoView(true);
      }, [stickyAdd, vvh]);

      // Undo (alleen voor verwijderen)
      const [undoState, setUndoState] = useState(null); // { payload, label }
      const undoTimerRef = useRef(null);

      function clearUndoTimer() {
        if (undoTimerRef.current) {
          clearTimeout(undoTimerRef.current);
          undoTimerRef.current = null;
        }
      }

      function scheduleUndoClear() {
        clearUndoTimer();
        undoTimerRef.current = setTimeout(() => {
          setUndoState(null);
          undoTimerRef.current = null;
        }, 5000);
      }

      async function undoDelete() {
        if (!undoState || !householdId || !activeListId) return;
        const payload = undoState.payload;
        setUndoState(null);
        clearUndoTimer();
        try {
          await db.doc(`households/${householdId}/lists/${activeListId}/items/${payload.id}`).set({
            ...payload,
            // mark as last edited by the person who undid the delete
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: (currentUser && currentUser.uid) ? currentUser.uid : '',
            updatedByName: (currentUser && currentUser.displayName) ? currentUser.displayName : '',
            updatedByPhotoURL: (currentUser && currentUser.photoURL) ? currentUser.photoURL : '',
          }, { merge: true });
        } catch (e) {
          console.error("Undo delete failed:", e);
        }
      }

      const suggestions = useMemo(() => {
        const q = newText.trim().toLowerCase();
        if (q.length < 2) return [];
        return sortByRelevance((products || [])
          .filter(p => (p.name||'').toLowerCase().includes(q)), q)
          .slice(0, 30);
      }, [products, newText]);

      useEffect(() => {
        const q = newText.trim().toLowerCase();
        if (!q) return;
        const p = (products || []).find(x => (x.name||'').toLowerCase() === q);
        if (p) setNewCategory(p.category || 'Overig');
      }, [newText, products]);

      async function addItemDoc(doc) {
        if (!householdId || !activeListId) return;
        await db.doc(`households/${householdId}/lists/${activeListId}/items/${doc.id}`).set(doc);
      }



      function currentQty(it) {
        const q = (it && it.qty != null) ? Number(it.qty) : NaN;
        if (!isNaN(q)) return clamp(q, 0, 99);
        // Backward compat: if unit is discrete and amount is an int, use that
        const unit = String(it?.unit || 'st').toLowerCase();
        const amt = parseFloat(String(it?.amount ?? '1').replace(',','.'));
        if (!isNaN(amt) && DISCRETE_UNITS.includes(unit)) return clamp(Math.round(amt), 0, 99);
        return 1;
      }

      function findExistingByProductId(productId) {
        if (!productId) return null;
        const arr = (items || []);
        // Prefer unchecked item, else any
        return arr.find(x => x.productId === productId && !x.checked) || arr.find(x => x.productId === productId) || null;
      }

      async function upsertListItemFromProduct(productDoc, qtyInc = 1) {
        if (!householdId || !activeListId) { alert('Maak eerst een lijst aan.'); return; }
        const inc = clamp(Number(qtyInc)||1, 0, 99);
        const id = itemIdForProduct(productDoc.id);
        const ref = db.doc(`households/${householdId}/lists/${activeListId}/items/${id}`);

        // Atomic merge: increment qty for same product
        await ref.set({
          id,
          productId: productDoc.id,
          nameSnapshot: productDoc.name || '',
          categorySnapshot: productDoc.category || 'Overig',
          qty: firebase.firestore.FieldValue.increment(inc),
          checked: false,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: (currentUser && currentUser.uid) ? currentUser.uid : '',
          updatedByName: (currentUser && currentUser.displayName) ? currentUser.displayName : '',
          updatedByPhotoURL: (currentUser && currentUser.photoURL) ? currentUser.photoURL : '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: (currentUser && currentUser.uid) ? currentUser.uid : '',
          createdByName: (currentUser && currentUser.displayName) ? currentUser.displayName : '',
          createdByPhotoURL: (currentUser && currentUser.photoURL) ? currentUser.photoURL : '',
          source: 'product',
        }, { merge: true });

        // Clamp to 0..99 (increment can exceed if user spams)
        const snap = await ref.get();
        const q = Number(snap.data()?.qty);
        if (!isNaN(q) && (q < 0 || q > 99)) {
          await ref.set({ qty: clamp(q, 0, 99) }, { merge: true });
        }
      }

async function addItemFromProduct(p) {
        await upsertListItemFromProduct(p, 1);
      }

      async function addFreeText() {
        const text = newText.trim();
        if (!text) return;

        // If the text matches an existing product (exact), just add it
        const existing = (products || []).find(x => (x.name||'').toLowerCase() === text.toLowerCase());
        if (existing) {
          await addItemFromProduct(existing);
        } else {
          // Create a new product so it shows up in the product list, then add it
          if (!householdId) { alert('Geen huishouden gevonden.'); return; }

          const productId = genId('p');
          const category = newCategory || 'Overig';
          const productDoc = {
            id: productId,
            schemaVersion: 2,
            name: text,
            category,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser?.uid || '',
            updatedByName: currentUser?.displayName || '',
            updatedByPhotoURL: currentUser?.photoURL || '',
          };

          await db.doc(`households/${householdId}/products/${productId}`).set(productDoc);
          await addItemFromProduct(productDoc);
        }

        setNewText('');
        setShowSuggestions(false);
        setStickyAdd(false);
      }

      async function toggle(item) {
        if (!householdId || !activeListId) return;
        const nowChecked = !item.checked;
        await db.doc(`households/${householdId}/lists/${activeListId}/items/${item.id}`).set({
          checked: nowChecked,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: (currentUser && currentUser.uid) ? currentUser.uid : '',
          updatedByName: (currentUser && currentUser.displayName) ? currentUser.displayName : '',
          updatedByPhotoURL: (currentUser && currentUser.photoURL) ? currentUser.photoURL : '',
        }, { merge: true });
        // Check if all items are now checked
        if (nowChecked && items && items.length > 0) {
          const allDone = items.every(it => it.id === item.id ? true : it.checked);
          if (allDone) setShowAllDone(true);
        }
      }

      function toggleInStoreMode(item) {
        if (!item || pendingCheckIds.has(item.id)) return;
        if (item.checked) {
          toggle(item);
          return;
        }

        setFlashId(item.id);
        setPendingCheckIds(prev => {
          const next = new Set(prev);
          next.add(item.id);
          return next;
        });
        setTimeout(async () => {
          setFlashId(current => current === item.id ? null : current);
          await toggle(item);
          setPendingCheckIds(prev => {
            const next = new Set(prev);
            next.delete(item.id);
            return next;
          });
        }, 950);
      }

      async function remove(item) {
        if (!householdId || !activeListId) return;

        // Prepare payload for undo (strip computed fields)
        const payload = { ...item };
        delete payload._name; delete payload._cat; delete payload._qty;

        const label = (payload.nameSnapshot || '').trim() || 'Item';

        try {
          await db.doc(`households/${householdId}/lists/${activeListId}/items/${item.id}`).delete();
          // show undo
          setUndoState({ payload, label: `${label} verwijderd` });
          scheduleUndoClear();
        } catch (e) {
          console.error("Delete failed:", e);
        }
      }


      async function setQty(item, nextQty) {
        if (!householdId || !activeListId) return;
        const q = clamp(Number(nextQty)||0, 0, 99);
        await db.doc(`households/${householdId}/lists/${activeListId}/items/${item.id}`).set({
          qty: q,
          checked: storeMode ? (q===0) : false,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: (currentUser && currentUser.uid) ? currentUser.uid : '',
          updatedByName: (currentUser && currentUser.displayName) ? currentUser.displayName : '',
          updatedByPhotoURL: (currentUser && currentUser.photoURL) ? currentUser.photoURL : '',
        }, { merge: true });
      }

      async function incQty(item, delta) {
        const cur = currentQty(item);
        const next = clamp(cur + (Number(delta)||0), 0, 99);
        await setQty(item, next);
      }

      function openQtyEditor(itemId) {
        if (!itemId) return;
        setOpenQtyId(itemId);
      }

      async function adjustListQty(item, delta) {
        openQtyEditor(item.id);
        await incQty(item, delta);
      }

            // --- Swipe (alleen in de winkel / lijst) ---
      function SwipeRow({ item, children, onSwipeRight, onSwipeLeft, revealRightColor }) {
        const rowRef = useRef(null);
        const startRef = useRef({ x: 0, y: 0, active: false, locked: false, horiz: false });
        const dxRef = useRef(0);
        const rafRef = useRef(null);

        function isFromControl(target) {
          try {
            return !!target.closest('button, input, select, textarea, a, label');
          } catch (e) {
            return false;
          }
        }

        function applyDx(dx, withTransition) {
          const el = rowRef.current;
          if (!el) return;
          el.style.transition = withTransition ? 'transform 150ms ease' : 'none';
          el.style.transform = `translateX(${dx}px)`;
        }

        function scheduleApply() {
          if (rafRef.current) return;
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            applyDx(dxRef.current, false);
          });
        }

        function onTouchStart(e) {
          if (isFromControl(e.target)) return;
          const t = e.touches && e.touches[0];
          if (!t) return;
          startRef.current = { x: t.clientX, y: t.clientY, active: true, locked: false, horiz: false };
          dxRef.current = 0;
          applyDx(0, false);
        }

        function onTouchMove(e) {
          const st = startRef.current;
          if (!st.active) return;
          const t = e.touches && e.touches[0];
          if (!t) return;

          const ndx = t.clientX - st.x;
          const ndy = t.clientY - st.y;

          // lock direction after a small threshold
          if (!st.locked) {
            const ax = Math.abs(ndx);
            const ay = Math.abs(ndy);
            if (ax < 8 && ay < 8) return;
            st.locked = true;
            st.horiz = ax > ay * 1.2;
            startRef.current = st;
          }

          if (!st.horiz) return;

          // prevent scroll while swiping horizontally
          if (e.cancelable) e.preventDefault();

          // clamp swipe distance
          const clamped = Math.max(-120, Math.min(120, ndx));
          dxRef.current = clamped;
          scheduleApply();
        }

        function onTouchEnd() {
          const st = startRef.current;
          if (!st.active) return;
          st.active = false;
          startRef.current = st;

          const dx = dxRef.current;
          const TH = 60;

          // snap back
          applyDx(0, true);
          setTimeout(() => applyDx(0, false), 170);

          if (dx > TH && onSwipeRight) onSwipeRight(item);
          if (dx < -TH && onSwipeLeft) onSwipeLeft(item);
        }

        return (
          <div className="relative overflow-hidden">
            {revealRightColor && (
              <div
                className="absolute inset-y-0 left-0 w-28 flex items-center"
                style={{ backgroundColor: revealRightColor }}
                aria-hidden="true"
              >
                <div className="w-full px-5">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                    <TrashIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
            <div
              ref={rowRef}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className={"relative touch-pan-y " + (revealRightColor ? "bg-white" : "")}
            >
              {children}
            </div>
          </div>
        );
      }



      const byCategory = useMemo(() => {
        const productById = new Map((products || []).map(p => [p.id, p]));
        const map = {};
        (items || []).forEach(it => {
          const p = it.productId ? productById.get(it.productId) : null;
          const name = (p?.name) || it.nameSnapshot || '';
          const cat = (p?.category) || it.categorySnapshot || 'Overig';
          const key = cat || 'Overig';
          if (!map[key]) map[key] = [];
          map[key].push({ ...it, _name: name, _cat: cat, _qty: currentQty(it), _needsLine: formatNeedsLine(it.needsByRecipe) });
        });
        const cats = Object.keys(map).sort((a,b) => CATEGORY_OPTIONS.indexOf(a) - CATEGORY_OPTIONS.indexOf(b));
        const groups = cats.map(c => ({ category: c, items: map[c].sort((a,b)=> (a._name||'').localeCompare(b._name||'', 'nl')) }));
        if (storeMode) {
          const checkedGroups = [];
          const uncheckedGroups = groups.map(g => {
            const checkedItems = [];
            const uncheckedItems = g.items.filter(it => {
              if (it.checked) { checkedItems.push(it); return false; }
              return true;
            });
            if (checkedItems.length > 0) {
              checkedGroups.push({
                category: g.category,
                checkedGroup: true,
                items: checkedItems.sort((a,b) => (a._name||'').localeCompare(b._name||'', 'nl'))
              });
            }
            return {
              ...g,
              items: uncheckedItems
            };
          }).filter(g => g.items.length > 0);
          return [...uncheckedGroups, ...checkedGroups];
        }
        return groups;
      }, [items, products, storeMode]);

      return (
        <div className="pb-24" onClick={() => { if (!storeMode && openQtyId) setOpenQtyId(null); }}>
          {!storeMode && (
          <div className={"mb-3 relative " + (stickyAdd ? "fixed top-0 left-0 right-0 z-40 bg-slate-50 pt-2 pb-2 shadow-sm" : "")}>
            <div className="max-w-xl mx-auto px-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:flex-1">
                <input
                  ref={addInputRef}
                  type="text"
                  inputMode="search"
                  value={newText}
                  onChange={(e)=>{ setNewText(e.target.value); setShowSuggestions(true); }}
                  onFocus={()=>{ setStickyAdd(true); scrollAddBoxIntoView(true); if (newText.trim().length>=2) setShowSuggestions(true); }}
                  onBlur={()=> { setTimeout(()=>{ setShowSuggestions(false); if (!newText.trim()) setStickyAdd(false); }, 150); }}
                  onKeyDown={(e)=>{ if (e.key === 'Enter') { e.preventDefault(); addFreeText(); }
                    if (e.key === 'Escape') { e.preventDefault(); setNewText(''); setShowSuggestions(false); setStickyAdd(false); } }}
                  placeholder="Zoek product of typ iets nieuws…"
                  className="w-full pr-10 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
                {newText && newText.length > 0 && (
                  <button
                    type="button"
                    onMouseDown={(e)=>e.preventDefault()}
                    onClick={() => { setNewText(''); setShowSuggestions(false); setTimeout(()=>addInputRef.current?.focus(), 0); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl leading-none hover:text-slate-600"
                    title="Leegmaken"
                    aria-label="Leegmaken"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={newCategory || 'Overig'}
                onChange={(e)=>setNewCategory(e.target.value)}
                className="w-full sm:w-56 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                title="Categorie (voor nieuwe producten)"
              >
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {newText.trim() && (
                <>
                  <Button onClick={addFreeText} className="bg-emerald-600 text-white w-full sm:w-12 px-0" title="Toevoegen">✓</Button>
                  <Button onClick={()=>{ setNewText(''); setShowSuggestions(false); setStickyAdd(false); }} className="bg-rose-500 text-white w-full sm:w-12 px-0" title="Annuleren">✕</Button>
                </>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-y-auto overscroll-contain"
                style={{ maxHeight: "240px", WebkitOverflowScrolling: "touch" }}
              >
                {suggestions.map(s => (
                  <button key={s.id} onMouseDown={(e)=>e.preventDefault()}
                    onClick={()=>{ addItemFromProduct(s); setNewText(''); setShowSuggestions(false); setStickyAdd(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-b-0">
                    <span className="flex-1 truncate">{s.name}</span>
                    <span className="text-[11px] text-slate-400 shrink-0">{(s.category||'Overig').split(',')[0]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          </div>
          )}

          {(!storeMode && stickyAdd) && <div style={{ height: 136 }} />}


          {storeMode && (
            <div className="flex items-center mb-3 px-1">
              <button
                onClick={()=>setShowAdders(v=>!v)}
                className={"inline-flex items-center gap-2 text-xs font-semibold rounded-full pl-2.5 pr-3 py-1.5 border transition-colors " + (showAdders ? "bg-[#17372d] text-[#eaf5ef] border-transparent" : "bg-[#e7ece4] text-[#536158] border-[#d3dbcf]")}
                title={showAdders ? "Verberg wie toevoegde" : "Toon wie toevoegde"}
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
                  {!showAdders && <path d="M4.5 4.5 L19.5 19.5" />}
                </svg>
                wie voegde toe
              </button>
            </div>
          )}
          <div className={storeMode ? "" : "relative left-1/2 w-screen -translate-x-1/2"}>
            <div className={storeMode ? "" : "space-y-3"}>
              {byCategory.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <div className="text-4xl mb-1">🛒</div>
                  <div className="text-sm">Je lijst is leeg</div>
                </div>
              ) : byCategory.map((group, gi) => (
                <div key={`${group.category}-${group.checkedGroup ? 'checked' : 'open'}`}
                  className={storeMode ? "mb-3" : ""}>
                  {storeMode ? (
                    <div className="mb-0">
                      <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-tr-lg"
                            style={{
                              backgroundColor: group.checkedGroup ? '#eef1ee' : categoryColor(group.category) + '29',
                              color: group.checkedGroup ? '#647067' : '#33423d'
                            }}>{group.category}</span>
                    </div>
                  ) : (
                    <div className="max-w-xl mx-auto px-3 mb-0">
                      <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-tr-lg"
                            style={{ backgroundColor: categoryColor(group.category) + '29', color: '#33423d' }}>
                        {group.category}
                      </span>
                    </div>
                  )}
                  <div className={storeMode ? (group.checkedGroup ? "divide-y-2 divide-slate-200/80 border-y-2 border-slate-200/80" : "divide-y-2 divide-slate-200/80 border-y-2 border-l-[4px] border-slate-200/80") : "bg-white border-y-2 border-l-[4px] border-slate-200/80"}
                       style={storeMode && !group.checkedGroup ? { borderLeftColor: categoryColor(group.category) + '88', paddingLeft: '7px' } : (!storeMode ? { borderLeftColor: categoryColor(group.category) + '88' } : undefined)}>
                    {group.items.map(it => (
                      <SwipeRow
                        key={it.id}
                        item={it}
                        onSwipeRight={storeMode ? ((x)=>toggleInStoreMode(x)) : ((x)=>remove(x))}
                        onSwipeLeft={storeMode ? ((x)=>toggleInStoreMode(x)) : ((x)=>openQtyEditor(x.id))}
                        revealRightColor={!storeMode ? categoryColor(it._cat) + 'cc' : undefined}
                      >

                      <div
                        className={"relative flex items-center " + (storeMode ? "px-3 py-3.5" : "max-w-xl mx-auto px-3 py-3 border-b-2 border-slate-200/80 last:border-b-0") + (storeMode && flashId === it.id ? " bm-flash" : "")}
                        style={storeMode && flashId === it.id ? { '--flash': categoryColor(it._cat) + '40' } : undefined}
                        onClick={() => { if (storeMode) { toggleInStoreMode(it); } }}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className={(storeMode ? "text-[15px]" : "text-[15px] font-normal") + " " + (it.checked ? "line-through text-slate-400" : (storeMode ? "text-[#18211f]" : "text-slate-800"))}>
                            {it._name}
                          </div>
                          {it._needsLine ? (
                            <div className={"truncate " + (storeMode ? "text-xs text-[#69766f]" : "text-[11px] text-slate-400")}>
                              {it._needsLine}
                            </div>
                          ) : null}
                        </div>
                        {storeMode && it._qty > 1 && (
                          <div className="mr-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-slate-200/60 text-[#536158] text-xs font-semibold flex items-center justify-center tabular-nums">{it._qty}</div>
                        )}
                        {storeMode && showAdders && (
                          <div className="pointer-events-none">
                            <SmallAvatar
                              url={it.updatedByPhotoURL || it.createdByPhotoURL || ''}
                              name={(it.updatedByName || it.createdByName || '').trim()}
                              size={20}
                            />
                          </div>
                        )}
                        {!storeMode && (
                        <div className="flex items-center gap-1 ml-2">
                          <ListQuantityControl
                            itemId={it.id}
                            qty={it._qty}
                            open={openQtyId === it.id}
                            onOpen={openQtyEditor}
                            onDec={(e)=>{ e?.stopPropagation?.(); adjustListQty(it, -1); }}
                            onInc={(e)=>{ e?.stopPropagation?.(); adjustListQty(it, +1); }}
                          />
                        </div>
                        )}
                      </div>

                    </SwipeRow>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {undoState && (
            <div className="fixed left-0 right-0 bottom-0 pb-6 px-4 z-50">
              <div className="max-w-xl mx-auto">
                <div className="bg-slate-900 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 text-sm truncate">{undoState.label}</div>
                  <button
                    onClick={undoDelete}
                    className="text-sm font-bold underline decoration-2 underline-offset-4"
                  >
                    Ongedaan maken
                  </button>
                  <button
                    onClick={() => { setUndoState(null); clearUndoTimer(); }}
                    className="text-sm opacity-70 hover:opacity-100"
                    title="Sluiten"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAllDone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setShowAllDone(false)}>
              <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm text-center" onClick={e=>e.stopPropagation()}>
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-xl font-bold text-slate-800 mb-2">Alles gedaan!</div>
                <div className="text-sm text-slate-500 mb-6">Alle boodschappen zijn afgevinkt.</div>
                <div className="flex gap-2">
                  <button
                    onClick={()=>setShowAllDone(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
                  >Sluiten</button>
                  <button
                    onClick={async ()=>{
                      setShowAllDone(false);
                      const snap = await db.collection(`households/${householdId}/lists/${activeListId}/items`).get();
                      if (!snap.empty) {
                        const batch = db.batch();
                        snap.docs.forEach(d => batch.delete(d.ref));
                        await batch.commit();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold"
                  >Lijst wissen</button>
                </div>
              </div>
            </div>
          )}

        </div>
      );
    }

    // ---------------- Recipes tab ----------------
    function RecipesTab({ householdId, recipes, products, items, activeListId, currentUser }) {
      const [query, setQuery] = useState('');
      const [openId, setOpenId] = useState(null); // recipe id in modal
      const [draft, setDraft] = useState(null);   // editable recipe
      const [quickServings, setQuickServings] = useState(5);
      const [expandedId, setExpandedId] = useState(null);
      const [pickMap, setPickMap] = useState({});
      const [newIngId, setNewIngId] = useState(null);

      const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let rs = recipes || [];
        if (q) rs = rs.filter(r => (r.name||'').toLowerCase().includes(q));
        rs = [...rs].sort((a,b) => (a.name||'').localeCompare(b.name||'', 'nl'));
        return rs;
      }, [recipes, query]);

      function newRecipe() {
        const id = genId('r');
        const baseServings = 5;
        const rec = {
          id,
          name: '',
          baseServings,
          url: '',
          ingredients: [{
            _id: genId('ing'),
            productId: null,
            nameSnapshot: '',
            categorySnapshot: 'Overig',
            amount: '',
            unit: 'st',
            buyQty: 1,
          }],
          preparationHtml: '',
          createdAt: null,
          createdBy: currentUser?.uid || '',
          updatedAt: null,
          updatedBy: currentUser?.uid || '',
            updatedByName: currentUser?.displayName || '',
            updatedByPhotoURL: currentUser?.photoURL || '',
        };
        setOpenId(id);
        setDraft(rec);
      }

      function editRecipe(r) {
        setOpenId(r.id);
        setDraft(JSON.parse(JSON.stringify(r)));
      }

      async function saveRecipe() {
        if (!householdId || !draft) return;
        const id = draft.id || genId('r');
        const baseServings = clamp(parseInt(draft.baseServings || 5, 10) || 4, 1, 99);
        const payload = {
          ...draft,
          id,
          name: (draft.name || '').trim() || 'Recept',
          baseServings,
          url: (draft.url || '').trim(),
          ingredients: Array.isArray(draft.ingredients) ? draft.ingredients : [],
          preparationHtml: draft.preparationHtml || '',
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: currentUser?.uid || '',
            updatedByName: currentUser?.displayName || '',
            updatedByPhotoURL: currentUser?.photoURL || '',
        };
        // if new, set createdAt
        const ref = db.doc(`households/${householdId}/recipes/${id}`);
        const snap = await ref.get();
        if (!snap.exists) {
          payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          payload.createdBy = currentUser?.uid || '';
        }
        await ref.set(payload, { merge: true });
        setOpenId(null);
        setDraft(null);
      }

      async function deleteRecipe(r) {
        if (!householdId) return;
        if (!confirm(`Recept verwijderen: "${r.name}"?`)) return;
        await db.doc(`households/${householdId}/recipes/${r.id}`).delete();
        if (openId === r.id) {
          setOpenId(null);
          setDraft(null);
        }
        if (expandedId === r.id) setExpandedId(null);
      }

      function addIngredientRow() {
        const id = genId('ing');
        setDraft(d => ({
          ...d,
          ingredients: [...(d.ingredients||[]), {
            _id: id,
            productId: null,
            nameSnapshot: '',
            categorySnapshot: 'Overig',
            amount: '',
            unit: 'st',
            buyQty: 1,
          }]
        }));
        setNewIngId(id);
      }

      function updateIng(idx, patch) {
        setDraft(d => {
          const arr = [...(d.ingredients||[])];
          arr[idx] = { ...arr[idx], ...patch };
          return { ...d, ingredients: arr };
        });
      }

      function removeIng(idx) {
        setDraft(d => {
          const arr = [...(d.ingredients||[])];
          arr.splice(idx, 1);
          return { ...d, ingredients: arr };
        });
      }

      function findProductById(pid) {
        return (products||[]).find(p => p.id === pid) || null;
      }

      function resolveIngDisplay(ing) {
        const p = ing.productId ? findProductById(ing.productId) : null;
        const name = (p?.name) || ing.nameSnapshot || '';
        const cat = (p?.category) || ing.categorySnapshot || 'Overig';
        return { name, cat };
      }

      const DISCRETE_UNITS = ['st','stuk','bl','blik','zak','pak','pot','fles','tube','bol','krop','teen','tenen','knol','bus'];

      function scaleAmountText(amountText, unitText, base, target) {
        const a = String(amountText || '').trim();
        if (!a) return '';
        const num = parseFloat(a.replace(',', '.'));
        if (!isFinite(num)) return amountText; // keep free text
        const factor = (target || base) / (base || 1);
        let out = num * factor;
        const unit = String(unitText || '').trim().toLowerCase();
        const isDiscrete = DISCRETE_UNITS.includes(unit);
        if (isDiscrete) {
          out = Math.ceil(out - 1e-9);
        } else {
          // Keep nice rounding
          out = Math.round(out * 100) / 100;
        }
        // Format: avoid trailing .0
        const asInt = Math.round(out);
        const pretty = (Math.abs(out - asInt) < 1e-9) ? String(asInt) : String(out);
        return pretty.replace('.', ',');
      }

      function scaledAmount(ing, base, target) {
        const amount = (ing.amount ?? ing.qty ?? ing.quantity ?? ing.amountText ?? '');
        const unit = (ing.unit ?? ing.unitText ?? '');
        return scaleAmountText(amount, unit, base, target);
      }

      
      function applyMultToAmountText(amountText, mult) {
        const m = Number(mult || 1);
        if (!amountText) return '';
        if (!m || m === 1) return String(amountText);
        // Try multiplying first number in the string
        const s = String(amountText);
        const match = s.match(/(-?\d+(?:[\.,]\d+)?)/);
        if (match) {
          const raw = match[1].replace(',', '.');
          const num = parseFloat(raw);
          if (!isNaN(num)) {
            const scaled = num * m;
            return s.replace(match[1], formatNum(scaled));
          }
        }
        return s + ` ×${m}`;
      }

async function addRecipeToList(r, targetServings, pickState) {
        if (!householdId || !activeListId) { alert('Geen actieve lijst gevonden.'); return; }
        // Ingrediënten in recepten zijn al ingevoerd voor de opgegeven basisporties; we schalen hier (nog) niet.
        const base = r.baseServings || r.servings || r.persons || 5;
        const target = base;

        const productById = new Map((products||[]).map(p => [p.id, p]));
        const productByName = new Map((products||[]).map(p => [(p.name||'').toLowerCase(), p]));
        const createdProductsByName = new Map();

        // Existing list items by productId (prefer unchecked)
        const existingByProductId = new Map();
        (items || []).forEach(it => {
          if (!it.productId) return;
          const cur = existingByProductId.get(it.productId);
          if (!cur) { existingByProductId.set(it.productId, it); return; }
          if (cur.checked && !it.checked) existingByProductId.set(it.productId, it);
        });

        const itemQty = (it) => {
          const q = (it && it.qty != null) ? Number(it.qty) : NaN;
          if (!isNaN(q)) return clamp(q, 0, 99);
          const unit = String(it?.unit || 'st').toLowerCase();
          const amt = parseFloat(String(it?.amount ?? '1').replace(',','.'));
          if (!isNaN(amt) && DISCRETE_UNITS.includes(unit)) return clamp(Math.round(amt), 0, 99);
          return 1;
        };

        const batch = db.batch();
        const ings = (r.ingredients || []);

        ings.forEach((ing, idx) => {
          const key = ing._id || String(idx);
          const include = pickState?.picks ? (pickState.picks[key] !== false) : true;
          if (!include) return;
          const mult = 1;
          const p = ing.productId ? productById.get(ing.productId) : null;
          const name = (p?.name) || ing.nameSnapshot || '';
          if (!name) return;
          const cat = (p?.category) || ing.categorySnapshot || 'Overig';

          // Ensure this ingredient exists as a product so it appears in the product list
          let ensuredProductId = (p?.id) || ing.productId || null;
          let ensuredProduct = p;
          if (!ensuredProductId) {
            const keyName = String(name).toLowerCase();
            const already = productByName.get(keyName) || createdProductsByName.get(keyName);
            if (already) {
              ensuredProductId = already.id;
              ensuredProduct = already;
            } else {
              ensuredProductId = genId('p');
              ensuredProduct = {
                id: ensuredProductId,
                schemaVersion: 2,
                name,
                category: cat,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: currentUser?.uid || '',
            updatedByName: currentUser?.displayName || '',
            updatedByPhotoURL: currentUser?.photoURL || '',
              };
              batch.set(db.doc(`households/${householdId}/products/${ensuredProductId}`), ensuredProduct, { merge: true });
              createdProductsByName.set(keyName, ensuredProduct);
            }
          }

          // Calculate amount (string) and determine how much to increment the counter
          let unit = (ing.unit ?? ing.unitText ?? 'st');
          if (String(unit).toLowerCase()==='g') unit = 'gr';

          // Quantity overrides from the picker (defaults to recipe quantity)
          const overrideQty = (pickState?.qtys && pickState.qtys[key] != null) ? Number(pickState.qtys[key]) : null;

          let amountStr = (ing.amount ?? ing.qty ?? ing.quantity ?? '');
          let qtyInc = 1;

          if (overrideQty != null && isFinite(overrideQty)) {
            // Treat as discrete counter (product-based ingredient)
            qtyInc = clamp(Math.round(overrideQty), 0, 99);
            amountStr = String(qtyInc);
          } else {
            // Fallback: parse from stored amount
            const num = parseFloat(String(amountStr).replace(',','.'));
            if (isFinite(num)) {
              if (DISCRETE_UNITS.includes(String(unit||'').toLowerCase())) {
                qtyInc = clamp(Math.ceil(num), 0, 99);
              }
              amountStr = formatNum(num);
            } else {
              amountStr = String(amountStr || '');
            }
          }
          const buyInc = (overrideQty != null && isFinite(overrideQty))
            ? clamp(Math.round(overrideQty), 0, 99)
            : clamp(parseInt(String(ing.buyQty ?? 1), 10) || 1, 1, 99);

          const id = itemIdForProduct(ensuredProductId);
          const ref = db.doc(`households/${householdId}/lists/${activeListId}/items/${id}`);

          // Build "need" for this recipe from original recipe amount
          const origAmount = String(ing.amount ?? ing.qty ?? ing.quantity ?? '').trim();
          const needNum = parseFloat(origAmount.replace(',','.'));
          const needObj = isFinite(needNum)
            ? { value: needNum, unit: String(unit || 'st') }
            : { valueText: origAmount, unit: String(unit || 'st') };

          // bestaat het item al op de lijst?
          const existing = existingByProductId.get(ensuredProductId);

          if (existing) {
            // Item bestaat al → needs bijwerken via update (dot-notation werkt bij update)
            batch.update(ref, {
              [`needsByRecipe.${r.id}`]: needObj,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedBy: currentUser?.uid || '',
              updatedByName: currentUser?.displayName || '',
              updatedByPhotoURL: currentUser?.photoURL || '',
            });

          } else {
            // Item bestaat nog niet → nieuw item aanmaken
            batch.set(ref, {
              id,
              productId: ensuredProductId,
              nameSnapshot: name,
              categorySnapshot: (ensuredProduct?.category) || cat,

              qty: buyInc,
              checked: false,

              needsByRecipe: { [r.id]: needObj },

              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              createdBy: currentUser?.uid || '',
              createdByName: currentUser?.displayName || '',
              createdByPhotoURL: currentUser?.photoURL || '',

              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedBy: currentUser?.uid || '',
              updatedByName: currentUser?.displayName || '',
              updatedByPhotoURL: currentUser?.photoURL || '',

              source: `recipe:${r.id}`,
            }, { merge: true });
          }

          existingByProductId.set(ensuredProductId, { id, productId: ensuredProductId });
        });

        await batch.commit();
        alert('Toegevoegd aan je lijst.');
      }
      const productSuggestions = (text) => {
        const q = (text||'').trim().toLowerCase();
        if (q.length < 2) return [];
        return sortByRelevance((products||[]).filter(p => (p.name||'').toLowerCase().includes(q)), q)
          .slice(0, 8);
      };

      
      function parseDefaultQty(ing) {
        return clamp(parseInt(String(ing?.buyQty ?? 1), 10) || 1, 1, 99);
      }

function ensurePickState(recipe) {
        setPickMap(prev => {
          if (prev[recipe.id]) return prev;
          const picks = {};
          const qtys = {};
          (recipe.ingredients || []).forEach((ing, i) => {
            const key = ing._id || String(i);
            const def = parseDefaultQty(ing);
            qtys[key] = def;
            picks[key] = def > 0;
          });
          return { ...prev, [recipe.id]: { picks, qtys } };
        });
      }


      function setQty(recipeId, key, nextQty, defaultQty) {
        const q = clamp(parseInt(nextQty || 0, 10) || 0, 0, 99);
        setPickMap(prev => {
          const st = prev[recipeId];
          if (!st) return prev;
          const curPicks = st.picks || {};
          const curQtys = st.qtys || {};
          const shouldPick = q > 0;
          return {
            ...prev,
            [recipeId]: {
              ...st,
              picks: { ...curPicks, [key]: shouldPick },
              qtys: { ...curQtys, [key]: q },
            }
          };
        });
      }

      function togglePick(recipeId, key, defaultQty) {
        const def = clamp(parseInt(defaultQty || 1, 10) || 1, 0, 99);
        setPickMap(prev => {
          const st = prev[recipeId];
          if (!st) return prev;
          const curOn = st.picks?.[key] !== false;
          const nextOn = !curOn;
          const curQty = (st.qtys && st.qtys[key] != null) ? Number(st.qtys[key]) : def;
          const nextQty = nextOn ? (curQty > 0 ? curQty : def) : 0;
          return {
            ...prev,
            [recipeId]: {
              ...st,
              picks: { ...(st.picks||{}), [key]: nextOn },
              qtys: { ...(st.qtys||{}), [key]: clamp(parseInt(nextQty||0,10)||0,0,99) },
            }
          };
        });
      }


      
      
      return (
        <div className="pb-24">
          <div className="mb-3 flex gap-2">
            <input value={query} onChange={(e)=>setQuery(e.target.value)}
              placeholder="Zoek recept…"
              className="w-full sm:flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
            <Button onClick={newRecipe} className="bg-emerald-600 text-white px-3">+ Recept</Button>
          </div>

          <div className="relative left-1/2 w-screen -translate-x-1/2">
            <div className="bg-white border-y-2 border-slate-200/80">
              {filtered.length === 0 ? (
                <div className="max-w-xl mx-auto p-6 text-center text-slate-400">
                  <div className="text-4xl mb-1">🍲</div>
                  <div className="text-sm">Nog geen recepten</div>
                </div>
              ) : filtered.map(r => {
                const isOpen = expandedId === r.id;
                const st = pickMap[r.id];
                return (
                  <div key={r.id} className="border-b-2 border-slate-200/80 last:border-b-0">
                    <div className="max-w-xl mx-auto px-3 py-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!isOpen) ensurePickState(r);
                          setExpandedId(isOpen ? null : r.id);
                        }}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="font-medium text-[15px] text-slate-800 truncate">{r.name || 'Recept'}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {(r.ingredients||[]).length} ingrediënten · basis {r.baseServings || 5} pers.
                        </div>
                      </button>

                      <button onClick={() => { if (!isOpen) ensurePickState(r); setExpandedId(isOpen ? null : r.id); }} title="Openen/sluiten" className="w-9 h-9 rounded-full bg-transparent text-slate-700 text-sm">{isOpen ? "▴" : "▾"}</button>

                      <button onClick={()=>editRecipe(r)} title="Bewerken" className="w-9 h-9 rounded-full bg-transparent text-slate-600 flex items-center justify-center">
                        <EditIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {isOpen && st && (
                      <div className="max-w-xl mx-auto px-3 pb-4">
                        {r.url && r.url.trim() ? (
                          <a
                            href={/^https?:\/\//i.test(r.url.trim()) ? r.url.trim() : `https://${r.url.trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm font-semibold text-emerald-700 underline mb-2"
                          >Bekijk hier het recept.</a>
                        ) : (
                          <div className="text-xs text-slate-400 mb-2">Nog geen online recept gekoppeld.</div>
                        )}

                        <div className="space-y-1">
                          {(r.ingredients||[]).map((ing, idx) => {
                            const key = ing._id || String(idx);
                            const disp = resolveIngDisplay(ing);
                            const defaultQty = parseDefaultQty(ing);
                            const checked = st.picks?.[key] !== false;
                                                        return (
                              <div key={key} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-b-0">
                                <button onClick={()=>togglePick(r.id, key)} className={
                                  "w-6 h-6 rounded-lg border flex items-center justify-center text-xs " +
                                  (checked ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-300 text-slate-400")
                                }>
                                  {checked ? "✓" : ""}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className={"text-sm font-normal truncate " + (checked ? "text-slate-800" : "text-slate-400 line-through")}>
                                    {disp.name || "(onbekend)"}
                                  </div>
                                  {ing.amount && (
                                    <div className="text-[11px] text-slate-400 truncate">nodig: {ing.amount} {ing.unit || 'st'}</div>
                                  )}
                                </div>

                                <QuantityControl
                                  qty={Number(st.qtys?.[key] ?? defaultQty) || 0}
                                  onDec={() => setQty(r.id, key, (Number(st.qtys?.[key] ?? defaultQty) || 0) - 1, defaultQty)}
                                  onInc={() => setQty(r.id, key, (Number(st.qtys?.[key] ?? defaultQty) || 0) + 1, defaultQty)}
                                />
                              </div>
                            );
                          })}

                          <Button
                            onClick={() => addRecipeToList(r, null, st)}
                            className="w-full bg-slate-900 text-white"
                          >
                            Voeg geselecteerde ingrediënten toe
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {openId && draft && (
            <Modal title="Recept" onClose={()=>{ setOpenId(null); setDraft(null); }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">Naam</div>
                    <input value={draft.name || ''} onChange={(e)=>setDraft(d=>({ ...d, name: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">Dit recept is voor</div>
                    <input type="number" min="1" max="99" value={draft.baseServings || 5}
                      onChange={(e)=>{ const v = parseInt(e.target.value||'5',10)||4; setDraft(d=>({ ...d, baseServings: v }));
}}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white" />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-1">Recept-URL (online)</div>
                    <input type="url" inputMode="url" value={draft.url || ''}
                      onChange={(e)=>setDraft(d=>({ ...d, url: e.target.value }))}
                      placeholder="bijv. https://ah.nl/allerhande/recept/..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white" />
                  </div>



                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-bold text-slate-800">Ingrediënten</div>
                      
                    </div>

                    <div className="space-y-2">
                      {(draft.ingredients||[]).length === 0 ? (
                        <div className="text-sm text-slate-400">Nog geen ingrediënten.</div>
                      ) : (draft.ingredients||[]).map((ing, idx) => {
                        const disp = resolveIngDisplay(ing);
                        const sugg = productSuggestions(ing.nameSnapshot || disp.name);
                        return (
                          <div key={ing._id || idx} className="p-3 bg-white border border-slate-200 rounded-2xl">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex-1 relative">
                                <div className="text-[11px] font-semibold text-slate-500 mb-1">Product</div>
                                <input
                                  ref={el => { if (el && ing._id === newIngId) { el.focus(); setNewIngId(null); } }}
                                  value={disp.name}
                                  onChange={(e)=>updateIng(idx, { productId: null, nameSnapshot: e.target.value })}
                                  placeholder="bijv. Paprika"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                                />
                                {(String(ing.productId || '')==='' && (ing.nameSnapshot||'').trim().length>=2 && sugg.length>0) && (
                                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 overflow-hidden">
                                    {sugg.map(p => (
                                      <button key={p.id} onMouseDown={(e)=>e.preventDefault()}
                                        onClick={() => updateIng(idx, {
                                          productId: p.id,
                                          nameSnapshot: p.name || '',
                                          categorySnapshot: p.category || 'Overig',
                                        })}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-b-0">
                                        <span className="flex-1 truncate">{p.name}</span>
                                        <span className="text-[11px] text-slate-400 shrink-0">{(p.category||'Overig').split(',')[0]}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {String(ing.productId || '') ? (
                                  <div className="text-[11px] text-slate-400 mt-1">{disp.cat}</div>
                                ) : (
                                  <select
                                    value={ing.categorySnapshot || 'Overig'}
                                    onChange={(e)=>updateIng(idx, { categorySnapshot: e.target.value })}
                                    className="mt-1 w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-[12px]"
                                    title="Categorie"
                                  >
                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                )}
                              </div>
                              <button onClick={()=>removeIng(idx)} className="w-10 h-10 mt-5 rounded-full bg-transparent text-slate-600 flex items-center justify-center" title="Ingrediënt verwijderen">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <div>
                                <div className="text-[11px] font-semibold text-slate-500 mb-1">Nodig</div>
                                <input
                                  value={ing.amount || ''}
                                  onChange={(e)=>updateIng(idx, { amount: e.target.value })}
                                  placeholder="bijv. 2"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                                />
                              </div>

                              <div>
                                <div className="text-[11px] font-semibold text-slate-500 mb-1">Eenheid</div>
                                <select
                                  value={ing.unit || 'st'}
                                  onChange={(e)=>updateIng(idx, { unit: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
                                >
                                  {['st','g','kg','ml','l','tl','el','snuf','blik','pak','zak','pot','fles'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </div>


                              
                              <div>
                                <div className="text-[11px] font-semibold text-slate-500 mb-1">Koop</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={()=>updateIng(idx, { buyQty: Math.max(1, (ing.buyQty ?? 1) - 1) })}
                                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-lg"
                                    aria-label="Minder"
                                  >
                                    –
                                  </button>
                                  <div className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-700">
                                    {ing.buyQty ?? 1}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={()=>updateIng(idx, { buyQty: Math.min(99, (ing.buyQty ?? 1) + 1) })}
                                    className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-lg"
                                    aria-label="Meer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                          </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button onClick={addIngredientRow} className="w-full mt-2 bg-white border border-slate-200 text-slate-700">+ ingrediënt</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-bold text-slate-800">Bereiding</div>
                  <WysiwygEditor
                    valueHtml={draft.preparationHtml || ''}
                    onChangeHtml={(html)=>setDraft(d=>({ ...d, preparationHtml: html }))}
                  />
                  <div className="text-[11px] text-slate-400">Tip: plakken vanuit Notities/website werkt prima.</div>
                </div>
              </div>
              <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-white/95 backdrop-blur border-t border-slate-100 mt-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {(recipes || []).some(r => r.id === draft.id) && (
                      <button
                        onClick={()=>deleteRecipe(draft)}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-sm font-semibold"
                      >
                        Recept verwijderen
                      </button>
                    )}
                    <Button onClick={saveRecipe} className="flex-1 bg-emerald-600 text-white">Opslaan</Button>
                  </div>
                </div>
            </Modal>
          )}
        </div>
      );
    }

    // ---------------- Lists menu ----------------
    function ListsMenu({ lists, activeListId, onPick, onCreate, onDelete }) {
      const [open, setOpen] = useState(false);
      const [newName, setNewName] = useState('');

      const activeName = (lists || []).find(l => l.id === activeListId)?.name || '—';

      return (
        <>
          <div className="flex items-center justify-between mb-3">
            <button onClick={()=>setOpen(true)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
              📋 {activeName} <span className="text-[10px] text-slate-400">▼</span>
            </button>
          </div>

          {open && (
            <Modal title="Lijsten" onClose={()=>setOpen(false)}>
              <div className="space-y-2">
                {(lists||[]).map(l => (
                  <div key={l.id} className="flex items-center gap-2">
                    <button onClick={()=>{ onPick(l.id); setOpen(false); }}
                      className={"flex-1 px-3 py-2.5 rounded-xl text-left border " +
                        (l.id===activeListId ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200")}>
                      <div className="font-semibold text-sm text-slate-800">{l.name}</div>
                      <div className="text-[11px] text-slate-400">{l.id===activeListId ? "actief" : ""}</div>
                    </button>
                    <button onClick={()=>onDelete(l.id)} className="w-10 h-10 rounded-full bg-transparent text-slate-600 flex items-center justify-center" title="Lijst verwijderen">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-semibold text-slate-500">Nieuwe lijst</div>
                <input value={newName} onChange={(e)=>setNewName(e.target.value)}
                  placeholder="bijv. Albert Heijn"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm" />
                <Button onClick={()=>{ onCreate(newName); setNewName(''); setOpen(false); }}
                  className="w-full bg-emerald-600 text-white">
                  + Maak lijst
                </Button>
              </div>
            </Modal>
          )}
        </>
      );
    }

    // ---------------- Main App ----------------
    function App() {
      const { user, loading } = useAuth();
      const { profile, loading: profileLoading, setActiveListId } = useUserProfile(user);

      const householdId = profile?.householdId || null;
      const activeListId = profile?.activeListId || null;

      const [householdInfo, setHouseholdInfo] = useState(null);
      const [tab, setTab] = useState('list');
      const [storeMode, setStoreMode] = useState(false);
      const [showListMenu, setShowListMenu] = useState(false);

      useEffect(() => {
        if (storeMode && tab !== 'list') setTab('list');
      }, [storeMode, tab]);
      const [showSignOut, setShowSignOut] = useState(false);
      const [createdCode, setCreatedCode] = useState(null);

      // Load household info (name + code)
      useEffect(() => {
        if (!user || !householdId) { setHouseholdInfo(null); return; }
        const ref = db.doc(`households/${householdId}/meta/info`);
        const unsub = ref.onSnapshot(snap => {
          setHouseholdInfo(snap.exists ? snap.data() : null);
        }, err => console.error("Household info error:", err));
        return () => unsub();
      }, [user, householdId]);

      // ---- One-time migration: legacy products -> schemaVersion 2 products (keeps old docs intact) ----
      useEffect(() => {
        if (!user || !householdId) return;

        let cancelled = false;

        async function migrateProductsV2IfNeeded() {
          try {
            const migRef = db.doc(`households/${householdId}/meta/migrations`);
            const migSnap = await migRef.get();
            const mig = migSnap.exists ? migSnap.data() : null;
            if (mig?.productsV2Done) return;

            // Read all products docs
            const legacySnap = await db.collection(`households/${householdId}/products`).get();
            if (legacySnap.empty) {
              await migRef.set({
                productsV2Done: true,
                productsV2DoneAt: firebase.firestore.FieldValue.serverTimestamp(),
                productsV2Stats: { legacyFound: 0, migrated: 0, skipped: 0 }
              }, { merge: true });
              return;
            }

            const legacyDocs = legacySnap.docs
              .map(d => ({ id: d.id, data: d.data() || {} }))
              .filter(x => !(x.data && (x.data.schemaVersion === 2 || (typeof x.data.id === 'string' && x.data.id.startsWith('p_')))));

            let migrated = 0;
            let skipped = 0;

            // Chunk batches (max 450 writes to be safe: new product docs + final meta write)
            const chunks = [];
            for (let i = 0; i < legacyDocs.length; i += 200) chunks.push(legacyDocs.slice(i, i+200));

            const mapping = {};
            for (const chunk of chunks) {
              if (cancelled) return;
              const batch = db.batch();

              for (const ld of chunk) {
                const oldId = ld.id;
                const d = ld.data || {};

                // If a v2 product already exists for this legacy doc (by legacyDocId), skip.
                // (Best effort: query is extra; to keep it cheap we rely on meta mapping on reruns.)
                if (mapping[oldId]) { skipped++; continue; }

                const newId = genId('p');

                const name = (d.name && String(d.name).trim()) ? String(d.name).trim() : titleFromLegacyDocId(oldId);
                const category = (d.category && String(d.category).trim()) ? String(d.category).trim() : 'Overig';

                const newDoc = {
                  id: newId,
                  schemaVersion: 2,
                  legacyDocId: oldId,
                  name,
                  category,
                  // preserve known fields if present
                  count: d.count ?? 0,
                  lastBought: d.lastBought ?? null,
                  dates: Array.isArray(d.dates) ? d.dates : [],
                  lastAmount: d.lastAmount ?? '',
                  lastUnit: d.lastUnit ?? '',
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                  updatedBy: user.uid,
                  migratedAt: firebase.firestore.FieldValue.serverTimestamp(),
                };

                batch.set(db.doc(`households/${householdId}/products/${newId}`), newDoc, { merge: true });
                mapping[oldId] = newId;
                migrated++;
              }

              await batch.commit();
            }

            if (cancelled) return;

            await migRef.set({
              productsV2Done: true,
              productsV2DoneAt: firebase.firestore.FieldValue.serverTimestamp(),
              productsV2Stats: {
                legacyFound: legacyDocs.length,
                migrated,
                skipped
              },
              productsV2Map: mapping
            }, { merge: true });

          } catch (e) {
            console.error("Migration products v2 failed:", e);
            // Don't mark as done; user can retry by reloading.
          }
        }

        migrateProductsV2IfNeeded();
        return () => { cancelled = true; };
      }, [user, householdId]);

      const { members, lists, products, items, recipes, syncing } = useHouseholdData(user, householdId, activeListId, setActiveListId);

      async function handleCreateList(name) {
        if (!householdId || !user) return;
        const listId = genId('l');
        await db.doc(`households/${householdId}/lists_meta/${listId}`).set({
          name: (name || '').trim() || 'Nieuwe lijst',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: user.uid,
        });
        setActiveListId(listId);
      }

      async function handleDeleteList(listId) {
        if (!householdId) return;
        if (!confirm('Lijst verwijderen? Items in die lijst worden ook verwijderd.')) return;

        await db.doc(`households/${householdId}/lists_meta/${listId}`).delete();

        const snap = await db.collection(`households/${householdId}/lists/${listId}/items`).get();
        if (!snap.empty) {
          const batch = db.batch();
          snap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }

        if (activeListId === listId) {
          const remaining = (lists || []).filter(l => l.id !== listId);
          if (remaining.length > 0) setActiveListId(remaining[0].id);
          else setActiveListId(null);
        }
      }

      function handleSignIn() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(e => console.error('Sign in error:', e));
      }

      function handleCopyCode() {
        if (householdInfo?.code) navigator.clipboard.writeText(householdInfo.code).catch(()=>{});
      }

      if (loading || (user && profileLoading)) {
        return (
          <div className="min-h-screen flex items-center justify-center text-slate-500">
            Laden…
          </div>
        );
      }

      if (!user) {
        return (
          <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="max-w-xl mx-auto px-4 pt-10 pb-20">
              <h1 className="text-2xl font-black text-slate-900 mb-2">Boodschappenlijstjesmaker</h1>
              <p className="text-slate-600 text-sm mb-6">Log in met Google om samen te werken.</p>
              <Button onClick={handleSignIn} className="bg-emerald-600 text-white w-full">
                Inloggen met Google
              </Button>
            </div>
          </div>
        );
      }

      if (!householdId) {
        return <SetupScreen user={user} onCreated={setCreatedCode} />;
      }

      return (
        <div className="min-h-screen pb-24 bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="max-w-xl mx-auto px-3 pt-4">
            <Header
              user={user}
              householdInfo={householdInfo}
              householdId={householdId}
              members={members}
              syncing={syncing}
              storeMode={storeMode}
              setStoreMode={setStoreMode}
              onCopyCode={handleCopyCode}
              onSignOut={()=> setShowSignOut(true)}
            />

            {!storeMode && (
            <ListsMenu
              lists={lists}
              activeListId={activeListId}
              onPick={(id)=>setActiveListId(id)}
              onCreate={handleCreateList}
              onDelete={handleDeleteList}
            />
            )}

            {!storeMode && (
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Button onClick={()=>setTab('list')}
                  className={tab==='list' ? 'bg-emerald-600 text-white w-full' : 'bg-white border border-slate-200 text-slate-700 w-full'}>
                  🛒 Lijst
                </Button>
                {tab==='list' && (
                  <button
                    onClick={(e)=>{ e.stopPropagation(); setShowListMenu(prev => !prev); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg text-white/70 hover:text-white text-[10px] flex items-center justify-center"
                  >▼</button>
                )}
                {showListMenu && tab==='list' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={()=>setShowListMenu(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <button
                        onClick={async ()=>{
                          setShowListMenu(false);
                          if (!confirm('Hele lijst leegmaken?')) return;
                          const snap = await db.collection(`households/${householdId}/lists/${activeListId}/items`).get();
                          if (!snap.empty) {
                            const batch = db.batch();
                            snap.docs.forEach(d => batch.delete(d.ref));
                            await batch.commit();
                          }
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600"
                      ><span className="inline-flex items-center gap-2"><TrashIcon className="w-4 h-4" /> Wissen</span></button>
                    </div>
                  </>
                )}
              </div>
              <Button onClick={()=>setTab('products')}
                className={tab==='products' ? 'bg-emerald-600 text-white flex-1' : 'bg-white border border-slate-200 text-slate-700 flex-1'}>
                📋 Producten
              </Button>
              <Button onClick={()=>setTab('recipes')}
                className={tab==='recipes' ? 'bg-emerald-600 text-white flex-1' : 'bg-white border border-slate-200 text-slate-700 flex-1'}>
                🍲 Recepten
              </Button>
            </div>
            )}

            {tab === 'list' ? (
              <ListTab
                householdId={householdId}
                activeListId={activeListId}
                products={products}
                items={items}
                currentUser={user}
                storeMode={storeMode}
              />
            ) : tab === 'products' ? (
              <ProductsTab
                householdId={householdId}
                products={products}
                items={items}
                currentUser={user}
                activeListId={activeListId}
              />
) : (
              <RecipesTab
                householdId={householdId}
                recipes={recipes}
                products={products}
                items={items}
                activeListId={activeListId}
                currentUser={user}
              />
            )}
          </div>

          {createdCode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <div className="text-lg font-bold text-slate-900 mb-1">Huishouden aangemaakt!</div>
                <div className="text-sm text-slate-600 mb-4">
                  De code voor jouw huishouden is:
                </div>
                <div className="font-mono text-2xl font-black tracking-widest text-emerald-700 bg-emerald-50 rounded-xl py-3 mb-4">
                  {createdCode.code}
                </div>
                <div className="text-sm text-slate-500 mb-5">
                  Je vindt deze code terug onder <strong>Huishouden beheren</strong> als je rechtsboven op je avatar klikt.
                </div>
                <Button
                  onClick={() => setCreatedCode(null)}
                  className="w-full bg-emerald-600 text-white"
                >OK</Button>
              </div>
            </div>
          )}

          {showSignOut && (
            <Modal title="Uitloggen" onClose={()=>setShowSignOut(false)}>
              <div className="text-sm text-slate-700 mb-4">Wil je uitloggen?</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="bg-slate-100 text-slate-700 flex-1" onClick={()=>setShowSignOut(false)}>Annuleren</Button>
                <Button className="bg-rose-600 text-white flex-1" onClick={()=>auth.signOut()}>Uitloggen</Button>
              </div>
            </Modal>
          )}
        </div>
      );
    }

  

export default App;
