// Force Google Docs to render accessible HTML DOM for full extension typing compatibility
(function initDocsForceHtml() {
  try {
    (window as unknown as { _docs_force_html_by_ext?: string })._docs_force_html_by_ext = "fidel-extension";
    document.documentElement.setAttribute('data-docs-force-html', 'true');
  } catch {
    // Ignore isolated world restrictions
  }
})();
