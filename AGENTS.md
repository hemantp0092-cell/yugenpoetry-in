<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Owner access: first account to call `claim_owner()` becomes the sole admin; all writes gated by `has_role(auth.uid(),'admin')` RLS — keeps a single-owner CMS without public registration.
- Admin pages live at `/admin/*` with `ssr: false` and a client `AdminShell` guard; data security comes from RLS, not the guard.
- Media bucket is private (public buckets blocked); uploads store 10-year signed URLs in rows.
