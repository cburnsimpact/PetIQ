import { Router } from 'express'
import path from 'path'
import fs from 'fs/promises'
import { marked } from 'marked'

// Create a lightweight router mounted at "/docs" in index.ts
export const publicDocsRouter = Router()

const DOCS_DIR = process.env.HR_DOCS_DIR || path.resolve(process.cwd(), 'docs')

function isSafeFileName(name: string): boolean {
  // Prevent path traversal and only allow simple filenames
  return /^[A-Za-z0-9_. -]+$/.test(name) && !name.includes('..') && !name.includes('/') && !name.includes('\\')
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtmlPage(title: string, bodyHtml: string): string {
  const safeTitle = escapeHtml(title)
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle} – PetIQ HR</title>
    <style>
      :root { color-scheme: light dark; }
      html, body { margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.6; }
      .container { max-width: 860px; margin: 0 auto; padding: 24px; }
      .header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .header a { color: inherit; text-decoration: none; }
      .doc { background: rgba(0,0,0,0.02); padding: 24px; border-radius: 12px; }
      h1, h2, h3 { line-height: 1.25; }
      pre { background: rgba(0,0,0,0.06); padding: 12px; border-radius: 8px; overflow: auto; }
      code { font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; }
      a { color: #0b6cff; }
      .actions { margin-top: 12px; }
      .actions a { font-size: 14px; }
      @media (prefers-color-scheme: dark) {
        .doc { background: rgba(255,255,255,0.04); }
        pre { background: rgba(255,255,255,0.06); }
      }
      @media print {
        .actions, .header .logo { display: none; }
        .doc { background: transparent; padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <a class="logo" href="/"><img src="/petiqlogo.png" alt="PetIQ" height="28"></a>
        <a href="/">PetIQ HR Center</a>
        <span aria-hidden="true">›</span>
        <strong>${safeTitle}</strong>
      </div>
      <div class="doc">
        ${bodyHtml}
      </div>
      <div class="actions">
        <a href="javascript:window.print()">Print</a> ·
        <a id="downloadLink" href="#">Download original</a>
      </div>
    </div>
    <script>
      // Wire up download link to the raw file path
      (function(){
        var params = new URLSearchParams(window.location.search);
        var name = params.get('name');
        if (!name) {
          // fall back to last segment
          var parts = window.location.pathname.split('/');
          name = parts[parts.length - 1];
        }
        var a = document.getElementById('downloadLink');
        if (a && name) a.href = '/docs/' + encodeURIComponent(name);
      })();
    </script>
  </body>
</html>`
}

publicDocsRouter.get('/view/:name', async (req, res) => {
  try {
    const name = String(req.params.name || '')
    if (!isSafeFileName(name)) {
      res.status(400).send('Invalid file name')
      return
    }

    const fullPath = path.join(DOCS_DIR, name)
    const content = await fs.readFile(fullPath, 'utf8')

    const lower = name.toLowerCase()
    let bodyHtml = ''
    if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
      bodyHtml = await marked.parse(content)
    } else {
      // Treat as plain text; convert double newlines to paragraphs, single to <br>
      const escaped = escapeHtml(content)
      const paragraphs = escaped
        .split(/\n\n+/)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`) 
        .join('\n')
      bodyHtml = paragraphs
    }

    // Allow a query param title override; otherwise derive from file name without extension
    const title = String(req.query.title || name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
    const html = buildHtmlPage(title, bodyHtml)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err: any) {
    res.status(404).send('Document not found')
  }
})


