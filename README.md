# TracMap Roadmap Tool

A dashboard to show project health forked from [p-jackson](https://github.com/p-jackson)'s [grizzly-pass](https://github.com/p-jackson/grizzly-pass) project. (I'm sorry Phil. I'm so, so sorry.)

If you drag drop a correctly formatted json file onto the page (you can find one
[here](./example/example.json)) then it will display those projects. Valid project
fields are:

- title (required, string)
- person (required, string)
- date (required, string in YYYY-MM-DD format)
- progress (required, number representing a percentage)
- health (required, one of "ontrack", "atrisk", "validation", "onhold", "blocked", or "ready")
- tags (optional, array of strings to be used as free-form tags on projects)
- tentative (optional, boolean)

## Staging Server

You can see a recent build at: [https://tracmap-roadmap.surge.sh/](tracmap-roadmap.surge.sh)
