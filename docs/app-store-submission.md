# Shopify App Store -lähetysohjeet

## Valmistelulista ennen lähetystä

### ✅ Tekniset vaatimukset
- [x] Sovellus toimii kaikilla Shopify-suunnitelmilla
- [x] OAuth 2.0 -autentikointi toteutettu
- [x] Webhook-integraatiot toimivat
- [x] HTTPS käytössä kaikessa liikenteessä
- [x] Responsiivinen suunnittelu
- [x] Polaris-designsystem käytössä

### ✅ Sisältövaatimukset
- [x] App-kuvaus suomeksi ja englanniksi
- [x] Kuvakaakkeet (512x512px)
- [x] Kuvakarusellin kuvat (1200x800px)
- [x] Video-demo (max 30s)
- [x] Tietosuojaseloste
- [x] Käyttöehdot

### ✅ Toiminnalliset vaatimukset
- [x] Asennus ja poisto toimivat
- [x] Virheenkäsittely kattava
- [x] Käyttöliittymä intuitiivinen
- [x] Suorituskyky optimoitu

## Lähetysprosessi

### 1. Partner Dashboard -valmistelu

1. **Kirjaudu Shopify Partner Dashboardiin**
2. **Valitse sovelluksesi**
3. **Täytä App Store -tiedot:**

#### Perustiedot
```
App name: Thinkdigi Invoice Hub
Tagline: Automaattinen e-laskutus Shopify-tilauksista
Description: [Käytä docs/app-store-listing.md sisältöä]
```

#### Kategoriat ja tagit
```
Primary category: Accounting & Finance
Secondary category: Productivity
Tags: invoicing, accounting, finland, automation, maventa
```

#### Hinnoittelu
```
Pricing model: Subscription
Plans:
- Starter: €19/month (50 invoices)
- Professional: €49/month (200 invoices)  
- Enterprise: €99/month (unlimited)
Free trial: 14 days
```

### 2. Kuvat ja media

#### App Icon (512x512px)
- Thinkdigi-logo sinisellä gradientilla
- Salamakuvake nopeutta symboloimassa
- PNG-formaatti, läpinäkyvä tausta

#### Kuvakaruselli (1200x800px)
1. **Hero-kuva:** Dashboard-näkymä
2. **Automaatio:** Tilaus → Lasku -prosessi
3. **Integraatio:** Shopify + Maventa -yhteys
4. **Raportointi:** Laskuraportit
5. **Mobiili:** Responsiivinen käyttöliittymä

#### Video (MP4, max 30s)
- Sovelluksen käytön demo
- Automaattisen laskutuksen esittely
- Suomenkielinen ääni/tekstitys

### 3. Dokumentaatio

#### Tietosuojaseloste
- Linkki: `https://your-domain.com/privacy-policy`
- Sisältö: `docs/privacy-policy.md`

#### Käyttöehdot  
- Linkki: `https://your-domain.com/terms-of-service`
- Sisältö: `docs/terms-of-service.md`

#### Tuki ja dokumentaatio
- Support URL: `https://your-domain.com/support`
- Documentation: `https://docs.your-domain.com`

### 4. Tekninen validointi

#### Webhook-endpointit
```
https://your-domain.com/webhooks/shopify/orders/create
https://your-domain.com/webhooks/shopify/orders/updated
https://your-domain.com/webhooks/shopify/orders/paid
https://your-domain.com/webhooks/shopify/app/uninstalled
```

#### OAuth-konfiguraatio
```
App URL: https://your-domain.com/
Redirection URLs: 
- https://your-domain.com/auth/shopify/callback
- https://your-domain.com/auth/shopify/install
```

#### Scopes
```
read_orders, write_orders
read_products, write_products
read_customers, write_customers
write_webhooks
```

### 5. Testaus ennen lähetystä

#### Asennus- ja poistotestit
1. Asenna sovellus test-kauppaan
2. Määritä asetukset
3. Luo testilaskuja
4. Testaa automaattinen laskutus
5. Poista sovellus ja varmista cleanup

#### Toiminnallisuustestit
1. OAuth-flow toimii
2. Webhookit vastaanotetaan
3. Laskut luodaan oikein
4. Maventa-integraatio toimii
5. Virheenkäsittely toimii

#### Suorituskykytestit
1. Latausajat < 3 sekuntia
2. API-vastausajat < 500ms
3. Samanaikaisia käyttäjiä: 100+

### 6. Lähetys App Storeen

#### Partner Dashboardissa:
1. **"App Store" -välilehti**
2. **"Submit for review"**
3. **Täytä kaikki vaaditut kentät**
4. **Lataa kuvat ja video**
5. **Vahvista tiedot**
6. **Lähetä arvioitavaksi**

#### Arvioinnin aikana:
- **Vastausaika:** 5-10 työpäivää
- **Mahdolliset kysymykset:** Vastaa nopeasti
- **Korjaukset:** Tee tarvittavat muutokset

### 7. Julkaisun jälkeen

#### Markkinointi
1. **Ilmoita julkaisusta** sosiaalisessa mediassa
2. **Lähetä tiedote** asiakkaille
3. **Päivitä verkkosivut**
4. **Aloita markkinointikampanja**

#### Seuranta
1. **Asennusmäärät**
2. **Käyttäjäpalaute**
3. **Suorituskykymittarit**
4. **Tukipyynnöt**

## Tarkistuslista

### Ennen lähetystä
- [ ] Kaikki ominaisuudet testattu
- [ ] Dokumentaatio valmis
- [ ] Kuvat ja video luotu
- [ ] Hinnoittelu määritetty
- [ ] Tietosuoja-asiat kunnossa
- [ ] Tuki valmiudessa

### Lähetyksen yhteydessä
- [ ] Partner Dashboard täytetty
- [ ] Kaikki kuvat ladattu
- [ ] Linkit toimivat
- [ ] Yhteystiedot oikein
- [ ] Lähetys vahvistettu

### Julkaisun jälkeen
- [ ] Markkinointi käynnistetty
- [ ] Seuranta aloitettu
- [ ] Asiakaspalvelu valmiudessa
- [ ] Jatkokehitys suunniteltu

## Yhteystiedot

**Shopify Partner Support:**
- Email: partners@shopify.com
- Help Center: https://help.shopify.com/partners

**Thinkdigi Team:**
- Email: dev@thinkdigi.fi
- Phone: +358 50 123 4567