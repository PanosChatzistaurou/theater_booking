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

DB_HOST=localhost
DB_USER=root
DB_NAME=theater_booking
DB_PASSWORD=1234
DB_PORT=3306
PORT=3000
JWT_SECRET=your_jwt_secret_string
```
If you want sign-in with google to work, you should set up auth0 and a google client and add these variables in .env as well
```
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER_URL=your_issuer_url
```

4. Execute `node index.js` to start the daemon.

---

## 2. DATABASE ARCHITECTURE

Execute the following SQL definitions in the MariaDB console to initialize the theater_booking schema:
```
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


-- MOCK DATA REQUIRED FOR TESTING (Execute after schema creation)

-- Insert 3 Theaters
INSERT INTO theaters (name, location, num_rows, num_cols) VALUES 
('Grand Cinema', 'Uptown', 4, 4),
('Starlight Studio', 'Midtown', 4, 4),
('Indie House', 'Downtown', 4, 4);

-- Insert 4x4 seats for Theater 1
INSERT INTO theater_seats (theater_id, row_label, column_number) VALUES 
(1, 'A', 1), (1, 'A', 2), (1, 'A', 3), (1, 'A', 4),
(1, 'B', 1), (1, 'B', 2), (1, 'B', 3), (1, 'B', 4),
(1, 'C', 1), (1, 'C', 2), (1, 'C', 3), (1, 'C', 4),
(1, 'D', 1), (1, 'D', 2), (1, 'D', 3), (1, 'D', 4);

-- Insert 4x4 seats for Theater 2
INSERT INTO theater_seats (theater_id, row_label, column_number) VALUES 
(2, 'A', 1), (2, 'A', 2), (2, 'A', 3), (2, 'A', 4),
(2, 'B', 1), (2, 'B', 2), (2, 'B', 3), (2, 'B', 4),
(2, 'C', 1), (2, 'C', 2), (2, 'C', 3), (2, 'C', 4),
(2, 'D', 1), (2, 'D', 2), (2, 'D', 3), (2, 'D', 4);

-- Insert 4x4 seats for Theater 3
INSERT INTO theater_seats (theater_id, row_label, column_number) VALUES 
(3, 'A', 1), (3, 'A', 2), (3, 'A', 3), (3, 'A', 4),
(3, 'B', 1), (3, 'B', 2), (3, 'B', 3), (3, 'B', 4),
(3, 'C', 1), (3, 'C', 2), (3, 'C', 3), (3, 'C', 4),
(3, 'D', 1), (3, 'D', 2), (3, 'D', 3), (3, 'D', 4);

-- Insert 2 Shows
INSERT INTO shows (title, description, duration, age_rating) VALUES 
('The Cosmic Journey', 'A sci-fi epic spanning galaxies.', 145, 'PG-13'),
('Midnight Shadows', 'A tense mystery thriller.', 110, 'R');

-- Insert 3 Showtimes for Show 1 (The Cosmic Journey)
INSERT INTO showtimes (show_id, theater_id, start_time, price) VALUES 
(1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 18.50),
(1, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 20.00),
(1, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), 15.00);

-- Insert 3 Showtimes for Show 2 (Midnight Shadows)
INSERT INTO showtimes (show_id, theater_id, start_time, price) VALUES 
(2, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 18.50),
(2, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), 20.00),
(2, 3, DATE_ADD(NOW(), INTERVAL 3 DAY), 15.00);
```

---

## 3. FRONTEND INSTALLATION

1. Navigate to /frontend.
2. Execute `npm install`.
3. Configure environment variables in .env:

```
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IPV4>:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_ID=your_google_android_id
EXPO_PUBLIC_REDIRECT_URI=https://auth.expo.io/@frontend/frontend
EXPO_PUBLIC_AUTH0_CLIENT_ID=your_auth0_client_id
EXPO_PUBLIC_AUTH_ENDPOINT=your_auth_endpoint
EXPO_PUBLIC_TOKEN_ENDPOINT=your_token_endpoint
```

4. Start the development server with cache purge: `npx expo start -c`.

---

## CRITICAL OPERATIONAL REQUIREMENTS

* **AUTH0 DASHBOARD**: You must add `https://auth.expo.io/@frontend/frontend` to both "Allowed Callback URLs" and "Allowed Web Origins" for Google Sign-In to function in Expo Go.
* **STANDALONE BUILDS**: To compile for production (APK/IPA), define a custom `"scheme"` in `app.json`, update `EXPO_PUBLIC_REDIRECT_URI` in `.env`, and whitelist the new URI in Auth0.
* **NETWORKING**: The `EXPO_PUBLIC_API_URL` must use the machine's local IPv4 address.
* **NETWORKING**: Loopback addresses will fail on physical devices.
* **DRAWER NAVIGATION**: The `react-native-reanimated/plugin` must be present in babel.config.js.
* **CACHE MANAGEMENT**: Any modification to .env or significant file relocation requires a full cache purge using the -c flag during startup.

---

## TODO / PENDING WORK

