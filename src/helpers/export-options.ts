import html2pdf from 'html2pdf.js';

export function downloadBlob(filename: string, mime: string, data: string | Uint8Array) {
	const blob = new Blob([data], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

// Build a full HTML document around your post
export function buildHtmlDoc(title: string, bodyInnerHtml: string) {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; line-height:1.6; padding:24px; }
  img, video { max-width:100%; height:auto; }
  h1,h2,h3,h4,h5,h6 { margin: 1.2em 0 .4em; }
  p,blockquote,ul,ol,code,pre { margin: .6em 0; }
  blockquote { border-left: 4px solid #ddd; padding-left: 12px; color: #555; }
  .meta { color:#666; font-size: 0.9rem; margin-bottom: 12px; }
  .tags { margin-top: 8px; }
  .tag { display:inline-block; padding:2px 8px; border:1px solid #ddd; border-radius:999px; font-size:.8rem; margin-right:6px; }
  .divider-solid { border-top: 2px solid #eee; margin: 16px 0; }
  .divider-dashed { border-top: 2px dashed #ddd; margin: 16px 0; }
</style>
</head>
<body>
${bodyInnerHtml}
</body></html>`;
}

export function contentToInnerHtml(content: any[]): string {
	return content
		.map((entry: any) => {
			const c = entry?.content || '';
			switch (entry?.type) {
				case 'header-1':
					return `<h1>${c}</h1>`;
				case 'header-2':
					return `<h2>${c}</h2>`;
				case 'header-3':
					return `<h3>${c}</h3>`;
				case 'header-4':
					return `<h4>${c}</h4>`;
				case 'header-5':
					return `<h5>${c}</h5>`;
				case 'header-6':
					return `<h6>${c}</h6>`;
				case 'image':
					return `<div>${c}</div>`;
				case 'video':
					return `<div>${c}</div>`;
				case 'paragraph':
					return `<p>${c}</p>`;
				case 'quote':
					return `<blockquote>${c}</blockquote>`;
				case 'code':
					return `<pre><code>${c}</code></pre>`;
				case 'unordered-list':
					return `<ul>${c}</ul>`;
				case 'ordered-list':
					return `<ol>${c}</ol>`;
				case 'divider-solid':
					return `<div class="divider-solid"></div>`;
				case 'divider-dashed':
					return `<div class="divider-dashed"></div>`;
				default:
					return `<pre>${escapeHtml(JSON.stringify(entry, null, 2))}</pre>`;
			}
		})
		.join('');
}

export function escapeHtml(s: string) {
	return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]!));
}

// Convert to Markdown (lightweight mapping)
export function contentToMarkdown(content: any[]): string {
	const htmlToText = (html: string) => {
		const div = document.createElement('div');
		div.innerHTML = html;
		return (div.textContent || div.innerText || '').trim();
	};

	return content
		.map((entry: any) => {
			const text = htmlToText(entry?.content || '');
			switch (entry?.type) {
				case 'header-1':
					return `# ${text}`;
				case 'header-2':
					return `## ${text}`;
				case 'header-3':
					return `### ${text}`;
				case 'header-4':
					return `#### ${text}`;
				case 'header-5':
					return `##### ${text}`;
				case 'header-6':
					return `###### ${text}`;
				case 'paragraph':
					return text;
				case 'quote':
					return text
						.split('\n')
						.map((l: string) => `> ${l}`)
						.join('\n');
				case 'code':
					return '```\n' + text + '\n```';
				case 'unordered-list': {
					// assume entry.content contains <li> items; extract and prefix with "- "
					const div = document.createElement('div');
					div.innerHTML = entry.content || '';
					const items = Array.from(div.querySelectorAll('li')).map((li) => `- ${li.textContent?.trim() || ''}`);
					return items.join('\n');
				}
				case 'ordered-list': {
					const div = document.createElement('div');
					div.innerHTML = entry.content || '';
					const items = Array.from(div.querySelectorAll('li')).map(
						(li, i) => `${i + 1}. ${li.textContent?.trim() || ''}`
					);
					return items.join('\n');
				}
				case 'image': {
					const div = document.createElement('div');
					div.innerHTML = entry.content || '';
					const img = div.querySelector('img');
					const alt = img?.getAttribute('alt') || '';
					const src = img?.getAttribute('src') || '';
					return src ? `![${alt}](${src})` : '';
				}
				case 'video': {
					const div = document.createElement('div');
					div.innerHTML = entry.content || '';
					const src = div.querySelector('source, iframe')?.getAttribute('src') || '';
					return src ? `[Video](${src})` : '';
				}
				case 'divider-solid':
				case 'divider-dashed':
					return '\n---\n';
				default:
					return '';
			}
		})
		.filter(Boolean)
		.join('\n\n');
}

export function htmlDocToPlainText(html: string) {
	const div = document.createElement('div');
	div.innerHTML = html;
	return (div.textContent || div.innerText || '').trim();
}

// Try PDF via html2pdf.js if available; else open print
export async function downloadPdfFromHtml(html: string, filename: string) {
	try {
		const wrapper = document.createElement('div');
		wrapper.innerHTML = html;
		await html2pdf()
			.from(wrapper)
			.set({
				filename,
				margin: 10,
				image: { type: 'jpeg', quality: 0.98 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
			})
			.save();
	} catch {
		// fallback: open printable window and let user Save as PDF
		const w = window.open('', '_blank');
		if (w) {
			w.document.open();
			w.document.write(html.replace('</body>', '<script>window.onload=()=>window.print()</script></body>'));
			w.document.close();
		} else {
			alert('Popup blocked. Enable popups to print/save PDF, or install html2pdf.js for direct download.');
		}
	}
}
