# Setup checklist (one-time)

## GitHub
- [ ] Daniel forks `baiqema/SIMRS-UEU` to `danielhappyg/SIMRS-UEU` (GitHub → Fork).
- [ ] Ema confirms she reviews and merges PRs into `main`.

## AI Studio sync rules (Ema)
- [ ] Before every AI Studio session: Settings → GitHub tab → Pull, and check it says "In Sync".
- [ ] Never choose "Force push" once the backend PRs are merged.
- [ ] One-time test, done together:
  1. Daniel pushes branch `sync-test` with a harmless change (add a comment line to `README.md`) and merges it into `main` through a PR.
  2. Ema pulls in AI Studio and confirms the comment appears.
  3. Ema makes a harmless edit in AI Studio and pushes; Daniel confirms the comment from step 1 is still there.
  4. If step 3 removed the comment, STOP and tell Daniel before any backend PR is merged.

## Supabase (Daniel)
- [ ] Create project `simrs-ueu-dev` (used only by automated tests).
- [ ] Create project `simrs-ueu-demo` (used by the Vercel demo).
- [ ] In BOTH projects: Authentication → Sign In / Providers → Email: disable "Allow new users to sign up" and disable "Confirm email".
- [ ] Note for each project: Project URL, anon (publishable) key, service-role key, database password. Store them in a password manager, never in the repo.

## Vercel (Daniel)
- [ ] Import `danielhappyg/SIMRS-UEU` into Daniel's Vercel account (framework: Vite).
- [ ] Leave environment variables empty for now; the first deploy runs in local mode.
