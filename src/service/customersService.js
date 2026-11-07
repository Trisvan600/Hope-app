import { supabase } from "../lib/supabaseClient";

const TABLE = "customers";

// Builds stamps like: "ADD system 2026-11-02 01:19 PM"
export function buildStamp(action, user = "system") {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${action} ${user} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(h)}:${pad(d.getMinutes())} ${ampm}`;
}

export async function getCustomers() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("custno", { ascending: true });
  if (error) throw error;
  return data;
}

// Next code like C0083
export async function getNextCustNo() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("custno")
    .order("custno", { ascending: false })
    .limit(1);
  if (error) throw error;
  const last = data?.[0]?.custno ?? "C0000";
  const next = parseInt(last.slice(1), 10) + 1;
  return `C${String(next).padStart(4, "0")}`;
}

export async function createCustomer({ custname, address, payterm }, user) {
  const custno = await getNextCustNo();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      custno,
      custname: custname.trim(),
      address: address.trim(),
      payterm,
      is_deleted: false,
      stamp: buildStamp("ADD", user),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomer(custno, { custname, address, payterm }, user) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      custname: custname.trim(),
      address: address.trim(),
      payterm,
      stamp: buildStamp("EDIT", user),
    })
    .eq("custno", custno)
    .select()
    .single();
  if (error) throw error;
  return data;
}