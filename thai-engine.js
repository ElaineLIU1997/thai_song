// Thai reading engine: splits Thai words into syllables, works out each
// syllable's tone from the spelling rules, and writes a learner romanization
// (Paiboon-style vowels, tone accents on the first vowel letter).
(function (root) {
  const MID = 'กจฎฏดตบปอ';
  const HIGH = 'ขฃฉฐถผฝศษสห';
  const SONOR = 'งญนมยรลว';
  const CONS = /[ก-ฮ]/;
  const ABOVE = 'ัิีึืุู็';
  const TONEMARK = '่้๊๋';
  const PRE = 'เแโใไ';
  const INIT = { ก:'g',ข:'k',ฃ:'k',ค:'k',ฅ:'k',ฆ:'k',ง:'ng',จ:'j',ฉ:'ch',ช:'ch',ซ:'s',ฌ:'ch',ญ:'y',ฎ:'d',ฏ:'dt',ฐ:'t',ฑ:'t',ฒ:'t',ณ:'n',ด:'d',ต:'dt',ถ:'t',ท:'t',ธ:'t',น:'n',บ:'b',ป:'bp',ผ:'p',ฝ:'f',พ:'p',ฟ:'f',ภ:'p',ม:'m',ย:'y',ร:'r',ล:'l',ว:'w',ศ:'s',ษ:'s',ส:'s',ห:'h',ฬ:'l',อ:'',ฮ:'h' };
  const FIN = { ก:'k',ข:'k',ค:'k',ฆ:'k',ง:'ng',จ:'t',ช:'t',ซ:'t',ฌ:'t',ญ:'n',ฎ:'t',ฏ:'t',ฐ:'t',ฑ:'t',ฒ:'t',ณ:'n',ด:'t',ต:'t',ถ:'t',ท:'t',ธ:'t',น:'n',บ:'p',ป:'p',พ:'p',ฟ:'p',ภ:'p',ม:'m',ย:'i',ร:'n',ล:'n',ว:'o',ศ:'t',ษ:'t',ส:'t',ฬ:'n' };
  const TRUE_CLUSTER = { 'กร':'gr','กล':'gl','กว':'gw','ขร':'kr','ขล':'kl','ขว':'kw','คร':'kr','คล':'kl','คว':'kw','ตร':'dtr','ปร':'bpr','ปล':'bpl','พร':'pr','พล':'pl','ผล':'pl','บร':'br','บล':'bl','ฟร':'fr','ฟล':'fl' };
  const SILENT_R = { 'ทร':'s','สร':'s','ศร':'s','ซร':'s','จร':'j' };

  const clsOf = c => MID.includes(c) ? 'mid' : HIGH.includes(c) ? 'high' : 'low';
  const TONES = ['mid', 'low', 'falling', 'high', 'rising'];
  const ACCENT = { mid: '', low: '̀', falling: '̂', high: '́', rising: '̌' };

  // Every way to read the initial consonant(s) at position q.
  function initials(w, q) {
    const c = w[q];
    if (!c || !CONS.test(c)) return [];
    const out = [{ len: 1, rom: INIT[c], cls: clsOf(c), parts: [[c, 'init']] }];
    const two = w.substr(q, 2), d = w[q + 1];
    if (d && CONS.test(d)) {
      if (TRUE_CLUSTER[two]) out.push({ len: 2, rom: TRUE_CLUSTER[two], cls: clsOf(c), parts: [[c, 'init'], [d, 'cluster']] });
      if (SILENT_R[two]) out.push({ len: 2, rom: SILENT_R[two], cls: clsOf(c), parts: [[c, 'init'], [d, 'silent']] });
      if (c === 'ห' && SONOR.includes(d)) out.push({ len: 2, rom: INIT[d], cls: 'high', parts: [[c, 'lead'], [d, 'init']] });
      if (two === 'อย') out.push({ len: 2, rom: 'y', cls: 'mid', parts: [[c, 'lead'], [d, 'init']] });
    }
    return out;
  }

  // Can the consonant at f close a syllable (and not start the next one)?
  function isFinal(w, f) {
    const c = w[f];
    if (!c || !FIN[c]) return false;
    const n = w[f + 1];
    if (n && (ABOVE.includes(n) || TONEMARK.includes(n) || 'าะำ'.includes(n))) return false;
    return true;
  }
  // A consonant + ์ (and an optional vowel before it) is silent.
  function silentTail(w, f) {
    if (CONS.test(w[f] || '') && w[f + 1] === '์') return 2;
    if (CONS.test(w[f] || '') && 'ิุ'.includes(w[f + 1] || '') && w[f + 2] === '์') return 3;
    return 0;
  }

  // Vowel readings: [vowel, long?, liveWithoutFinal?, cost]
  function vowelOptions(w, r, pv, ab) {
    const o = [];
    const s1 = w[r], s2 = w.substr(r, 2), s3 = w.substr(r, 3);
    const add = (len, v, long, needF, allowF, cost, special) => o.push({ len, v, long, needF, allowF, cost: cost || 0, special });
    if (!pv) {
      if (!ab) {
        if (s1 === 'ะ') add(1, 'a', false, false, false);
        if (s1 === 'า') add(1, 'aa', true, false, true);
        if (s1 === 'ำ') add(1, 'am', false, false, false, 0, 'live');
        if (s1 === 'อ') add(1, 'ɔɔ', true, false, true);
        if (s1 === 'ว') add(1, 'ua', true, true, true, 0.3);
        if (s2 === 'รร') { add(2, 'a', false, true, true); add(2, 'an', false, false, false, 0.2, 'live'); }
        add(0, 'o', false, true, true, 0.6);          // implicit o: คน kon
        add(0, 'a', false, false, false, 1.2);        // implicit a: ส in สบาย
      }
      if (ab === 'ั') {
        if (s1 === 'ว') add(1, 'ua', true, false, true);
        if (s1 === 'ะ') add(1, 'a', false, false, false);
        add(0, 'a', false, true, true);
      }
      if (ab === 'ิ') add(0, 'i', false, false, true);
      if (ab === 'ี') add(0, 'ii', true, false, true);
      if (ab === 'ึ') add(0, 'ʉ', false, false, true);
      if (ab === 'ื') { if (s1 === 'อ') add(1, 'ʉʉ', true, false, true); add(0, 'ʉʉ', true, true, true); }
      if (ab === 'ุ') add(0, 'u', false, false, true);
      if (ab === 'ู') add(0, 'uu', true, false, true);
      if (ab === '็') add(0, 'ɔ', false, false, true, 0.5);
    } else if (pv === 'เ') {
      if (!ab) {
        if (s3 === 'าะ' || s2 === 'าะ') add(2, 'ɔ', false, false, false);
        if (s1 === 'า' && w[r + 1] !== 'ะ') add(1, 'ao', false, false, false, 0, 'live');
        if (s1 === 'ะ') add(1, 'e', false, false, false);
        if (s2 === 'อะ') add(2, 'ə', false, false, false);
        if (s1 === 'อ') add(1, 'əə', true, false, false);
        if (s1 === 'ย') add(1, 'əəi', true, false, false, 0, 'live');
        add(0, 'ee', true, false, true, 0.1);
      }
      if (ab === 'ี' && s1 === 'ย') { if (w[r + 1] === 'ะ') add(2, 'ia', false, false, false); add(1, 'ia', true, false, true); }
      if (ab === 'ื' && s1 === 'อ') add(1, 'ʉa', true, false, true);
      if (ab === 'ิ') add(0, 'əə', true, true, true);
      if (ab === '็') add(0, 'e', false, true, true);
    } else if (pv === 'แ') {
      if (!ab) { if (s1 === 'ะ') add(1, 'ɛ', false, false, false); add(0, 'ɛɛ', true, false, true); }
      if (ab === '็') add(0, 'ɛ', false, true, true);
    } else if (pv === 'โ') {
      if (!ab) { if (s1 === 'ะ') add(1, 'o', false, false, false); add(0, 'oo', true, false, true); }
    } else if (pv === 'ใ' || pv === 'ไ') {
      if (!ab) { if (s1 === 'ย') add(1, 'ai', false, false, false, 0, 'live'); add(0, 'ai', false, false, false, 0, 'live'); }
    }
    return o;
  }

  function toneOf(cls, live, long, mark) {
    if (mark === '่') return cls === 'low' ? 'falling' : 'low';
    if (mark === '้') return cls === 'low' ? 'high' : 'falling';
    if (mark === '๊') return 'high';
    if (mark === '๋') return 'rising';
    if (cls === 'mid') return live ? 'mid' : 'low';
    if (cls === 'high') return live ? 'rising' : 'low';
    return live ? 'mid' : long ? 'falling' : 'high';
  }

  function accent(rom, tone) {
    const m = ACCENT[tone];
    if (!m) return rom;
    const i = rom.search(/[aeiouʉɛɔə]/);
    if (i < 0) return rom;
    return (rom.slice(0, i + 1) + m + rom.slice(i + 1)).normalize('NFC');
  }

  // All syllable readings starting at p.
  function candidates(w, p) {
    const out = [];
    let q = p, pv = null;
    if (PRE.includes(w[q])) { pv = w[q]; q++; }
    for (const ini of initials(w, q)) {
      let r = q + ini.len, ab = null, tm = null;
      if (ABOVE.includes(w[r])) { ab = w[r]; r++; }
      if (TONEMARK.includes(w[r])) { tm = w[r]; r++; }
      for (const vo of vowelOptions(w, r, pv, ab)) {
        let e = r + vo.len;
        let tm2 = tm;
        if (!tm2 && TONEMARK.includes(w[e])) { tm2 = w[e]; e++; }
        const finals = [];
        if (vo.allowF && isFinal(w, e)) finals.push(e);
        if (!vo.needF) finals.push(-1);
        for (const f of finals) {
          let end = f >= 0 ? f + 1 : e;
          const fin = f >= 0 ? FIN[w[f]] : '';
          const st = silentTail(w, end);
          end += st;
          let v = vo.v;
          let finRom = fin;
          if (fin === 'o') finRom = /i$/.test(v) ? 'u' : 'o';
          if (fin === 'i' && /i$/.test(v)) finRom = '';
          const live = fin ? !'ktp'.includes(fin) : (vo.long || vo.special === 'live');
          const parts = [];
          if (pv) parts.push([pv, 'vowel']);
          parts.push(...ini.parts);
          for (let k = q + ini.len; k < (f >= 0 ? f : end - st); k++) parts.push([w[k], TONEMARK.includes(w[k]) ? 'tone' : 'vowel']);
          if (f >= 0) parts.push([w[f], 'final']);
          for (let k = end - st; k < end; k++) parts.push([w[k], 'silent']);
          out.push({
            end, cost: 1 + vo.cost, implicitA: vo.v === 'a' && vo.len === 0 && !ab && f < 0,
            syl: { thai: w.slice(p, end), parts, init: ini.rom, cls: ini.cls, lead: ini.parts[0][1] === 'lead',
                   vowel: v, long: vo.long, final: fin, finRom, live, mark: tm2, base: ini.rom + v + finRom }
          });
        }
      }
    }
    return out;
  }

  // Cheapest full reading of a Thai word (dynamic programming over positions).
  function syllables(w) {
    const n = w.length;
    const best = Array(n + 1).fill(null);
    best[0] = { cost: 0, path: [] };
    for (let p = 0; p < n; p++) {
      if (!best[p]) continue;
      let cands = candidates(w, p);
      if (!cands.length) cands = [{ end: p + 1, cost: 5, syl: { thai: w[p], parts: [[w[p], 'silent']], skip: true } }];
      for (const c of cands) {
        const cost = best[p].cost + c.cost;
        if (!best[c.end] || cost < best[c.end].cost) best[c.end] = { cost, path: best[p].path.concat([c]) };
      }
    }
    const path = (best[n] || { path: [] }).path;
    // Leading-consonant rule: after an implicit-a syllable on a mid/high
    // consonant, a single low sonorant initial reads with that class.
    path.forEach((c, i) => {
      const prev = path[i - 1];
      if (prev && prev.implicitA && prev.syl.cls !== 'low' && !c.syl.skip && c.syl.parts[0][1] === 'init' &&
          SONOR.includes(c.syl.parts[0][0]) && c.syl.cls === 'low') { c.syl.cls = prev.syl.cls; c.syl.led = true; }
    });
    return path.filter(c => !c.syl.skip).map(c => {
      const s = c.syl;
      s.tone = toneOf(s.cls, s.live, s.long, s.mark);
      s.rom = accent(s.base, s.tone);
      return s;
    });
  }

  function romanize(w) { return syllables(w).map(s => s.rom).join('-'); }

  // Split a line into words. Thai has no spaces, so use the browser's
  // dictionary-based segmenter when it exists.
  function words(line) {
    const out = [];
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const seg = new Intl.Segmenter('th', { granularity: 'word' });
      for (const s of seg.segment(line)) out.push({ text: s.segment, word: s.isWordLike });
    } else {
      line.split(/(\s+)/).forEach(t => t && out.push({ text: t, word: !/^\s+$/.test(t) }));
    }
    // ๆ repeats the word before it
    return out.reduce((acc, t) => {
      const s = t.text.trim();
      if (s === 'ๆ') { const prev = [...acc].reverse().find(x => x.word); if (prev) acc.push({ text: 'ๆ', word: true, repeat: prev.repeat || prev.text }); }
      else if (s.length > 1 && s.endsWith('ๆ')) { const base = s.replace(/\s*ๆ$/, ''); acc.push({ text: base, word: true }, { text: 'ๆ', word: true, repeat: base }); }
      else acc.push(t);
      return acc;
    }, []);
  }

  // Plain-letter spelling: long and short vowels merge, tone accents stay.
  const simple = s => s.normalize('NFD').replace(/([ʉɛɔə])([\u0300-\u036f]*)\1/g, '$1$2')
    .replace(/ʉ([\u0300-\u036f]*)/g, 'u$1e').replace(/ɛ([\u0300-\u036f]*)/g, 'a$1e')
    .replace(/ɔ([\u0300-\u036f]*)/g, 'a$1w').replace(/ə([\u0300-\u036f]*)/g, 'o$1e').normalize('NFC');
  const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');

  root.ThaiEngine = { syllables, romanize, words, simple, plain, clsOf, toneOf, TONES };
})(typeof window !== 'undefined' ? window : globalThis);
