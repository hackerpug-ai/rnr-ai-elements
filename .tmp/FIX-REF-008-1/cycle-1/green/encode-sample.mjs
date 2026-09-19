// Green evidence: the exact call form REF-009's assembly will use, against
// the real installed qrcode package. Run: node encode-sample.mjs
import QRCode from 'qrcode';

const svg = await QRCode.toString('ai-elements-example/conversation', { type: 'svg' });
process.stdout.write(`prefix=[${svg.slice(0, 80)}] length=${svg.length}\n`);
