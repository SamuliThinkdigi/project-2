# Shopify App Store -julkaisun tarkistuslista

## 📋 Perustiedot

### App-tiedot
- [x] **App-nimi**: Thinkdigi Invoice Hub - E-laskutus Suomeen
- [x] **Tagline**: Automaattinen e-laskutus Shopify-tilauksista Maventa-palvelun kautta
- [x] **Kategoria**: Store management > Accounting
- [x] **Kuvaus**: Kirjoitettu suomeksi ja englanniksi
- [x] **Avainsanat**: e-laskutus, maventa, suomi, finland, invoice, accounting

### Kehittäjätiedot
- [x] **Yritys**: Thinkdigi Oy
- [x] **Y-tunnus**: 2847123-4
- [x] **Yhteystiedot**: partners@thinkdigi.fi
- [x] **Tukisähköposti**: support@thinkdigi.fi
- [x] **Verkkosivut**: https://thinkdigi.fi

### URL:t
- [x] **App URL**: https://invoice-hub.thinkdigi.fi
- [x] **Support URL**: https://invoice-hub.thinkdigi.fi/support
- [x] **Privacy Policy**: https://invoice-hub.thinkdigi.fi/privacy
- [x] **Terms of Service**: https://invoice-hub.thinkdigi.fi/terms

## 🎨 Visuaalinen materiaali

### Pakolliset kuvat
- [ ] **App Icon** (512x512px PNG)
  - Thinkdigi-logo salamakuvakkeella
  - Sininen gradientti (#2563eb → #7c3aed)
  - Läpinäkyvä tausta

### Kuvakaappaukset (1200x800px PNG)
- [ ] **Screenshot 1**: Dashboard-näkymä (hero-kuva)
- [ ] **Screenshot 2**: Laskun luontilomake
- [ ] **Screenshot 3**: Shopify-integraation asetukset
- [ ] **Screenshot 4**: Laskujen listausnäkymä
- [ ] **Screenshot 5**: Raporttinäkymä

### Video (valinnainen)
- [ ] **Demo-video** (MP4, max 30s)
  - Sovelluksen käytön esittely
  - Suomenkielinen selostus
  - Korkea laatu

## 💰 Hinnoittelumalli

### Suunnitelmat
- [x] **Starter**: 29,90€/kk (10 laskua/kk)
- [x] **Professional**: 49€/kk (100 laskua/kk) - Suosituin
- [x] **Enterprise**: 99€/kk (rajoittamaton)

### Kokeilujakso
- [x] **Ilmainen kokeilu**: 7 päivää
- [x] **Kaikki ominaisuudet**: Käytössä kokeilujaksolla
- [x] **Ei sitoutumisaikaa**: Peruuta milloin tahansa

## 🔧 Tekniset vaatimukset

### OAuth ja käyttöoikeudet
- [x] **OAuth 2.0**: Toteutettu
- [x] **Scopes**: 
  - read_orders, write_orders
  - read_products, write_products
  - read_customers, write_customers
  - write_webhooks

### Webhooks
- [x] **orders/create**: Uudet tilaukset
- [x] **orders/updated**: Tilausten päivitykset
- [x] **orders/paid**: Maksetut tilaukset
- [x] **app/uninstalled**: Sovelluksen poisto

### API-integraatiot
- [x] **Shopify Admin API**: 2024-01 versio
- [x] **Maventa API**: v1 integraatio
- [x] **Webhook-varmistus**: HMAC-allekirjoitukset

## 🔒 Turvallisuus ja compliance

### GDPR-vaatimukset
- [x] **Tietosuojaseloste**: Saatavilla suomeksi ja englanniksi
- [x] **Käyttäjän oikeudet**: Tarkastus, korjaus, poisto
- [x] **Data minimization**: Kerätään vain tarvittavat tiedot
- [x] **EU-alueen palvelimet**: Kaikki data EU:ssa

### Tietoturva
- [x] **HTTPS**: Kaikki liikenne salattu
- [x] **Salasanojen suojaus**: bcrypt-hashays
- [x] **API-avainten suojaus**: Ympäristömuuttujat
- [x] **Tietokantasalaus**: AES-256

### Shopify-vaatimukset
- [x] **Partner Dashboard**: Sovellus rekisteröity
- [x] **App Bridge**: Käytössä upotetussa tilassa
- [x] **Polaris**: Shopifyn designsystem käytössä
- [x] **Webhook-varmistus**: HMAC-allekirjoitusten tarkistus

## 📚 Dokumentaatio

### Käyttöohjeet
- [x] **Asennusopas**: Vaihe vaiheelta -ohjeet
- [x] **Käyttöopas**: Kattavat käyttöohjeet
- [x] **FAQ**: Usein kysytyt kysymykset
- [x] **Video-oppaat**: Asennuksen ja käytön demot

### Tekninen dokumentaatio
- [x] **API-dokumentaatio**: RESTful API -kuvaus
- [x] **Webhook-dokumentaatio**: Tapahtumien käsittely
- [x] **Integraatio-oppaat**: Maventa-yhteyden määritys

### Tukimateriaali
- [x] **Asiakaspalvelu**: support@thinkdigi.fi
- [x] **Tukisivusto**: https://invoice-hub.thinkdigi.fi/support
- [x] **Live chat**: Sovelluksen sisäinen chat
- [x] **Puhelintuki**: +358 50 123 4567 (arkisin 8-16)

## 🧪 Testaus

### Toiminnallisuustestit
- [ ] **Asennus ja poisto**: Toimii virheettömästi
- [ ] **OAuth-flow**: Käyttöoikeudet myönnetään oikein
- [ ] **Webhook-vastaanotto**: Kaikki webhookit käsitellään
- [ ] **Laskujen luonti**: Automaattinen ja manuaalinen
- [ ] **Maventa-integraatio**: Laskujen lähetys toimii

### Käyttöliittymätestit
- [ ] **Responsiivinen suunnittelu**: Toimii kaikilla laitteilla
- [ ] **Saavutettavuus**: WCAG 2.1 AA -taso
- [ ] **Selainyhteensopivuus**: Chrome, Firefox, Safari, Edge
- [ ] **Latausajat**: Alle 3 sekuntia

### Suorituskykytestit
- [ ] **Kuormitustestit**: 1000+ samanaikaista käyttäjää
- [ ] **API-vastausajat**: Alle 500ms
- [ ] **Tietokannan suorituskyky**: Optimoidut kyselyt

## 📊 Analytiikka ja seuranta

### Käyttöanalytiikka
- [x] **Google Analytics**: Käyttäjien seuranta
- [x] **Mixpanel**: Tapahtumien seuranta
- [x] **Error tracking**: Sentry virheenseuranta

### Liiketoiminta-analytiikka
- [x] **Conversion tracking**: Kokeilujen muuntaminen
- [x] **Churn analysis**: Asiakkaiden poistuminen
- [x] **Feature usage**: Ominaisuuksien käyttö

## 🚀 Julkaisuvalmius

### Pre-launch tarkistukset
- [ ] **Staging-ympäristö**: Täysin toimiva
- [ ] **Production-ympäristö**: Valmis ja testattu
- [ ] **DNS-asetukset**: Oikeat domainit
- [ ] **SSL-sertifikaatit**: Voimassa ja toimivat

### App Store -lähetys
- [ ] **Partner Dashboard**: Kaikki tiedot täytetty
- [ ] **Kuvat ladattu**: Kaikki vaaditut kuvat
- [ ] **Hinnoittelu määritetty**: Kaikki suunnitelmat
- [ ] **Lähetys**: App Store -arvioitavaksi

### Julkaisun jälkeen
- [ ] **Seuranta**: Asennusmäärien seuranta
- [ ] **Asiakaspalaute**: Arvostelujen kerääminen
- [ ] **Tuki valmiudessa**: Asiakaspalvelu aktiivinen
- [ ] **Markkinointi**: Julkaisukampanja käynnistetty

## 📞 Yhteystiedot ja tuki

### Kehitystiimi
- **Pääkehittäjä**: dev@thinkdigi.fi
- **Tuotevastaava**: product@thinkdigi.fi
- **Asiakaspalvelu**: support@thinkdigi.fi

### Shopify Partner Support
- **Partner Help Center**: https://help.shopify.com/partners
- **Partner Community**: https://community.shopify.com/c/partners
- **Partner Support**: partners@shopify.com

### Tärkeät linkit
- **Shopify App Requirements**: https://shopify.dev/apps/store/requirements
- **App Store Guidelines**: https://shopify.dev/apps/store/guidelines
- **Partner Dashboard**: https://partners.shopify.com

---

**Huomio**: Tämä tarkistuslista on päivitettävä säännöllisesti Shopifyn vaatimusten muuttuessa.