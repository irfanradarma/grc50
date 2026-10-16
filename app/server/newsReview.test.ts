import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessNews,canonicalNewsUrl} from '../shared/newsReview.js';
import {workspaceTemplate} from '../shared/workspaceTemplate.js';
import {parseNews} from './news.js';
const t=workspaceTemplate(),goals=t.objectives.map(o=>({...o,id:o.key})),risks=t.risks.map(r=>({...r,id:r.key,objectiveId:r.objectiveKey}));
const now=Date.parse('2026-10-11T12:00:00Z');
const cases:Array<[string,string,string?]>=[
 ['Banjir Semarang menghambat pengiriman logistik','Potential impact'],
 ['Waspada banjir rob pesisir utara Jateng','Potential impact'],
 ['Waspada Banjir Rob Pesisir Utara Jateng Rabu 7 Oktober 2026 Mulai Dini Hari','Context only'],
 ['Pramono Ungkap Alasan Jakarta Butuh Jawa Barat untuk Tangani Banjir','Context only'],
 ['Kumpulan Berita banjir Semarang','Low relevance'],
 ['Pelabuhan Makassar ditutup, kiriman tertahan','Potential impact'],
 ['Gangguan cloud pusat data menyebabkan outage','Potential impact'],
 ['Kebocoran data pelanggan penyedia logistik','Potential impact'],
 ['Kenaikan harga BBM nasional menekan biaya armada','Potential impact'],
 ['ESDM sebut harga BBM subsidi tak naik untuk kendalikan inflasi','Context only'],
 ['Harga BBM di Afrika Selatan naik - ANTARA News Makassar','Low relevance'],
 ['Banjir Nepal menghanyutkan rumah','Low relevance'],
 ['Banjir landa Padang, ini komentar legislator - ANTARA News Makassar','Low relevance'],
 ['Banjir Padang membuat jalan lumpuh','Low relevance'],
 ['Perusahaan logistik raih penghargaan','Context only'],
 ['Sabo dam untuk mitigasi banjir Semarang','Context only'],
 ['Transportasi logistik Semarang berkembang','Context only'],
 ['Biomassa sawit terkendala teknologi','Low relevance'],
 ['Artis menggelar pesta ulang tahun','Low relevance'],
 ['Banjir Semarang menghambat logistik','Context only','2026-09-01'],
 ['Banjir Semarang menghambat logistik','Context only','2027-01-01'],
 ['Logistik Semarang raih award 2024','Context only'],
 ['Teknologi baru diumumkan perusahaan','Low relevance'],
];
test('context screening benchmark rejects geographic, promotional and stale false positives',()=>{
 for(const [title,expected,publishedAt] of cases){const item={id:'fixture',kind:'news',status:'Information',title,details:'',publishedAt:publishedAt||'2026-10-11',observedAt:'2026-10-11',objectiveId:'service'};assert.equal(assessNews(item,t.profile,goals,risks,now).level,expected,title);}
 const cost=assessNews({id:'cost',kind:'news',status:'Information',title:'Kenaikan harga BBM nasional',details:'Biaya armada meningkat',publishedAt:'2026-10-11',observedAt:'2026-10-11',objectiveId:'service'},t.profile,goals,risks,now);assert.equal(cost.riskId,undefined,'Cost exposure must not be forced onto the route or cloud risk');
});
test('article identity preserves meaningful query fields and rejects non-feed pages',()=>{
 assert.equal(canonicalNewsUrl('https://example.com/story?id=42&utm_source=x#comments'),'https://example.com/story?id=42');
 assert.throws(()=>parseNews('<html><body>Access denied</body></html>','rss'),/RSS or Atom/);
 assert.deepEqual(parseNews('<rss><channel><title>Empty</title></channel></rss>','rss'),[]);
});
