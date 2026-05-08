const pool = require("../db");

// Reservations Controller BEGIN

const createReservation = async (req, res) => {
	const { showtime_id, seat_id } = req.body;
	const user_id = req.user.id;

	if (!showtime_id || !seat_id) {
		return res
			.status(400)
			.json({ error: "showtime_id and seat_id are required" });
	}

	// Reservation expires 15 minutes from now if not confirmed
	const expires_at = new Date(Date.now() + 15 * 60 * 1000);

	let conn;
	try {
		conn = await pool.getConnection();

		// 1. Check if ANY reservation exists for this exact seat and showtime
		const existing = await conn.query(
			`SELECT id, status FROM reservations WHERE showtime_id = ? AND seat_id = ?`,
			[showtime_id, seat_id],
		);

		if (existing.length > 0) {
			const resRecord = existing[0];

			// 2. If it exists and is active, block the booking
			if (
				resRecord.status === "PENDING" ||
				resRecord.status === "CONFIRMED"
			) {
				return res.status(409).json({
					error: "Seat is already reserved for this showtime",
				});
			}

			// 3. If it exists but is 'CANCELLED', recycle the row using UPDATE
			await conn.query(
				`UPDATE reservations 
                 SET user_id = ?, status = 'PENDING', expires_at = ?, created_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
				[user_id, expires_at, resRecord.id],
			);

			return res.status(201).json({
				message: "Reservation created successfully (Recycled)",
				reservation_id: Number(resRecord.id),
				status: "PENDING",
				expires_at,
			});
		}

		// 4. If no row exists at all, INSERT a brand new one
		const result = await conn.query(
			`INSERT INTO reservations (user_id, showtime_id, seat_id, status, expires_at)
             VALUES (?, ?, ?, 'CONFIRMED', NULL)`, // Set to CONFIRMED and expires_at to NULL
			[user_id, showtime_id, seat_id],
		);

		res.status(201).json({
			message: "Reservation created and confirmed successfully",
			reservation_id: Number(result.insertId),
			status: "CONFIRMED",
		});
	} catch (err) {
		res.status(500).json({
			error: "Failed to create reservation",
			details: err.message,
		});
	} finally {
		if (conn) conn.release();
	}
};

const confirmReservation = async (req, res) => {
	const { id } = req.params;
	const user_id = req.user.id;

	let conn;
	try {
		conn = await pool.getConnection();

		const reservations = await conn.query(
			"SELECT * FROM reservations WHERE id = ? AND user_id = ?",
			[id, user_id],
		);
		const reservation = reservations[0];

		if (!reservation) {
			return res.status(404).json({ error: "Reservation not found" });
		}

		if (reservation.status === "CANCELLED") {
			return res
				.status(400)
				.json({ error: "Cannot confirm a cancelled reservation" });
		}

		if (reservation.status === "CONFIRMED") {
			return res
				.status(400)
				.json({ error: "Reservation is already confirmed" });
		}

		if (new Date() > new Date(reservation.expires_at)) {
			await conn.query(
				"UPDATE reservations SET status = 'CANCELLED' WHERE id = ?",
				[id],
			);
			return res.status(400).json({ error: "Reservation has expired" });
		}

		await conn.query(
			"UPDATE reservations SET status = 'CONFIRMED', expires_at = NULL WHERE id = ?",
			[id],
		);

		res.json({ message: "Reservation confirmed successfully" });
	} catch (err) {
		res.status(500).json({
			error: "Failed to confirm reservation",
			details: err.message,
		});
	} finally {
		if (conn) conn.release();
	}
};

const cancelReservation = async (req, res) => {
	const { id } = req.params;
	const user_id = req.user.id;

	let conn;
	try {
		conn = await pool.getConnection();

		const reservations = await conn.query(
			"SELECT * FROM reservations WHERE id = ? AND user_id = ?",
			[id, user_id],
		);
		const reservation = reservations[0];

		if (!reservation) {
			return res.status(404).json({ error: "Reservation not found" });
		}

		if (reservation.status === "CANCELLED") {
			return res
				.status(400)
				.json({ error: "Reservation is already cancelled" });
		}

		await conn.query(
			"UPDATE reservations SET status = 'CANCELLED' WHERE id = ?",
			[id],
		);

		res.json({ message: "Reservation cancelled successfully" });
	} catch (err) {
		res.status(500).json({
			error: "Failed to cancel reservation",
			details: err.message,
		});
	} finally {
		if (conn) conn.release();
	}
};

const getUserReservations = async (req, res) => {
	const user_id = req.user.id;

	let conn;
	try {
		conn = await pool.getConnection();

		const rows = await conn.query(
			`SELECT
                r.id              AS reservation_id,
                r.status,
                r.expires_at,
                r.created_at,
                s.title           AS show_title,
                st.start_time,
                st.price,
                t.name            AS theater_name,
                t.location        AS theater_location,
                ts.row_label,
                ts.column_number
             FROM reservations r
             JOIN showtimes    st ON st.id         = r.showtime_id
             JOIN shows        s  ON s.id          = st.show_id
             JOIN theaters     t  ON t.id          = st.theater_id
             JOIN theater_seats ts ON ts.id        = r.seat_id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC`,
			[user_id],
		);

		res.json(rows);
	} catch (err) {
		res.status(500).json({
			error: "Failed to fetch reservations",
			details: err.message,
		});
	} finally {
		if (conn) conn.release();
	}
};

module.exports = {
	createReservation,
	confirmReservation,
	cancelReservation,
	getUserReservations,
};

// Reservations Controller END
