import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const TABLE = "profiles"; // change only if your table has another name

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) {
      setError(error.message);
      setUsers([]);
    } else {
      setError("");
      setUsers(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateUser(id, changes) {
    const { error } = await supabase.from(TABLE).update(changes).eq("id", id);
    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    loadUsers();
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>User Management</h2>

      {loading && <p>Loading...</p>}
      {error && (
        <p style={{ color: "#b91c1c" }}>
          Could not load users: {error}
        </p>
      )}
      {!loading && !error && users.length === 0 && <p>No users found.</p>}

      {users.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Name / Email</th>
              <th style={{ padding: 8 }}>Role</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>
                  {u.full_name || u.name || u.email || u.id}
                  {u.email && u.full_name ? (
                    <div style={{ fontSize: 12, color: "#666" }}>{u.email}</div>
                  ) : null}
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={u.role ?? ""}
                    onChange={(e) => updateUser(u.id, { role: e.target.value })}
                  >
                    <option value="">-</option>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>{u.status ?? "-"}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => updateUser(u.id, { status: "approved" })}>
                    Approve
                  </button>{" "}
                  <button onClick={() => updateUser(u.id, { status: "disabled" })}>
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}