const pool = require("../db");

// Theater Controller BEGIN

const getTheaters = async (req, res) => {
	const { q } = req.query; // Get search query
	let conn;
	try {
		conn = await pool.getConnection();
		let query = "SELECT * FROM theaters";
		let params = [];

		if (q) {
			query += " WHERE name LIKE ? OR location LIKE ?";
			params.push(`%${q}%`, `%${q}%`);
		}

		const rows = await conn.query(query, params);
		res.json(rows);
	} catch (err) {
		res.status(500).json({
			error: "Failed to fetch theaters",
			details: err.message,
		});
	} finally {
		if (conn) conn.release();
	}
};

const getShowtimes = async (req, res) => {
	const { id } = req.params;

	let conn;
	try {
		conn = await pool.getConnection();

		const rows = await conn.query(
			`SELECT
                s.title,
                st.start_time,
                st.price,
                st.id AS showtime_id
             FROM showtimes st
             JOIN shows s ON st.show_id = s.id
             WHERE st.theater_id = ?`,
			[id],
		);

		res.json(rows);
	} catch (err) {
		res.status(500).json({
			error: "Failed to fetch showtimes",
			details: err.message,
		});
	} finally {
		if (conn) conn.release();
	}
};

module.exports = {
	getTheaters,
	getShowtimes,
};

// Theater Controller END
