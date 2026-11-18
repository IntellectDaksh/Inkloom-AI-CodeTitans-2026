import assert from 'node:assert';
import { deflateSync } from 'node:zlib';
import { pdfTextLayer } from '../src/lib/ai/extract';

// A PDF whose page content uses plain literal strings is read locally (no OCR call).
const content = Buffer.from(
  'BT /F1 12 Tf 72 720 Td (Our protein shake helps recovery after training.) Tj T* (Trusted by athletes across India since 2019 and loved by coaches.) Tj T* ' +
  '(Clinically studied ingredients with no added sugar in every single scoop we make.) Tj ET'
);
const z = deflateSync(content);
const pdf = Buffer.concat([
  Buffer.from('%PDF-1.4\n1 0 obj << /Type /Page >> endobj\n4 0 obj << /Length ' + z.length + ' /Filter /FlateDecode >>\nstream\n', 'latin1'),
  z,
  Buffer.from('\nendstream\nendobj\n%%EOF', 'latin1'),
]);
const text = pdfTextLayer(pdf);
assert(text && text.includes('Trusted by athletes'), 'text layer not read: ' + text);

// CID-font PDFs are left to OCR.
assert.equal(pdfTextLayer(Buffer.from('%PDF-1.7 /Identity-H stream\nBT <0041> Tj ET\nendstream')), null);
console.log('pdf text tests passed');
