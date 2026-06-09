# Editing Safety Workflow

1. Run `npm run backup` before touching critical platform files.
2. Apply only small, staged edits; avoid large regex rewrites.
3. After each stage, run `npm run build`.
4. If build fails, restore from latest file in `backups/` and retry with smaller patch scope.
5. Keep one atomic commit per verified stage.
