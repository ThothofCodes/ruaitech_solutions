# _deprecated/

Files moved here during the Continuity Audit fix pass (see `/CHANGELOG_PHASE9.md`
at the project root). They are kept, not deleted, in case anything in them is
still wanted — but none of them are referenced by `server.js` or any route
that's actually mounted, so nothing currently depends on them.

- `routes/adminRevenue.js.deprecated` — never mounted in `server.js`. Its
  `/stats` and `/revenue` endpoints are genuinely live today via
  `routes/admin.js`, which imports the same controller functions. Two files
  owning the same two endpoints was the actual problem; this is the one that
  lost.
