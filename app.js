:root{
  --bg:#f6f9ff;
  --surface:#ffffff;
  --soft:#eef7ff;
  --text:#0b1324;
  --muted:#64748b;
  --primary:#1f3a8a;
  --primary-2:#0ea5a6;
  --success:#16a34a;
  --danger:#ef4444;
  --olive:#799286;
  --paper:#F2F1EC;
  --radius:16px;
  --shadow:0 14px 30px rgba(2,6,23,.10);
  --maxw:1100px; --gap:16px;
}

*{box-sizing:border-box}
html,body{margin:0;padding:0;height:100%}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial,"Noto Sans";background:var(--bg);color:var(--text)}
.fancy{font-family:"Cinzel",serif; letter-spacing:.2px}
.center{text-align:center}

/* Header */
.app-header{display:flex;justify-content:space-between;align-items:center;padding:12px clamp(12px,3vw,24px);background:#ffffffd9;border-bottom:1px solid #dbe1ff;backdrop-filter:blur(10px);position:sticky;top:0;z-index:20}
.app-title{margin:0 10px 0 0}
.brand{display:flex;align-items:center;gap:10px}
.slogan-one{margin-left:8px}
.slogans-inline.pill{background:var(--olive);color:#fff;border-radius:999px;padding:6px 12px;font-weight:800}
.slogans-inline .accent{background:var(--primary-2);color:#fff;padding:2px 6px;border-radius:999px}
.header-actions{display:flex;align-items:center;gap:10px}
#langSelect{border:1px solid #cbd5e1;border-radius:10px;padding:6px 8px;background:#fff}

/* Hamburger + Drawer */
.hamburger{border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:10px 14px;font-size:18px;cursor:pointer}
.drawer{position:fixed;inset:0 auto 0 0;width:280px;background:#fff;border-right:1px solid #dbe1ff;box-shadow:0 20px 60px rgba(8,15,40,.24);transform:translateX(-105%);transition:transform .2s ease;z-index:30;display:flex;flex-direction:column}
.drawer.open{transform:translateX(0)}
.drawer-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #e6ebff}
.drawer-nav{display:grid;padding:12px}
.drawer-link{padding:12px 10px;border:1px solid #e6ebff;margin-bottom:10px;border-radius:12px;background:#f8fbff;cursor:pointer;text-align:left;font-weight:700;display:flex;align-items:center;gap:10px}
.drawer-link.active{box-shadow:0 0 0 3px rgba(31,58,138,.15); border-color:#c7d2fe}
.drawer-link.danger{border-color:#ffd5d9;background:#fff2f3;color:#991b1b}
.backdrop{position:fixed;inset:0;background:rgba(12,18,36,.35);backdrop-filter:blur(2px);z-index:25}

/* Layout */
.container{margin:12px auto clamp(84px,8vh,96px);max-width:var(--maxw);padding:0 clamp(12px,3vw,24px);display:grid;gap:var(--gap)}
.card{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow);padding:clamp(14px,2.4vw,22px);border:1px solid #dbe1ff}
.card.soft{background:var(--soft)}
.grid,.grid-2{display:grid;gap:var(--gap)}
.grid-2{grid-template-columns:1fr}
@media(min-width:760px){.grid-2{grid-template-columns:1fr 1fr}}

.actions{display:flex;gap:10px;flex-wrap:wrap}
.push-down{margin-top:22px}

/* Buttons */
.btn{border:1px solid #cbd5e1;padding:10px 14px;border-radius:12px;background:#f8fafc;color:var(--text);cursor:pointer;font-weight:700;transition:transform .05s ease,filter .15s ease,background .15s ease}
.btn:hover{filter:brightness(1.02);background:#eef2ff;border-color:#c7d2fe}
.btn.primary{background:var(--primary);color:#fff;border-color:transparent}
.btn.subtle{background:#eef2f7}
.btn.success{background:var(--success);color:#fff;border-color:transparent}
.btn.danger{background:var(--danger);color:#fff;border-color:transparent}

/* List */
.list{list-style:none;padding-left:0;margin:0}
.list li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px dashed #cbd5e1}

/* Pills */
.pill-title{background:var(--olive);color:#fff;padding:10px 16px;border-radius:999px;font-weight:800;margin:6px auto 14px;max-width:680px}
.pill-title-sub{background:var(--paper);color:#111;padding:8px 14px;border-radius:999px;font-weight:800;margin:18px auto 10px;max-width:480px;border:1px solid #d6d3cd}
.pill-card{background:var(--paper);border:1px solid #d6d3cd;border-radius:24px;padding:16px}
.pill-list{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.pill-list.ordered{counter-reset:item}
.pill-item, .pill-list.ordered li{background:#fff;border:1px solid #e6e6e0;border-radius:999px;padding:10px 14px;display:flex;align-items:center;gap:10px}
.pill-list.ordered li::before{counter-increment:item;content:counter(item);display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--olive);color:#fff;font-weight:800}

/* Hero tweak */
.home-pills{align-items:start}

/* Chat */
.chat-box{height:260px;overflow:auto;padding:10px;border:1px solid #dbe1ff;border-radius:12px;background:#fff;color:#111}
.chat-msg{margin:6px 0}.chat-msg small{color:#6b7280}
.chat-name{cursor:pointer}
.badge-chip{padding:2px 8px;border-radius:999px;color:#fff;font-weight:800;margin-right:6px;}

/* Badges grid */
.badge-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.badge-card{border:1px solid #dbe1ff;border-radius:12px;padding:12px;background:#fff;display:grid;gap:8px;align-content:start}
.badge-card.locked{filter:grayscale(0.9) brightness(0.95)}
.badge-icon{width:40px;height:40px;border-radius:10px;display:inline-grid;place-items:center;background:#e6ebff}

/* Calendar */
.calendar-head{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px}
.calendar-head.up{margin-top:-6px}
.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.m{font-size:12px;color:#475569;text-align:center}
.day{border:1px solid #dbe1ff;border-radius:10px;min-height:58px;background:#fff;padding:6px;display:grid;align-content:start;gap:6px}
.day.s{outline:2px solid var(--success)}
.day.f{outline:2px solid var(--danger)}
.day.locked{opacity:.55;cursor:not-allowed}
.day .d{font-weight:700;font-size:12px;color:#334155}
.day .m{font-size:12px}
.streak{margin-top:8px;font-weight:800}

/* Crisis pill */
.crisis-mini{position:sticky;top:64px;display:flex;justify-content:flex-end;max-width:var(--maxw);margin:2px auto 0;padding:0 clamp(12px,3vw,24px)}
.crisis-mini a{background:#ffe0e5;border:1px solid #ffc8d0;color:#9f1239;text-decoration:none;padding:6px 10px;border-radius:999px;font-size:12px}

/* Tabbar */
.tabbar{position:fixed;bottom:0;left:0;right:0;display:grid;grid-template-columns:repeat(3,1fr);background:#ffffffd9;border-top:1px solid #dbe1ff;backdrop-filter:blur(10px);z-index:15}
.tabbtn{appearance:none;background:transparent;border:0;color:var(--text);padding:8px 4px 10px;cursor:pointer;display:grid;place-items:center;gap:4px}
.tabbtn.active{color:var(--primary)}
.ico{width:22px;height:22px;display:block}

/* Guide choice & settings */
.guide-choice{margin:10px auto}
.settings-addictions{grid-template-columns: repeat(auto-fit,minmax(140px,1fr))}
.sa-item{display:grid;justify-items:center;gap:8px;padding:10px;border:1px dashed #cfe3ff;border-radius:12px;background:#f8fbff}
.sa-item span{font-weight:700}
.sa-item img{width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid #e5edff}

/* Notes pills */
.notes-list .pill-item{flex-direction:column;align-items:center}
.notes-list .meta{font-size:12px;color:#475569}


/* Header actions layout incl. gear */
.header-actions{ display:flex; align-items:center; gap:8px; position:relative; }
#gearBtnTop{ font-size:20px; background:transparent; border:none; cursor:pointer; }

/* Move language slightly left to allow gear at right */
#langSelect{ margin-right: 8px; }

/* Daily check-in smaller note box */
#view-checkin textarea[name="note"]{ height:36px; min-height:36px; resize:vertical; }
