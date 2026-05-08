const pool = require('../db');

// Shows Controller BEGIN

const getShows = async (req, res) => {
    const { theaterId, title, date } = req.query;

    let query = `
        SELECT
            s.id,
            s.title,
            s.description,
            s.duration,
            s.age_rating,
            st.id         AS showtime_id,
            st.start_time,
            st.price,
            t.id          AS theater_id,
            t.name        AS theater_name,
            t.location    AS theater_location
        FROM shows s
        JOIN showtimes st ON st.show_id = s.id
        JOIN theaters t   ON st.theater_id = t.id
        WHERE 1=1
    `;

    const params = [];

    if (theaterId) {
        query += ' AND t.id = ?';
        params.push(theaterId);
    }

    if (title) {
        query += ' AND s.title LIKE ?';
        params.push(`%${title}%`);
    }

    if (date) {
        query += ' AND DATE(st.start_time) = ?';
        params.push(date);
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch shows', details: err.message });
    } finally {
        if (conn) conn.release();
    }
};

const getShowtimeSeats = async (req, res) => {
    const { id } = req.params;

    let conn;
    try {
        conn = await pool.getConnection();

        // Fetch all physical seats for the theater hosting this showtime,
        // and mark each one as available or not based on active reservations
        const rows = await conn.query(
            `SELECT
                ts.id             AS seat_id,
                ts.row_label,
                ts.column_number,
                st.price,
                CASE
                    WHEN r.id IS NOT NULL THEN FALSE
                    ELSE TRUE
                END               AS is_available
             FROM showtimes st
             JOIN theater_seats ts ON ts.theater_id = st.theater_id
             LEFT JOIN reservations r
                ON  r.seat_id     = ts.id
                AND r.showtime_id = st.id
                AND r.status      IN ('PENDING', 'CONFIRMED')
             WHERE st.id = ?
             ORDER BY ts.row_label, ts.column_number`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Showtime not found' });
        }

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch seats', details: err.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    getShows,
    getShowtimeSeats
};

// Shows Controller END