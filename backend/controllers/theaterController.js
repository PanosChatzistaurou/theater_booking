const pool = require('../db');

const getTheaters = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM theaters");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

const getShowtimes = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT s.title, st.start_time, st.price, st.id as showtime_id 
      FROM showtimes st 
      JOIN shows s ON st.show_id = s.id 
      WHERE st.theater_id = ?`;
    const rows = await conn.query(query, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
};

module.exports = { getTheaters, getShowtimes };