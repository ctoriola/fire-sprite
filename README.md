# FireSprite Ent — website

Static, dependency-free website for FireSprite Ent, an independent music company (label, publishing, management, live, studio, sync).

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: hero with an interactive phone player, roster, featured release, services, shows, journal, newsletter |
| `about.html` | Story, values, timeline, leadership team |
| `artists.html` | Roster with genre filter and artist spotlight |
| `releases.html` | Latest release tracklist, filterable catalogue, playlists |
| `services.html` | Six services, demo-to-debut process, FAQ |
| `events.html` | Filterable tour dates, Heatwave Festival, live formats |
| `news.html` | Journal with category filter and press kit |
| `contact.html` | Enquiry / demo form, studios, careers |
| `404.html` | Not-found page |

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## Notes

- Styles live in `assets/css/styles.css` and behaviour in `assets/js/main.js`.
- The player uses a small WebAudio synth as stand-in audio. Swap in real audio files when they're available.
- Artist portraits and cover art are generated with CSS/SVG. Replace them with real photography and artwork.
- Artists, releases, dates, addresses, emails and phone numbers are placeholder content.
- The forms validate in the browser only. Connect them to a backend or form service before launch.
