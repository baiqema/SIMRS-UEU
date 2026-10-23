# GitHub → GitLab sync

GitHub (`baiqema/SIMRS-UEU`) is where the code is edited, because Google AI Studio only syncs with GitHub.
The campus copy on GitLab (`gitlab.com/esaunggul/simrs-rmik`) is updated automatically by
`.github/workflows/sync-gitlab.yml` every time `main` (or a tag) changes on GitHub. The campus server installs from GitLab.

## One-time setup

1. **GitLab token.** In GitLab, open *simrs-rmik → Settings → Access tokens* and add a project access token:
   role **Maintainer** (needed to push to the protected `main`), scope **write_repository**, an expiry date (GitLab allows up to one year).
   If project access tokens are not available, a personal access token with `write_repository` of an account that can push to `main` works too.
2. **GitHub secret.** In GitHub, open *baiqema/SIMRS-UEU → Settings → Secrets and variables → Actions → New repository secret*,
   name `GITLAB_TOKEN`, value = the token. This needs admin rights on the GitHub repository.
3. **Test it.** In GitHub, *Actions → Sync to GitLab → Run workflow*. GitLab `main` should then show the same latest commit as GitHub.

Without the secret, the workflow only prints a warning and does nothing.

## Rules

- Do not commit on GitLab directly. The sync never force-pushes, so a GitLab-only commit makes the next sync fail (shown as a red run in GitHub *Actions*).
  If that happens, move the change to GitHub, then reset GitLab `main` to GitHub's `main` once.
- When the token expires, the sync fails. Create a new token and update the `GITLAB_TOKEN` secret.
- Issues and pull request discussions stay on GitHub; only the code and its history are copied.
