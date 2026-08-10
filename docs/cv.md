# CV download

Place the current PDF in `public/cv/` with this exact filename:

`Vigano_Gabriele_CV.pdf`

The dedicated CV page embeds it and serves it at `/cv/Vigano_Gabriele_CV.pdf`.
The path lives in `profile.cvPath` (`src/data/profile.ts`); change it there if
the filename ever does.

This note used to sit in `public/cv/README.md`, which meant it was published at
`https://www.viganogabriele.com/cv/README.md`. Everything under `public/` is
copied into the deploy verbatim, so notes for maintainers belong here instead.
