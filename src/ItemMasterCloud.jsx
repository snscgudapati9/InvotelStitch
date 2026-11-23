import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient.js";

const OWNER_EMAIL = "saichandgudapati@gmail.com";
const DEPARTMENTS = ["Kitchen", "Bar", "House Keeping", "Office Items", "Stationery Items"];
const style = {
  width: "100%", minWidth: 0, padding: "9px 10px", border: "1px solid #DDD3C4",
  borderRadius: 5, background: "#FFFCF7", color: "#262220", fontSize: 14,
};

function mapItem(row) {
  return {
    id: row.id, name: row.item_name, department: row.department || "",
    category: row.category || "", unit: row.unit || "",
    cost: Number(row.purchase_cost || 0), supplier: row.supplier_name || "",
    itemCode: row.item_code || "", activeStatus: row.active_status || "ACTIVE",
  };
}

export default function ItemMasterCloud() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [category, setCategory] = useState("All Categories");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [adding, setAdding] = useState(false);
  const blank = { name: "", itemCode: "", department: "Kitchen", category: "", unit: "Kg", cost: 0, supplier: "" };
  const [fresh, setFresh] = useState(blank);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setMessage(error.message);
      setSession(data?.session || null);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setLoading(false); return; }
    const signedEmail = (session.user?.email || "").toLowerCase();
    if (signedEmail !== OWNER_EMAIL) {
      setMessage("This account is not authorised. Please sign in using the approved owner email.");
      supabase.auth.signOut();
      return;
    }
    refresh();
  }, [session]);

  async function refresh() {
    setLoading(true);
    setMessage("");
    const [itemResult, historyResult] = await Promise.all([
      supabase.from("items").select("*").eq("active_status", "ACTIVE").order("department").order("item_name"),
      supabase.from("item_change_history")
        .select("id,field_name,old_value,new_value,changed_at,changed_by,items(item_name)")
        .order("changed_at", { ascending: false }).limit(100),
    ]);
    if (itemResult.error) setMessage("Item Master load failed: " + itemResult.error.message);
    else setItems((itemResult.data || []).map(mapItem));
    if (historyResult.error) setMessage((prev) => prev || "Audit history unavailable: " + historyResult.error.message);
    else setHistory(historyResult.data || []);
    setLoading(false);
  }

  async function sendSignInLink(event) {
    event.preventDefault();
    if (email.trim().toLowerCase() !== OWNER_EMAIL) {
      setMessage("Only the approved owner email can sign in.");
      return;
    }
    setSaving(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: OWNER_EMAIL,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin },
    });
    setMessage(error ? error.message : "Secure sign-in link sent. Open your email and follow the link on this device.");
    setSaving(false);
  }

  async function saveItem(row) {
    if (!row.name?.trim() || !row.unit?.trim()) {
      setMessage("Item name and unit are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    const payload = {
      item_code: row.itemCode?.trim() || null,
      item_name: row.name.trim(),
      department: row.department || null,
      category: row.category || null,
      unit: row.unit.trim(),
      purchase_cost: Number(row.cost) || 0,
      supplier_name: row.supplier?.trim() || null,
    };
    const query = row.id
      ? supabase.from("items").update(payload).eq("id", row.id)
      : supabase.from("items").insert(payload);
    const { data, error } = await query.select("*").single();
    if (error) setMessage("Save failed: " + error.message);
    else {
      const saved = mapItem(data);
      setItems((current) => row.id
        ? current.map((item) => item.id === row.id ? saved : item)
        : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setEditing(null);
      setDraft(null);
      setAdding(false);
      setFresh(blank);
      setMessage("Saved to the shared cloud Item Master.");
      await refreshHistory();
    }
    setSaving(false);
  }

  async function refreshHistory() {
    const { data, error } = await supabase.from("item_change_history")
      .select("id,field_name,old_value,new_value,changed_at,changed_by,items(item_name)")
      .order("changed_at", { ascending: false }).limit(100);
    if (!error) setHistory(data || []);
  }

  async function archiveItem(item) {
    if (!window.confirm(`Archive "${item.name}"? Existing stock and purchase history will be preserved.`)) return;
    setSaving(true);
    const { error } = await supabase.from("items").update({ active_status: "INACTIVE" }).eq("id", item.id);
    if (error) setMessage("Archive failed: " + error.message);
    else {
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setMessage("Item archived. Historical records are preserved.");
    }
    setSaving(false);
  }

  const departments = useMemo(() => ["All Departments", ...new Set(items.map((item) => item.department).filter(Boolean))], [items]);
  const categories = useMemo(() => ["All Categories", ...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) =>
      (!term || [item.name, item.department, item.category, item.supplier].some((value) => (value || "").toLowerCase().includes(term))) &&
      (department === "All Departments" || item.department === department) &&
      (category === "All Categories" || item.category === category)
    );
  }, [items, search, department, category]);

  if (!session) {
    return (
      <section style={{ background: "#FFFCF7", border: "1px solid #DDD3C4", borderRadius: 8, padding: 20, maxWidth: 520 }}>
        <div style={{ color: "#9C3B2E", fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>INVOTELSTITCH · SECURE ACCESS</div>
        <h2 style={{ color: "#262220", fontSize: 22, margin: "8px 0" }}>Item Master sign in</h2>
        <p style={{ color: "#5C554E", fontSize: 14 }}>Sign in to access the shared restaurant item catalogue.</p>
        <form onSubmit={sendSignInLink} style={{ display: "grid", gap: 10 }}>
          <label style={{ color: "#5C554E", fontSize: 13 }}>Owner email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ ...style, marginTop: 5 }} />
          </label>
          <button disabled={saving} style={{ background: "#9C3B2E", color: "#fff", border: 0, borderRadius: 5, padding: 11, fontWeight: 600 }}>
            {saving ? "Sending…" : "Send secure sign-in link"}
          </button>
        </form>
        {message && <p role="status" style={{ color: "#5C7A5C", fontSize: 13, marginTop: 12 }}>{message}</p>}
      </section>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <strong style={{ color: "#262220" }}>Shared Item Master</strong>
          <div style={{ fontSize: 12, color: "#5C554E" }}>{session.user.email} · cloud synced · {items.length} active items</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={refresh} disabled={loading} style={{ ...style, width: "auto" }}>Refresh</button>
          <button onClick={() => supabase.auth.signOut()} style={{ ...style, width: "auto" }}>Sign out</button>
        </div>
      </div>
      {message && <div role="status" style={{ padding: 10, background: "#F1EAE0", borderRadius: 5, color: "#5C554E", fontSize: 13 }}>{message}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search item, category, supplier…" style={{ ...style, flex: "1 1 220px" }} />
        <select value={department} onChange={(event) => setDepartment(event.target.value)} style={{ ...style, width: "auto" }}>{departments.map((value) => <option key={value}>{value}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} style={{ ...style, width: "auto" }}>{categories.map((value) => <option key={value}>{value}</option>)}</select>
        <button onClick={() => { setAdding((value) => !value); setEditing(null); }} style={{ background: "#9C3B2E", color: "#fff", border: 0, borderRadius: 5, padding: "9px 14px" }}>+ Add item</button>
      </div>
      {adding && (
        <form onSubmit={(event) => { event.preventDefault(); saveItem(fresh); }} style={{ background: "#F1EAE0", padding: 14, borderRadius: 7, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 9 }}>
          <input placeholder="Item name *" value={fresh.name} onChange={(event) => setFresh({ ...fresh, name: event.target.value })} style={style} required />
          <input placeholder="Item code (optional)" value={fresh.itemCode} onChange={(event) => setFresh({ ...fresh, itemCode: event.target.value })} style={style} />
          <select value={fresh.department} onChange={(event) => setFresh({ ...fresh, department: event.target.value })} style={style}>{DEPARTMENTS.map((value) => <option key={value}>{value}</option>)}</select>
          <input placeholder="Category" value={fresh.category} onChange={(event) => setFresh({ ...fresh, category: event.target.value })} style={style} />
          <input placeholder="Unit *" value={fresh.unit} onChange={(event) => setFresh({ ...fresh, unit: event.target.value })} style={style} required />
          <input type="number" min="0" step="0.01" placeholder="Cost ₹" value={fresh.cost} onChange={(event) => setFresh({ ...fresh, cost: event.target.value })} style={style} />
          <input placeholder="Preferred supplier" value={fresh.supplier} onChange={(event) => setFresh({ ...fresh, supplier: event.target.value })} style={style} />
          <button disabled={saving} style={{ background: "#5C7A5C", color: "#fff", border: 0, borderRadius: 5, padding: 10 }}>Save item</button>
        </form>
      )}
      <div style={{ overflowX: "auto", background: "#FFFCF7", border: "1px solid #DDD3C4", borderRadius: 7 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760, fontSize: 13 }}>
          <thead><tr style={{ background: "#F1EAE0", textAlign: "left" }}>{["Item name", "Department", "Category", "Unit", "Cost ₹", "Supplier", "Actions"].map((value) => <th key={value} style={{ padding: 10, whiteSpace: "nowrap" }}>{value}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{ padding: 20 }}>Loading catalogue…</td></tr> : filtered.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid #DDD3C4" }}>
                {editing === item.id ? <>
                  <td style={{ padding: 7 }}><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} style={style} /></td>
                  <td style={{ padding: 7 }}><select value={draft.department} onChange={(event) => setDraft({ ...draft, department: event.target.value })} style={style}>{DEPARTMENTS.map((value) => <option key={value}>{value}</option>)}</select></td>
                  <td style={{ padding: 7 }}><input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} style={style} /></td>
                  <td style={{ padding: 7 }}><input value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value })} style={style} /></td>
                  <td style={{ padding: 7 }}><input type="number" min="0" step="0.01" value={draft.cost} onChange={(event) => setDraft({ ...draft, cost: event.target.value })} style={style} /></td>
                  <td style={{ padding: 7 }}><input value={draft.supplier} onChange={(event) => setDraft({ ...draft, supplier: event.target.value })} style={style} /></td>
                  <td style={{ padding: 7, whiteSpace: "nowrap" }}><button disabled={saving} onClick={() => saveItem(draft)}>Save</button> <button onClick={() => setEditing(null)}>Cancel</button></td>
                </> : <>
                  <td style={{ padding: 10, fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: 10 }}>{item.department || "—"}</td>
                  <td style={{ padding: 10 }}>{item.category || "—"}</td>
                  <td style={{ padding: 10 }}>{item.unit}</td>
                  <td style={{ padding: 10, textAlign: "right" }}>{item.cost.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td style={{ padding: 10 }}>{item.supplier || "—"}</td>
                  <td style={{ padding: 7, whiteSpace: "nowrap" }}>
                    <button onClick={() => { setEditing(item.id); setDraft({ ...item }); }} style={{ ...style, width: "auto", padding: "6px 9px" }}>Edit</button>
                    <button disabled={saving} onClick={() => archiveItem(item)} style={{ ...style, width: "auto", padding: "6px 9px", color: "#9C3B2E" }}>Archive</button>
                  </td>
                </>}
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan="7" style={{ padding: 20, textAlign: "center", color: "#5C554E" }}>No matching active items.</td></tr>}
          </tbody>
        </table>
      </div>
      <details style={{ background: "#FFFCF7", border: "1px solid #DDD3C4", borderRadius: 7, padding: 12 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>Recent change audit ({history.length})</summary>
        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["Item", "Field", "Old value", "New value", "Changed at", "By"].map((value) => <th key={value} style={{ textAlign: "left", padding: 7 }}>{value}</th>)}</tr></thead>
            <tbody>{history.map((entry) => (
              <tr key={entry.id} style={{ borderTop: "1px solid #DDD3C4" }}>
                <td style={{ padding: 7 }}>{entry.items?.item_name || "—"}</td>
                <td style={{ padding: 7 }}>{entry.field_name}</td>
                <td style={{ padding: 7 }}>{entry.old_value ?? "—"}</td>
                <td style={{ padding: 7 }}>{entry.new_value ?? "—"}</td>
                <td style={{ padding: 7 }}>{new Date(entry.changed_at).toLocaleString("en-IN")}</td>
                <td style={{ padding: 7 }}>{entry.changed_by || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
