// Everyday Thai word list: word | pronunciation override (blank = worked out
// from the spelling) | meaning. Overrides cover words whose spoken form
// differs from the spelling rules.
(function (root) {
  const RAW = `
ฉัน|chán|I, me (casual)
ผม||I, me (male speaker)
เธอ||you (to someone close); she
คุณ||you (polite)
เขา|kǎo|he, she, they
เรา||we, us; I (casual)
มัน||it; it's (filler for emphasis)
ใคร||who; anyone
ตัวเอง||yourself, oneself
ใจ||heart, mind
หัวใจ||heart
รัก||love
ความรัก||love (the noun)
ชอบ||like
คิดถึง||miss (someone)
คิด||think
รู้สึก||feel
รู้||know
ห่วง||worry about, care for
เจ็บ||hurt
เหงา||lonely
ดีใจ||glad, happy
เสียใจ||sad, sorry
ยิ้ม||smile
หัวเราะ|hǔa-rɔ́|laugh
ร้องไห้||cry
น้ำตา||tears
กอด||hug
จูบ||kiss
มอง||look at
เห็น||see
ฟัง||listen
พูด||speak, say
บอก||tell
ถาม||ask
รอ||wait
อยู่||be at, stay; still (doing)
กลับ||go back, return
มา||come
ไป||go
เดิน||walk
วิ่ง||run
หนี||run away
หา||look for
เจอ||meet, find
ลืม||forget
จำ||remember
ฝัน||dream
ร้อง||sing; cry out
ร้องเพลง||sing a song
เพลง||song
เต้น||dance; (heart) beat
ติด||stuck to, hooked on
ติดใจ||be hooked on, charmed by
ใกล้||near
ไกล||far
ข้าง||side; beside
ข้างๆ||next to
ด้วยกัน||together
ด้วย||too, also; with
กัน||each other; together
ทุก||every
ตลอด||all the time, throughout
เสมอ|sà-mə̌ə|always
ตลอดไป||forever
วัน||day
วันนี้||today
คืน||night
คืนนี้||tonight
เวลา||time
ตอนนี้||now
เมื่อ||when
แล้ว||already; and then
ยัง||still, yet
เคย||used to, ever
จะ||will (future)
ได้||can; get
ให้||give; let
เป็น||be
มี||have; there is
ไม่||not, no
ไม่ได้||can't; didn't
ไม่ไหว||can't take it anymore
ไหว||can manage, can bear
ไหม|mǎi|(question word, yes/no)
หรือ||or
ทำไม||why
อะไร||what
ที่ไหน||where
ยังไง||how
เท่าไร||how much
ทำ||do, make
ที่||that, which; at
นี้||this
นั้น||that
นี่||this (here)
ก็|gɔ̂ɔ|then, so, also (linker)
แต่||but
และ||and
กับ||with, and
เพราะ|prɔ́|because
ถ้า||if
คง||probably, likely
ต้อง||must, have to
อยาก||want to
ช่วย||help
ช่าง||how very (exclaim); craftsman
โดน||be hit by, get (done to you)
มาก||very, a lot
จัง||so, really (casual)
เลย||at all; really (emphasis)
แค่||only, just
เท่านั้น||only that
ที่สุด||the most
เกิน||too much, beyond
นิด||a little
หน่อย||a bit; please (softener)
น่ารัก||cute, lovely
หล่อ||handsome
สวย||beautiful
ดี||good
หวาน||sweet
หอม||fragrant; sniff-kiss
ใหม่||new
เก่า||old
แรง||strong, hard
สั่น||tremble, shake
คลื่น||wave; signal
ความ||(makes a noun, like "-ness")
ของ||of; thing
คน||person
แฟน||boyfriend, girlfriend
เพื่อน||friend
ตัว||body; (counter word)
ตา||eye(s)
ปาก||mouth
มือ||hand
แก้ม||cheek
หน้า||face; front
เสียง||voice, sound
โลก||world
ฟ้า||sky
ดาว||star
ทะเล|tá-lee|sea
ฝน||rain
ลม||wind
อากาศ|aa-gàat|weather, air
นะ||(soft ending, "okay?")
ครับ||(polite ending, male speaker)
ค่ะ|kâ|(polite ending, female speaker)
คะ|ká|(polite question ending, female)
จ้ะ|jâ|(sweet, casual ending)
เถอะ|tə̀|let's (urging)
สิ|sì|(urging ending, "come on")
ล่ะ|lâ|(ending, "then?")
หรอก|rɔ̀ɔk|(softens a "no")
ไทย||Thai
ฟัง||listen
ฝึก||practise
ค่อย||gradually; softly
ไม่เป็นไร||it's okay, never mind
จน||until; so much that
จริง||real, true
จริงๆ||really, truly
สุข||happiness
สุขใจ||happy at heart
ปลอดภัย|bplɔ̀ɔt-pai|safe
ห้าม||forbid, don't
ตก||fall
ตกหลุมรัก||fall in love
หลุม||hole, pit
`;
  const map = {};
  RAW.trim().split('\n').forEach(line => {
    const [th, rom, meaning] = line.split('|');
    if (th && !map[th]) map[th] = { rom: rom || '', meaning: meaning || '' };
  });
  root.THAI_WORDS = map;
})(typeof window !== 'undefined' ? window : globalThis);
