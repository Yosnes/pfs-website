(function () {
  'use strict';

  function extension(file) {
    return (file?.name || '').split('.').pop().toLowerCase();
  }

  async function readPdf(file) {
    if (!window.pdfjsLib) throw new Error('PDF_READER_UNAVAILABLE');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
    const loadingTask = window.pdfjsLib.getDocument({ data: await file.arrayBuffer() });
    const pdf = await loadingTask.promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const line = content.items.map((item) => item.str).join(' ');
      if (line.trim()) pages.push(line.trim());
    }

    return pages.join('\n\n');
  }

  async function readDocx(file) {
    if (!window.mammoth) throw new Error('WORD_READER_UNAVAILABLE');
    const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return result.value || '';
  }

  async function extractFileText(file) {
    const type = extension(file);
    if (type === 'txt') return file.text();
    if (type === 'pdf') return readPdf(file);
    if (type === 'docx') return readDocx(file);
    throw new Error('UNSUPPORTED_FILE');
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function anonymize(text, identity = {}) {
    let clean = String(text || '')
      .replace(/\u0000/g, ' ')
      .replace(/\r\n?/g, '\n')
      .replace(/[\t ]+/g, ' ')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();

    const redactions = { name: 0, email: 0, phone: 0, url: 0, address: 0, labeled: 0 };
    const replace = (pattern, replacement, type) => {
      clean = clean.replace(pattern, () => {
        redactions[type] += 1;
        return replacement;
      });
    };

    const suppliedEmail = String(identity.email || '').trim();
    if (suppliedEmail) replace(new RegExp(escapeRegExp(suppliedEmail), 'gi'), '[EMAIL REMOVED]', 'email');
    replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL REMOVED]', 'email');

    const fullName = String(identity.name || '').trim();
    if (fullName) {
      const nameParts = [...new Set(fullName.split(/\s+/).filter((part) => part.length > 2))];
      replace(new RegExp(`\\b${escapeRegExp(fullName)}\\b`, 'gi'), '[NAME REMOVED]', 'name');
      nameParts.forEach((part) => replace(new RegExp(`\\b${escapeRegExp(part)}\\b`, 'gi'), '[NAME REMOVED]', 'name'));
    }
    replace(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s])\d{3}[-.\s]\d{4}\b/g, '[PHONE REMOVED]', 'phone');
    replace(/\b(?:https?:\/\/|www\.)\S+|\b(?:linkedin\.com|github\.com)\/\S+/gi, '[URL REMOVED]', 'url');
    replace(/@[A-Z0-9_]{2,30}\b/gi, '[HANDLE REMOVED]', 'url');
    replace(/\b\d{1,6}\s+(?:[A-Z0-9.'-]+\s+){1,6}(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct|way|parkway|pkwy)(?:\s+(?:apt|suite|unit|#)\s*[A-Z0-9-]+)?\b/gi, '[ADDRESS REMOVED]', 'address');
    replace(/^\s*(?:name|email|e-mail|phone|mobile|address|location)\s*:\s*.+$/gim, '[PERSONAL DETAIL REMOVED]', 'labeled');

    const lines = clean.split('\n').map((line, index) => {
      if (index > 12) return line;
      if (/^\s*[A-Za-z .'-]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\s*$/.test(line)) {
        redactions.address += 1;
        return '[LOCATION REMOVED]';
      }
      return line;
    });

    clean = lines.join('\n').replace(/(?:\[\w+ REMOVED\]\s*){2,}/g, '$&').trim();
    return {
      text: clean,
      redactions,
      totalRedactions: Object.values(redactions).reduce((total, count) => total + count, 0),
    };
  }

  window.PFSResume = { extractFileText, anonymize };
}());
