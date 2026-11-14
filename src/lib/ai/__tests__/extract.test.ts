/** Run: npx tsx src/lib/ai/__tests__/extract.test.ts */
import assert from 'node:assert/strict';
import { deflateRawSync } from 'zlib';
import { extractText, ExtractError, parseCsv, toClaimRecords, validateClaimRecord } from '../extract';

/** Minimal single-entry ZIP builder (deflate), enough to mock a .docx. */
function zip(name: string, content: string): Buffer {
  const data = deflateRawSync(Buffer.from(content, 'utf8'));
  const nameBuf = Buffer.from(name);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(Buffer.byteLength(content), 22);
  local.writeUInt16LE(nameBuf.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(Buffer.byteLength(content), 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt32LE(0, 42);
  const cdOffset = local.length + nameBuf.length + data.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(central.length + nameBuf.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  return Buffer.concat([local, nameBuf, data, central, nameBuf, eocd]);
}

async function main() {
  const b = (s: string) => Buffer.from(s, 'utf8');

  const txt = await extractText(b('Line one\r\nLine two\n\n\n\nEnd'), 'ad.txt');
  assert.equal(txt.text, 'Line one\nLine two\n\nEnd');
  assert.equal(txt.method, 'plain');
  assert.equal(txt.chars, txt.text.length);

  const md = await extractText(b('# Title\n\n- 20% faster'), 'ad.MD');
  assert.equal(md.text, '# Title\n\n- 20% faster');
  assert.equal(md.mime, 'text/markdown');

  const json = await extractText(b('{"headline":"Fast & safe","body":["Line A",{"cta":"Buy now"}],"n":3}'), 'ad.json');
  assert.equal(json.text, 'Fast & safe\nLine A\nBuy now');

  const html = await extractText(
    b('<html><style>p{}</style><script>x()</script><h1>Hello &amp; welcome</h1><p>Try it<br>today</p></html>'),
    'ad.html'
  );
  assert.equal(html.text, 'Hello & welcome\nTry it\ntoday');

  const docXml =
    '<w:document><w:body><w:p><w:r><w:t>Clinically </w:t></w:r><w:r><w:t xml:space="preserve">proven &lt;fast&gt;</w:t></w:r></w:p>' +
    '<w:p><w:r><w:t>Second</w:t><w:tab/><w:t>para</w:t></w:r></w:p></w:body></w:document>';
  const docx = await extractText(zip('word/document.xml', docXml), 'ad.docx');
  assert.equal(docx.text, 'Clinically proven <fast>\nSecond\tpara');
  assert.equal(docx.method, 'docx');

  await assert.rejects(extractText(b('x'), 'ad.exe'), (e: ExtractError) => e.status === 400);
  await assert.rejects(extractText(b('   \n'), 'ad.txt'), (e: ExtractError) => e.status === 422);
  await assert.rejects(extractText(b('%PDF-1.7 /Type /Page'), 'a.pdf', ''), (e: ExtractError) => e.status === 503);

  // CSV claims: quoted commas, escaped quotes, embedded newline, alias headers
  const csv = 'Claim,Brand,Type,Channels,Source name,DOI,Excerpt,Expiry\n' +
    '"Up to 2x faster, in lab tests",Apex,performance,social;email,Lab report,10.1000/xyz,"He said ""fast""\nok",2027-01-31\n' +
    ',Apex,performance,,,,,\n' +
    'Safe,Apex,magic,,,,,\n' +
    'Ok,Apex,efficacy,,,,,not-a-date\n';
  assert.equal(parseCsv(csv).length, 5);
  const recs = toClaimRecords(csv);
  const results = recs.map(validateClaimRecord);
  assert.ok(results[0].ok);
  if (results[0].ok) {
    assert.equal(results[0].row.claimText, 'Up to 2x faster, in lab tests');
    assert.deepEqual(results[0].row.channels, ['social', 'email']);
    assert.equal(results[0].row.reference, '10.1000/xyz');
    assert.equal(results[0].row.excerpt, 'He said "fast"\nok');
    assert.equal(results[0].row.expiresAt, '2027-01-31T00:00:00.000Z');
  }
  assert.deepEqual(results.slice(1).map(r => r.ok), [false, false, false]);

  const fromJson = toClaimRecords([{ claimText: 'Vegan', category: 'sourcing', channels: ['web'] }]).map(validateClaimRecord);
  assert.ok(fromJson[0].ok);

  console.log('extract tests passed');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
