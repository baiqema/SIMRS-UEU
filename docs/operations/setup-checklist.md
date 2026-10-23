# Setup checklist (one-time)

## GitHub and AI Studio (Ema and Daniel)
- [ ] Ema reviews and merges PRs into `main` of `baiqema/SIMRS-UEU`.
- [ ] Before every AI Studio session: Settings → GitHub tab → Pull, and check it says "In Sync".
- [ ] Never choose "Force push" in AI Studio.
- [ ] One-time sync test, done together:
  1. Daniel merges a harmless change (a comment line in `README.md`) into `main` through a PR.
  2. Ema pulls in AI Studio and confirms the comment appears.
  3. Ema makes a harmless edit in AI Studio and pushes; Daniel confirms the comment from step 1 is still there.
  4. If step 3 removed the comment, STOP: AI Studio is overwriting GitHub, and the backend files (`server/`, `db/`, `src/data-layer/`) are at risk.

## Campus GitLab (IT unit)
- [ ] Mirror or push `main` to https://gitlab.com/esaunggul/simrs-rmik.
- [ ] Decide which repository is the source of truth after the move, so AI Studio, GitHub and GitLab do not drift apart.
- [ ] Install following [campus-deployment.md](campus-deployment.md): database and roles, `.env`, start, `bootstrap` (without `--demo`), HTTPS, daily backups.
