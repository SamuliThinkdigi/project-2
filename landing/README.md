# Thinkdigi Invoice Hub - Landing Page

Tämä on Thinkdigi Invoice Hub -sovelluksen esittelysivu ja hosting-ratkaisu.

## Rakenne

```
landing/
├── index.html          # Pääsivu
├── css/
│   └── styles.css      # Tyylit
├── js/
│   └── main.js         # JavaScript-toiminnallisuus
├── images/             # Kuvat ja ikonit
├── app/
│   └── index.html      # Ohjaus pääsovellukseen
├── privacy/
│   └── index.html      # Tietosuojaseloste
├── terms/
│   └── index.html      # Käyttöehdot
├── netlify.toml        # Netlify-konfiguraatio
└── README.md           # Tämä tiedosto
```

## Hosting

### Netlify (Suositus)

1. **Luo Netlify-tili** osoitteessa https://netlify.com
2. **Yhdistä Git-repositorio** tai vedä ja pudota `landing`-kansio
3. **Määritä custom domain** (esim. `invoice-hub.thinkdigi.fi`)
4. **SSL-sertifikaatti** aktivoituu automaattisesti

### Vaihtoehtoiset hosting-palvelut

- **Vercel**: https://vercel.com
- **GitHub Pages**: https://pages.github.com
- **Cloudflare Pages**: https://pages.cloudflare.com

## Konfigurointi

### 1. Domain-nimi

Päivitä seuraavat tiedostot domain-nimellä:

- `index.html`: Open Graph URL
- `app/index.html`: Ohjaus-URL
- `js/main.js`: Analytics-konfiguraatio

### 2. Kuvat

Lisää seuraavat kuvat `images/`-kansioon:

- `logo.svg` - Thinkdigi logo
- `hero-dashboard.png` - Dashboard-kuvakaappaus
- `testimonial-*.jpg` - Asiakaspalautteiden kuvat
- `badge-*.svg` - Compliance-badget

### 3. Analytics

Päivitä Google Analytics ID tiedostossa `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 4. Yhteystiedot

Päivitä yhteystiedot tiedostoissa:
- `index.html`
- `privacy/index.html`
- `terms/index.html`

## Shopify Partner Dashboard

Käytä seuraavia URL:eja Shopify Partner Dashboardissa:

- **App URL**: `https://your-domain.com/app`
- **Allowed redirection URLs**: 
  - `https://your-domain.com/auth/shopify/callback`
  - `https://your-domain.com/auth/shopify/install`

## SEO-optimointi

Sivu on optimoitu hakukoneille:

- Semanttinen HTML-rakenne
- Meta-tagit ja Open Graph
- Strukturoitu data (JSON-LD)
- Nopeat latausajat
- Mobiiliystävällinen design

## Turvallisuus

- HTTPS pakollinen
- Turvallisuusheaderit (CSP, HSTS, jne.)
- GDPR-yhteensopiva
- Evästeiden hallinta

## Ylläpito

### Säännölliset päivitykset

- Asiakaspalautteet
- Hinnoittelutiedot
- Ominaisuuskuvaukset
- Yhteystiedot

### Seuranta

- Google Analytics
- Netlify Analytics
- Uptime-seuranta

## Tuki

Jos tarvitset apua sivuston kanssa:

- **Tekninen tuki**: dev@thinkdigi.fi
- **Sisältöpäivitykset**: marketing@thinkdigi.fi
- **Domain-asiat**: admin@thinkdigi.fi