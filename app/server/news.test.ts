import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseNews,publicAddress} from './news.js';
import {canonicalNewsUrl} from '../shared/newsUrl.js';

test('news feeds retain article identity and readable source text',()=>{
 assert.equal(canonicalNewsUrl('https://example.com/story?id=42&utm_source=x#comments'),'https://example.com/story?id=42');
 const article=parseNews('<rss><channel><item><title>Trade &amp; investment</title><link>https://example.com/story?id=42&amp;utm_source=x</link><description>&lt;a&gt;Market outlook&lt;/a&gt;&amp;nbsp;Indonesia</description></item></channel></rss>','rss')[0];
 assert.equal(article.title,'Trade & investment');assert.equal(article.details,'Market outlook Indonesia');assert.equal(article.url,'https://example.com/story?id=42');
 assert.equal(parseNews('<feed><entry><title>Event</title><link href="https://example.com/event"/></entry></feed>','rss')[0].url,'https://example.com/event');
 assert.deepEqual(parseNews('<rss><channel><title>Empty</title></channel></rss>','rss'),[]);
});

test('news capture rejects private addresses, entity expansion and non-feed responses',()=>{
 for(const address of ['127.0.0.1','10.20.30.40','169.254.169.254','192.168.0.1','::ffff:127.0.0.1'])assert.equal(publicAddress(address),false,address);
 assert.equal(publicAddress('8.8.8.8'),true);
 assert.equal(parseNews('{"articles":[{"title":"Event","url":"javascript:alert(1)"}]}','json')[0].url,'');
 assert.throws(()=>parseNews('<!DOCTYPE rss><rss/>','rss'));
 assert.throws(()=>parseNews('<html><body>Access denied</body></html>','rss'),/RSS or Atom/);
});
