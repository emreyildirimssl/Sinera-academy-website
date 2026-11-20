# sinerasaleslab.academy

Static site for Sinera Sales Lab Academy (Kurucu Firma Programı, v1).

- `index.html`, `gizlilik/index.html`: generated from the Claude Design canvas by `build.py` (change the design, then rebuild; do not hand-edit).
- `assets/app.js`: runtime for the report carousel, sample case and application form.
- `assets/logic.js`: generated component logic and region templates.
- The form posts to Supabase (project SSYE, eu-west-2) table `public.site_applications` with the publishable key; anon can only insert.
- Hosted on Vercel; pushes to `main` deploy to production.
