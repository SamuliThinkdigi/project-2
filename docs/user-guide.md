# Thinkdigi Invoice Hub - Käyttöopas

## Sisällysluettelo

1. [Aloittaminen](#aloittaminen)
2. [Asennus ja käyttöönotto](#asennus-ja-käyttöönotto)
3. [Laskujen luominen](#laskujen-luominen)
4. [Shopify-integraatio](#shopify-integraatio)
5. [Raportointi](#raportointi)
6. [Asetukset](#asetukset)
7. [Vianmääritys](#vianmääritys)

## Aloittaminen

### Mitä tarvitset

Ennen kuin aloitat Thinkdigi Invoice Hub:n käytön, varmista että sinulla on:

- ✅ **Shopify-kauppa** (Basic Shopify tai korkeampi)
- ✅ **Maventa-tili** e-laskutusta varten
- ✅ **Y-tunnus** ja **ALV-numero**
- ✅ **Pankkitiedot** laskutusta varten

### Ensimmäiset askeleet

1. **Asenna sovellus** Shopify App Storesta
2. **Määritä Maventa-yhteys** asetuksissa
3. **Lisää asiakastiedot** tai synkronoi Shopifysta
4. **Luo ensimmäinen lasku** testiksi
5. **Aktivoi automaattinen laskutus**

## Asennus ja käyttöönotto

### 1. Sovelluksen asennus

1. Mene **Shopify App Storeen**
2. Etsi "**Thinkdigi Invoice Hub**"
3. Klikkaa "**Add app**"
4. Hyväksy sovelluksen käyttöoikeudet:
   - Tilausten lukeminen
   - Asiakkaiden lukeminen
   - Tuotteiden lukeminen
   - Webhookien luominen

### 2. Maventa-yhteyden määritys

1. Avaa sovelluksen **asetukset**
2. Mene **"API Configuration"** -välilehdelle
3. Syötä **Maventa-tunnuksesi**:
   - Client ID
   - Client Secret
   - Valitse ympäristö (Test/Production)
4. Klikkaa **"Test Connection"**
5. Tallenna asetukset kun yhteys toimii

### 3. Yritystietojen määritys

1. Mene **"Company Info"** -välilehdelle
2. Täytä yrityksen tiedot:
   - Yrityksen nimi
   - Y-tunnus
   - ALV-numero
   - Osoitetiedot
   - Yhteystiedot
3. Tallenna tiedot

### 4. Laskutusasetusten määritys

1. Mene **"Invoice Settings"** -välilehdelle
2. Määritä:
   - Laskun etuliite (esim. "SHOP")
   - Maksuaika (oletuksena 30 päivää)
   - Oletus ALV-kanta (24%)
   - Automaattinen laskutus (suositus: päällä)

## Laskujen luominen

### Automaattinen laskutus

Kun automaattinen laskutus on päällä:

1. **Asiakas tekee tilauksen** Shopify-kaupassa
2. **Webhook laukeaa** ja ilmoittaa uudesta tilauksesta
3. **Lasku luodaan automaattisesti** tilauksen tiedoista
4. **Lasku lähetetään** Maventa-palvelun kautta
5. **Saat ilmoituksen** laskun lähettämisestä

### Manuaalinen laskutus

#### Uuden laskun luominen

1. Klikkaa **"Send Invoice"** navigaatiossa
2. Täytä laskun perustiedot:
   - **Laskun numero** (automaattinen ehdotus)
   - **Vastaanottaja** (valitse listasta tai luo uusi)
   - **Laskun päivämäärä**
   - **Eräpäivä**
3. Lisää **laskurivit**:
   - Tuotteen kuvaus
   - Määrä
   - Yksikköhinta
   - ALV-kanta
4. Tarkista **yhteenveto**
5. Klikkaa **"Send Invoice"**

#### Laskurivien lisääminen

**Manuaalinen lisäys:**
1. Klikkaa **"Add Item"**
2. Täytä tuotteen tiedot
3. Valitse ALV-kanta

**Shopify-tuotteista:**
1. Klikkaa **"Add from Store"** (jos Shopify-integraatio on päällä)
2. Etsi tuote hakukentästä
3. Valitse tuotevariantti
4. Klikkaa **"Add to Invoice"**

### Laskujen hallinta

#### Laskujen tarkastelu

1. Mene **"Sent Invoices"** tai **"Received Invoices"**
2. Käytä **suodattimia**:
   - Tila (Draft, Sent, Paid, jne.)
   - Päivämääräväli
   - Asiakas
3. **Etsi** laskuja numerolla tai asiakkaan nimellä

#### Laskun tilan päivittäminen

1. Klikkaa laskua listassa
2. Valitse **"Mark as Paid"** kun maksu saapuu
3. Tai **"Cancel Invoice"** jos lasku peruutetaan

## Shopify-integraatio

### Automaattinen synkronointi

Sovellus synkronoi automaattisesti:

- ✅ **Tilaukset** → Laskut
- ✅ **Asiakkaat** → Yritykset
- ✅ **Tuotteet** → Laskurivit
- ✅ **Maksutiedot** → Laskun tila

### Shopify-asetusten määritys

1. Mene **"Shopify Integration"** -sivulle
2. Määritä **integraatioasetukset**:
   - Automaattinen laskutus (suositus: päällä)
   - Laskun etuliite
   - Maksuaika
   - Synkronointiasetukset
3. Tallenna asetukset

### Tuotteiden synkronointi

1. Klikkaa **"Sync Products"**
2. Odota synkronoinnin valmistumista
3. Tuotteet näkyvät nyt **"Products"** -välilehdellä
4. Voit käyttää tuotteita laskujen luonnissa

### Asiakkaiden synkronointi

1. Klikkaa **"Sync Customers"**
2. Shopify-asiakkaat muunnetaan yrityksiksi
3. Asiakkaat näkyvät **"Companies"** -sivulla
4. Voit muokata asiakastietoja tarvittaessa

## Raportointi

### Dashboard-näkymä

Dashboard näyttää:

- 📊 **Lähetettyjen laskujen määrä**
- 💰 **Kokonaisliikevaihto**
- ⏳ **Maksamattomat laskut**
- 📈 **Kuukausittainen kasvu**

### Laskuraportit

1. Mene **"Reports"** -sivulle
2. Valitse **aikaväli**
3. Valitse **raportin tyyppi**:
   - Laskujen yhteenveto
   - ALV-raportti
   - Asiakasraportti
   - Tuoteraportti
4. **Vie tiedot** Excel- tai PDF-muotoon

### ALV-raportointi

ALV-raportti sisältää:

- **0% ALV** - Viennit ja vapautetut
- **10% ALV** - Kuljetukset ja majoitus
- **14% ALV** - Elintarvikkeet ja rehut
- **24% ALV** - Yleiset tuotteet ja palvelut

## Asetukset

### Käyttäjäasetukset

1. Mene **"Settings"** → **"Profile"**
2. Päivitä:
   - Nimi ja yhteystiedot
   - Salasana
   - Kieliasetukset
   - Ilmoitusasetukset

### Yritysasetukset

1. Mene **"Settings"** → **"Company"**
2. Päivitä:
   - Yrityksen tiedot
   - Pankkitiedot
   - Logo
   - Laskupohja

### Integraatioasetukset

#### Maventa-asetukset
- API-tunnukset
- Ympäristö (Test/Production)
- Automaattinen lähetys
- Ilmoitukset

#### Shopify-asetukset
- Kaupan URL
- Access Token
- Webhook-asetukset
- Synkronointiväli

### Ilmoitusasetukset

Määritä milloin saat ilmoituksia:

- ✉️ **Sähköposti-ilmoitukset**
  - Uusi lasku luotu
  - Lasku lähetetty
  - Maksu saapunut
  - Lasku erääntynyt

- 🔔 **Sovelluksen sisäiset ilmoitukset**
  - Reaaliaikaiset päivitykset
  - Järjestelmäilmoitukset
  - Virhetilanteet

## Vianmääritys

### Yleiset ongelmat

#### "Laskuja ei luoda automaattisesti"

**Tarkista:**
1. ✅ Automaattinen laskutus on päällä
2. ✅ Maventa-yhteys toimii
3. ✅ Webhook-asetukset ovat oikein
4. ✅ Asiakastiedot ovat kunnossa

**Ratkaisu:**
1. Mene **Settings** → **Shopify Integration**
2. Tarkista **"Auto-create Invoices"** on päällä
3. Testaa **Maventa-yhteys** Settings-sivulla
4. Tarkista **webhook-loki** mahdollisten virheiden varalta

#### "Maventa-yhteys ei toimi"

**Tarkista:**
1. ✅ Client ID ja Client Secret ovat oikein
2. ✅ Ympäristö on oikea (Test/Production)
3. ✅ Maventa-tili on aktiivinen
4. ✅ Internet-yhteys toimii

**Ratkaisu:**
1. Kirjaudu **Maventa-portaaliin** ja tarkista tunnukset
2. Kopioi tunnukset uudelleen sovellukseen
3. Testaa yhteys **"Test Connection"** -napilla
4. Jos ongelma jatkuu, ota yhteyttä tukeen

#### "Shopify-tuotteet eivät synkronoidu"

**Tarkista:**
1. ✅ Shopify-integraatio on määritetty
2. ✅ Access Token on voimassa
3. ✅ Tuotteet ovat "Active"-tilassa Shopifyssa
4. ✅ Käyttöoikeudet ovat riittävät

**Ratkaisu:**
1. Mene **Shopify Integration** → **Products**
2. Klikkaa **"Sync Products"**
3. Odota synkronoinnin valmistumista
4. Päivitä sivu jos tuotteet eivät näy

### Virheviestit

#### "Invalid VAT number"
- Tarkista ALV-numeron muoto (FI12345678)
- Varmista että numero on rekisteröity

#### "Recipient email required"
- Lisää sähköpostiosoite asiakkaan tietoihin
- Tarkista sähköpostin muoto

#### "Invoice number already exists"
- Vaihda laskun numeroa
- Tarkista numerosarja-asetukset

#### "Connection timeout"
- Tarkista internet-yhteys
- Yritä myöhemmin uudelleen
- Ota yhteyttä tukeen jos ongelma jatkuu

### Lokitiedostot

Tarkista virhetilanteet:

1. Mene **Settings** → **System Logs**
2. Suodata **virhetason** mukaan
3. Etsi **aikaleiman** perusteella
4. Kopioi **virheviesti** tukipyyntöön

### Yhteystiedot

**Tekninen tuki:**
- 📧 **Sähköposti:** support@thinkdigi.fi
- 📞 **Puhelin:** +358 50 123 4567
- 💬 **Chat:** Sovelluksen sisäinen chat
- 🕒 **Aukioloajat:** Ma-Pe 8-16

**Kiireelliset asiat:**
- 📧 **Sähköposti:** urgent@thinkdigi.fi
- 📞 **Puhelin:** +358 50 123 4568 (24/7)

**Dokumentaatio:**
- 📖 **Käyttöohjeet:** https://docs.thinkdigi.fi
- 🔧 **API-dokumentaatio:** https://api.thinkdigi.fi/docs
- ❓ **FAQ:** https://help.thinkdigi.fi

### Tukipyynnön tekeminen

Kun otat yhteyttä tukeen, kerro:

1. **Mitä yritit tehdä?**
2. **Mitä tapahtui?**
3. **Mitä odotit tapahtuvan?**
4. **Milloin ongelma ilmeni?**
5. **Virheviesti** (jos sellainen näkyi)
6. **Selain ja käyttöjärjestelmä**
7. **Shopify-kaupan nimi**

**Liitä mukaan:**
- Kuvakaappaukset virhetilanteesta
- Lokitiedostot (Settings → System Logs)
- Laskun tiedot (jos ongelma koskee tiettyä laskua)

---

*Tämä opas päivitetään säännöllisesti. Viimeisin versio löytyy aina osoitteesta: https://docs.thinkdigi.fi/user-guide*