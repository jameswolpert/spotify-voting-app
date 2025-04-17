const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Debug error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: "Supabase crash", details: err.message });
  }
};
