# _deprecated/

Same idea as `backend/_deprecated/` — moved here, not deleted.

- `admin/AdminChat.js.deprecated` — never imported by `App.js`, so it was
  unreachable. It also read its auth token from `localStorage.getItem('adminToken')`,
  a key nothing in this app ever sets (login only ever writes `'token'`), so
  every REST call it made was already broken independent of being unrouted.
  `ChatMonitor.js` (overlay in SuperDashboard/Dashboard) and `MessagesPage.js`
  (routed under every department's `/admin/{slug}/chat`) are the live,
  working chat-admin surfaces — if a fourth one is ever needed, build on
  those two, not this file.
- `pages/StaffChat.js.deprecated` — never imported/routed anywhere either.
