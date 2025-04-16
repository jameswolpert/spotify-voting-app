
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, admin_id } = req.body;

  if (!name || !admin_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const pin = generatePin();

    const { data, error } = await supabase
      .from("sessions")
      .insert([{ name, admin_id, pin, is_active: true }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ session: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error." });
  }
};
