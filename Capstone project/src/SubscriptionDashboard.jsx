import { useState } from "react";

const initialSubs = [
  { id: 1, name: "Netflix",         cost: 649,  category: "Entertainment", renewal: "2025-04-28", icon: "🎬", color: "#e50914" },
  { id: 2, name: "Spotify",         cost: 119,  category: "Music",         renewal: "2025-05-10", icon: "🎵", color: "#1db954" },
  { id: 3, name: "Amazon Prime",    cost: 299,  category: "Shopping",      renewal: "2025-05-30", icon: "📦", color: "#ff9900" },
  { id: 4, name: "YouTube Premium", cost: 189,  category: "Entertainment", renewal: "2025-05-20", icon: "▶️", color: "#ff0000" },
];

const CATEGORIES = ["Entertainment", "Music", "Shopping", "Productivity", "Education", "Health", "Other"];
const ICONS = ["🎬", "🎵", "📦", "▶️", "💼", "📚", "🏥", "⭐", "🎮", "📰", "☁️", "🔒"];

const BLANK_FORM = { name: "", cost: "", category: "Entertainment", renewal: "", icon: "⭐", color: "#6366f1" };

function daysLeft(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const renewal = new Date(dateStr);
  return Math.ceil((renewal - today) / 86400000);
}

function Badge({ days }) {
  let bg, color, label;
  if (days < 0)        { bg = "#3f3f46"; color = "#a1a1aa"; label = "Expired"; }
  else if (days <= 5)  { bg = "#450a0a"; color = "#f87171"; label = `⚠️ ${days}d left`; }
  else if (days <= 15) { bg = "#422006"; color = "#fb923c"; label = `${days}d left`; }
  else                 { bg = "#052e16"; color = "#4ade80"; label = `${days}d left`; }
  return (
    <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#18181b", borderRadius: 12, padding: "18px 20px",
      border: "1px solid #27272a", borderTop: `3px solid ${accent}` }}>
      <div style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 6 }}>{label}</div>
      <div style={{ color: "#f4f4f5", fontSize: 28, fontWeight: 800 }}>{value}</div>
      <div style={{ color: "#71717a", fontSize: 12 }}>{sub}</div>
    </div>
  );
}

export default function App() {
  const [subs,        setSubs]        = useState(initialSubs);
  const [showForm,    setShowForm]    = useState(false);
  const [filterCat,   setFilterCat]   = useState("All");
  const [editId,      setEditId]      = useState(null);
  const [form,        setForm]        = useState(BLANK_FORM);
  const [error,       setError]       = useState("");          // ← inline error (no alert)
  const [deleteId,    setDeleteId]    = useState(null);        // ← inline confirm (no confirm())

  const totalMonthly = subs.reduce((s, x) => s + Number(x.cost), 0);
  const totalYearly  = totalMonthly * 12;
  const expiringSoon = subs.filter(x => { const d = daysLeft(x.renewal); return d >= 0 && d <= 5; }).length;
  const filtered     = filterCat === "All" ? subs : subs.filter(s => s.category === filterCat);

  function openAdd() {
    setEditId(null);
    setForm(BLANK_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(sub) {
    setEditId(sub.id);
    setForm({ name: sub.name, cost: String(sub.cost), category: sub.category, renewal: sub.renewal, icon: sub.icon, color: sub.color });
    setError("");
    setShowForm(true);
  }

  function handleSave() {
    // Inline validation — no alert()
    if (!form.name.trim()) { setError("Please enter the subscription name."); return; }
    if (!form.cost || Number(form.cost) <= 0) { setError("Please enter a valid monthly cost."); return; }
    if (!form.renewal) { setError("Please select a renewal date."); return; }
    setError("");

    if (editId !== null) {
      setSubs(subs.map(s => s.id === editId ? { ...form, id: editId, cost: Number(form.cost) } : s));
    } else {
      setSubs(prev => [...prev, { ...form, id: Date.now(), cost: Number(form.cost) }]);
    }
    setShowForm(false);
  }

  function confirmDelete(id) {
    setDeleteId(id); // show inline confirm card
  }

  function doDelete() {
    setSubs(subs.filter(s => s.id !== deleteId));
    setDeleteId(null);
  }

  const inp = {
    width: "100%", background: "#09090b", border: "1px solid #3f3f46",
    borderRadius: 8, color: "#f4f4f5", padding: "10px 12px",
    fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#f4f4f5",
      fontFamily: "'Segoe UI', sans-serif", padding: "28px 20px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ color: "#a1a1aa", fontSize: 13, margin: 0 }}>💳 Personal Finance</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 0",
            background: "linear-gradient(90deg,#fff,#a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Subscription Tracker
          </h1>
        </div>
        <button onClick={openAdd}
          style={{ background: "#6366f1", color: "#fff", border: "none", padding: "10px 22px",
            borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          + Add New
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Monthly Spend" value={`₹${totalMonthly.toLocaleString()}`} sub={`₹${totalYearly.toLocaleString()} / year`} accent="#6366f1" />
        <StatCard label="Active Subs"   value={subs.length}   sub="services tracked" accent="#22d3ee" />
        <StatCard label="Expiring Soon" value={expiringSoon}  sub="within 5 days"    accent="#f87171" />
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {["All", ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{ background: filterCat === cat ? "#6366f1" : "#18181b",
              color: filterCat === cat ? "#fff" : "#a1a1aa",
              border: `1px solid ${filterCat === cat ? "#6366f1" : "#27272a"}`,
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Inline Delete Confirm Banner */}
      {deleteId && (
        <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 12,
          padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ color: "#fca5a5", fontWeight: 600 }}>🗑️ Delete "{subs.find(s => s.id === deleteId)?.name}"? This cannot be undone.</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={doDelete}
              style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8,
                padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Yes, Delete
            </button>
            <button onClick={() => setDeleteId(null)}
              style={{ background: "#27272a", color: "#a1a1aa", border: "none", borderRadius: 8,
                padding: "7px 16px", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subscription Cards */}
      {filtered.length === 0
        ? <div style={{ textAlign: "center", color: "#71717a", padding: 60, fontSize: 16 }}>No subscriptions here 😴</div>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(sub => {
              const days = daysLeft(sub.renewal);
              return (
                <div key={sub.id} style={{ background: "#18181b", border: "1px solid #27272a",
                  borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 4, alignSelf: "stretch", background: sub.color, borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: sub.color + "22", border: `1px solid ${sub.color}44` }}>
                    <span style={{ fontSize: 22 }}>{sub.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{sub.name}</span>
                      <Badge days={days} />
                    </div>
                    <div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>
                      {sub.category} · Renews {sub.renewal}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", marginRight: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>₹{sub.cost}</div>
                    <div style={{ color: "#71717a", fontSize: 11 }}>/month</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button onClick={() => openEdit(sub)}
                      style={{ background: "#27272a", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>✏️</button>
                    <button onClick={() => confirmDelete(sub.id)}
                      style={{ background: "#450a0a", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Add / Edit Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 16,
            padding: 28, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>

            <h2 style={{ margin: "0 0 20px", color: "#f4f4f5", fontSize: 20 }}>
              {editId ? "✏️ Edit Subscription" : "➕ Add Subscription"}
            </h2>

            {/* Inline Error Message */}
            {error && (
              <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8,
                padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13, fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <label style={{ display: "block", color: "#a1a1aa", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Name *</label>
            <input style={inp} placeholder="e.g. Netflix" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />

            <label style={{ display: "block", color: "#a1a1aa", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Monthly Cost ₹ *</label>
            <input style={inp} type="number" min="1" placeholder="e.g. 649" value={form.cost}
              onChange={e => setForm({ ...form, cost: e.target.value })} />

            <label style={{ display: "block", color: "#a1a1aa", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Category</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c} style={{ background: "#18181b" }}>{c}</option>)}
            </select>

            <label style={{ display: "block", color: "#a1a1aa", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Renewal Date *</label>
            <input style={inp} type="date" value={form.renewal}
              onChange={e => setForm({ ...form, renewal: e.target.value })} />

            <label style={{ display: "block", color: "#a1a1aa", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>Icon</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                  style={{ background: form.icon === ic ? "#6366f1" : "#27272a",
                    border: form.icon === ic ? "2px solid #818cf8" : "2px solid transparent",
                    borderRadius: 8, width: 40, height: 40, fontSize: 18, cursor: "pointer" }}>
                  {ic}
                </button>
              ))}
            </div>

            <label style={{ display: "block", color: "#a1a1aa", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Card Color</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <input type="color" value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer", padding: 2, background: "#27272a" }} />
              <span style={{ color: "#71717a", fontSize: 13 }}>Click to pick a color for the card</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave}
                style={{ flex: 1, background: "#6366f1", color: "#fff", border: "none",
                  borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {editId ? "Update" : "Add"} Subscription
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ background: "#27272a", color: "#a1a1aa", border: "none",
                  borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}