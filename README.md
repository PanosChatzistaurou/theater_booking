# Theater Booking System

Mobile app for cinema reservations with a Node.js/MariaDB backend.

## 1. Backend Setup

1. Navigate to `/backend`.
2. Run `npm install`.
3. Create `.env` in the backend root:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=theater_db
JWT_SECRET=any_random_string
```
4. Run `node index.js`.

## 2. Database Setup

Execute this in MariaDB to initialize tables:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255)
);

CREATE TABLE theaters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL
);
```

## 3. Frontend Setup

1. Navigate to `/frontend`.
2. Run `npm install`.
3. Create `.env` in the frontend root:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:3000
```
4. Start the app: `npx expo start -c`

---

## 🛠 Critical Requirements

* **IP Match**: Replace `<YOUR_LOCAL_IP>` with your machine's IPv4 (e.g., `192.168.1.7`). `localhost` will fail on physical devices.
* **Firewall**: Open port `3000` for inbound traffic on your computer.
* **Cache**: Use the `-c` flag when starting Expo after any `.env` changes.
* **Git**: Ensure `.env` files are not pushed to the repository.
````</YOUR_LOCAL_IP>