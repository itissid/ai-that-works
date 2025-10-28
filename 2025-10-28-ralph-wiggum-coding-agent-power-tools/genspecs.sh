cat genspecs.md | claude -p \
    --dangerously-skip-permissions \
    --output-format=stream-json \
    --verbose \
    | npx repomirror visualize
