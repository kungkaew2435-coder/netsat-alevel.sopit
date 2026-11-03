// ตัวช่วยที่ใช้ร่วมกันทั้ง index.html และ cards.html

const store = {
  get(k, d = null) {
    try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
  },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

async function api(action, data = {}) {
  if (!API_URL || API_URL.includes('วางรหัส')) throw new Error('ยังไม่ได้ใส่ API_URL ในไฟล์ config.js');
  let res;
  try {
    // ส่งเป็น text/plain เพื่อไม่ให้เบราว์เซอร์ทำ CORS preflight (Apps Script ไม่รองรับ)
    res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(Object.assign({ action, pin: store.get('pin', '') }, data)),
    });
  } catch (e) {
    const err = new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจอินเทอร์เน็ต หรือการ Deploy ให้ "ทุกคน" เข้าถึงได้');
    err.network = true;
    throw err;
  }
  let j;
  try { j = await res.json(); } catch (e) { throw new Error('เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง ตรวจ API_URL และการ Deploy'); }
  if (!j.ok) throw new Error(j.error || 'เกิดข้อผิดพลาด');
  return j;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const pad2 = n => String(n).padStart(2, '0');
function localDate(d = new Date()) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function localTime(d = new Date()) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()); }
