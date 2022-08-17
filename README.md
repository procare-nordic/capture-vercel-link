
### Usage

```yml
...
...
jobs:
  capture_vercel_preview_url:
    name: Capture Vercel preview URL
    runs-on: "ubuntu-latest"
    steps:
      - uses: procare-nordic/capture-vercel-link@main
        id: vercel_preview_url
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          preview_url_regexp: "\\[Visit Preview\\]\\((.*?)\\)"
          PAT: ${{ secrets.PAT }}

        - name: Run CI Tests
          if: ${{  steps.vercel_preview_url.outputs.vercel_preview_url  }} != ""
          uses: xxxx
          env:
              URL: ${{  steps.vercel_preview_url.outputs.vercel_preview_url  }}
...
...
```