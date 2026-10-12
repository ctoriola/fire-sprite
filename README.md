# Lord,Saint,Sinner — landing page

The single-page official site for Lord,Saint,Sinner. It's static HTML, CSS and JavaScript with no build step and no dependencies.

The full multi-page site (music, tour, videos, shop, about, news and contact pages) lives on the `claude/fervent-sagan-id1w8f` branch, in `lord-saint-sinner/`.

## What's on the page

Every link stays on the page. The nav jumps to sections:

| Nav | Section |
| --- | --- |
| Logo | Hero with a playable lead single, three feature cards and a mailing-list sign-up |
| Music | *SINNER* with a playable tracklist and streaming links, then the LORD / SAINT / SINNER trilogy |
| Tour | All Trinity Tour dates, filterable by region |
| Videos | Three video cards that open an audio visualiser |
| Merch | Four products marked "Coming soon", with a "Get notified" button to the mailing list |
| News | Three stories that open in a reader |
| Contact | Footer with socials, streaming links and contact emails |

`404.html` is the not-found page. Vercel serves it automatically for any missing URL. It uses absolute `/assets/` paths so it works at any depth.

## Deploying on Vercel

1. Import this repository as a new project. Framework preset: **Other**. Leave the build command and output directory empty, and leave the root directory as `./`.
2. In **Settings → Git**, set **Production Branch** to `lord-saint-sinner-landing`, then redeploy.
3. In **Settings → Domains**, add the client's domain. It will serve the production branch.

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Before launch

- **Tickets:** "Tickets" buttons jump to the tour section. Replace them with the real ticket URL for each date. "Join waitlist" and "Get presale" go to the mailing list.
- **Audio:** the player uses a WebAudio synth to play 45-second stand-in previews. Swap in real audio or streaming embeds.
- **Artwork:** the portrait and covers are illustrated SVGs. Replace them with real photography and artwork.
- **Videos:** video cards open an animated visualiser. Replace them with YouTube or Vimeo embeds.
- **Content:** the biography, collaborators, press quotes, publications, emails, prices and tour dates are placeholder content. Real venue and festival names are used only as examples.
- **Links:** streaming and social links point to each platform's home page. Point them at the artist's profiles.
- **Mailing list:** the sign-up forms validate in the browser only. Connect them to a mailing-list provider such as Mailchimp, Kit or Beehiiv.

Fonts (Anton, Oswald, Manrope) are self-hosted under the SIL Open Font License. See `assets/fonts/OFL.txt`.
