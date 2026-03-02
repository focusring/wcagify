export const pdfStyles = `
@page {
  margin: 20mm;
  size: A4;
  @top-center {
    content: "WCAGify";
    font-size: 9pt;
    color: #6b7280;
  }
  @bottom-center {
    content: counter(page);
    font-size: 9pt;
    color: #6b7280;
  }
}
@page :first {
  @top-center { content: none; }
  @bottom-center { content: none; }
}

body {
  font-family: "Liberation Sans", "Noto Sans", Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #111827;
  margin: 0;
}

.cover-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  break-after: always;
}
.cover-page h1 {
  font-size: 22pt;
  font-weight: 700;
  line-height: 1.2;
  color: #111827;
}
.cover-page dl { margin-top: 3em; }
.cover-page dt {
  font-size: 11pt;
  color: #6b7280;
  margin-top: 1.5em;
}
.cover-page dd {
  font-size: 14pt;
  font-weight: 500;
  color: #111827;
  margin: 0.25em 0 0;
}

h1 { font-size: 22pt; line-height: 1.2; color: #111827; }
h2 { font-size: 16pt; line-height: 1.3; color: #111827; break-after: avoid; margin-top: 1.5em; }
h3 { font-size: 13pt; line-height: 1.3; color: #111827; break-after: avoid; }
h4 { font-size: 11pt; line-height: 1.4; color: #111827; break-after: avoid; }

section { break-before: page; }
section:first-of-type { break-before: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
  break-inside: avoid;
  margin: 1em 0;
}
th, td {
  border: 1px solid #d1d5db;
  padding: 6px 10px;
  text-align: left;
}
th {
  background: #f3f4f6;
  font-weight: 600;
  color: #111827;
}
caption {
  caption-side: top;
  font-weight: 600;
  text-align: left;
  margin-bottom: 0.5em;
  font-size: 10pt;
}

dl { margin: 0; }
dt { color: #6b7280; font-size: 10pt; }
dd { margin: 0.2em 0 0; color: #111827; }

ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
li { margin: 0.3em 0; }

article { break-inside: avoid; margin-top: 1.5em; }
article .meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3em 1.5em;
  font-size: 10pt;
  color: #6b7280;
  margin-top: 0.3em;
}

a { color: #047857; text-decoration: none; }
a[href^="http"]::after {
  content: " (" attr(href) ")";
  font-size: 9pt;
  color: #6b7280;
  word-break: break-all;
}

.prose { margin-top: 0.75em; }
.prose p { margin: 0.5em 0; }
.prose code {
  font-family: monospace;
  font-size: 10pt;
  background: #f3f4f6;
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
.prose pre {
  background: #f3f4f6;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 9pt;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5em 2em;
  font-size: 10pt;
  margin-top: 1.5em;
}

nav h3 { font-size: 10pt; margin-top: 1em; }
nav ol { font-size: 10pt; margin: 0.25em 0; }
nav a { color: #047857; }
nav a::after { content: none !important; }
`
