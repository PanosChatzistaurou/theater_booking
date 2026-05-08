# STAGE PASS: THEATER BOOKING SYSTEM

Project for CN6035 MOBILE AND DISTRIBUTED SYSTEMS
Mobile application for cinema reservations.
Frontend: React Native (Expo).
Backend: Node.js (Express).
Persistence: MariaDB.

---

## SYSTEM SPECIFICATIONS

* **Runtime**: Node.js v24.13.1 or higher.
* **Database**: MariaDB v12.2.2 or higher.
* **API Port**: 3000.

---

## 1. BACKEND INSTALLATION

1. Navigate to /backend.
2. Execute `npm install` to link dependencies.
3. Configure environment variables in .env:
```
{
DB_HOST=localhost
DB_USER=root
DB_NAME=theater_booking
DB_PASSWORD=1234
DB_PORT=3306
PORT=3000
JWT_SECRET=your_jwt_secret_string
}
```


4. Execute `node index.js` to start the daemon.

---

## 2. DATABASE ARCHITECTURE

Execute the following SQL definitions in the MariaDB console to initialize the theater_booking schema:
```
{
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `external_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `external_id` (`external_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `theaters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `num_rows` int(11) NOT NULL,
  `num_cols` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `shows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `age_rating` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `showtimes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `show_id` int(11) DEFAULT NULL,
  `theater_id` int(11) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `show_id` (`show_id`),
  KEY `theater_id` (`theater_id`),
  CONSTRAINT `fk_show` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`),
  CONSTRAINT `fk_theater` FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `theater_seats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `theater_id` int(11) DEFAULT NULL,
  `row_label` varchar(5) NOT NULL,
  `column_number` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_physical_seat` (`theater_id`,`row_label`,`column_number`),
  CONSTRAINT `fk_seat_theater` FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `showtime_id` int(11) DEFAULT NULL,
  `seat_id` int(11) DEFAULT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking` (`showtime_id`,`seat_id`),
  KEY `user_id` (`user_id`),
  KEY `seat_id` (`seat_id`),
  CONSTRAINT `fk_res_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_res_showtime` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`),
  CONSTRAINT `fk_res_seat` FOREIGN KEY (`seat_id`) REFERENCES `theater_seats` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
}
```

---

## 3. FRONTEND INSTALLATION

1. Navigate to /frontend.
2. Execute `npm install`.
3. Configure environment variables in .env:

EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IPV4>:3000

4. Start the development server with cache purge: `npx expo start -c`.

---

## CRITICAL OPERATIONAL REQUIREMENTS

* **NETWORKING**: The `EXPO_PUBLIC_API_URL` must use the machine's local IPv4 address.
* **NETWORKING**: Loopback addresses will fail on physical devices.
* **DRAWER NAVIGATION**: The `react-native-reanimated/plugin` must be present in babel.config.js.
* **CACHE MANAGEMENT**: Any modification to .env or significant file relocation requires a full cache purge using the -c flag during startup.

---

## TODO / PENDING WORK

* Implement multi-seat selection logic for single transactions.
* Replace placeholder iconography with new asset package.
* Resolve the unauthorized status code 401/403 trap when initializing the login screen.