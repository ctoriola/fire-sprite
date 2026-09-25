# Lord,Saint,Sinner — official website

A static, dependency-free website for the music artist Lord,Saint,Sinner. The look is based on the orange-to-crimson reference design: heavy condensed display type, dotted genre tags, waveform edges, a central play button and white feature cards.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: hero with a playable lead single, new-album tracklist, the trilogy, press, tour preview, videos, merch, news, mailing list |
| `music.html` | SINNER, SAINT and LORD with full playable tracklists, a filterable catalogue and liner-note credits |
| `tour.html` | The Trinity Tour: 18 dates filterable by region, VIP packages, show info and FAQ |
| `videos.html` | Featured video, filterable archive and the *Behind the Veil* documentary series (opens an audio visualiser) |
| `shop.html` | 10 products, size selection, a cart drawer that persists between pages, shipping info and FAQ |
| `about.html` | Biography, stats, the three personas, timeline, press quotes, team and press-kit request |
| `news.html` | Featured story, filterable archive and a full-article reader |
| `contact.html` | Management, booking, press and sync contacts, a validated enquiry form and FAQ |
| `404.html` | Not-found page |

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Structure

- `assets/css/style.css`: all styles. Design tokens (colours, fonts, spacing) are at the top in `:root`.
- `assets/js/main.js`: the player, mini-player, filters, forms, cart, modals and scroll reveals.
- `assets/img/`: all artwork (portrait, album and single covers, merch) as SVG.
- `assets/fonts/`: self-hosted Anton, Oswald and Manrope (SIL Open Font License, see `OFL.txt`), so the site works offline.

## Before launch

- **Audio:** the player uses a small WebAudio synth to play 45-second stand-in previews. Swap in real audio files or streaming embeds.
- **Artwork:** the portrait and covers are illustrated SVGs. Replace them with real photography and artwork.
- **Videos:** video cards open an animated visualiser. Replace them with YouTube or Vimeo embeds.
- **Content:** the biography, collaborators, press quotes, publications, emails, prices and tour dates are all placeholder content. Real venue and festival names are used only as examples.
- **Links:** streaming and social links point to each platform's home page. Point them at the artist's profiles. Ticket buttons link to in-page anchors.
- **Forms and checkout:** the forms validate in the browser only, and checkout shows a notice. Connect them to a form service, mailing-list provider and store backend.
