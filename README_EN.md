# 🧠 Pi Cloud

A lightweight, modern **cloud storage system** with server-side **encryption** and **compression**, optimized for devices like the **Raspberry Pi**.  
The file processing is powered by native **C++ algorithms from the FileInSight project**, integrated as a DLL for maximum efficiency and data security.

---

## 🚀 Features

- 📤 **File uploads & downloads** via a clean, modern web interface  
- 🔐 **Server-side encryption & compression** using FileInSight algorithms (C++ → DLL via JNA)  
- 🧩 **Frontend/Backend separation** – no server restart required for UI changes  
- 🗑️ **File management** – upload, download, delete, view metadata  
- 🧠 **Smart file handling** with MIME type detection and custom icons  
- 🎨 **Responsive UI** – pure HTML/CSS/JavaScript (no framework needed)  
- 💾 **Spring Boot + JPA backend** for persistent file management  

---

## 🏗️ Project Structure

```
PiCloud/
├── src/main/java/com/picloud/
│   ├── PiCloudApplication.java        # Spring Boot entry point
│   ├── controller/
│   │   └── CloudController.java       # REST API for file operations
│   ├── service/
│   │   └── CloudService.java          # Core business logic
│   ├── model/
│   │   └── FileEntity.java            # JPA entity for files
│   └── repository/
│       └── FileEntityRepository.java  # JPA repository interface
│
├── src/main/resources/static/
│   ├── index.html                     # Frontend
│   ├── script.js                      # Fetch API logic
│   └── style.css                      # Styling
│
└── README.md
```

---

## ⚙️ Tech Stack

| Component | Technology |
|------------|-------------|
| Backend | Spring Boot (REST, JPA) |
| Frontend | HTML5, CSS3, Vanilla JS |
| Database | H2 / SQLite / PostgreSQL (configurable) |
| Native Module | FileInSight C++ DLL (encryption & compression) |
| Bridge | Java Native Access (JNA) |
| Target Platform | Raspberry Pi / Linux / Windows |

---

## 🔒 Server-Side Encryption & Compression

Pi Cloud integrates **FileInSight's native C++ algorithms** through a **DLL**, loaded via **JNA**.  
These modules handle:

- **AES-based file encryption**
- **FileInSight compression (LZ77/TLSH-inspired)**
- **On-the-fly processing** during uploads/downloads
- **Cross-platform compatibility** (Windows → Debug, Raspberry Pi → Release)

**Benefits:**  
- No dependency on Java's crypto libraries  
- Higher performance via native execution  
- Secure key management outside the JVM  

---

## 🧑‍💻 API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/api/files/list` | Returns all stored files |
| `POST` | `/api/files/upload` | Upload one or more files |
| `GET` | `/api/files/download/{id}` | Download a specific file |
| `GET` | `/api/files/delete/{id}` | Delete a file |

---

## 🧰 Installation & Setup

### 🔹 Requirements

- Java 17+  
- Maven or Gradle  
- (Optional) Node.js / Vite for frontend development  
- Compiled `FileInSight.dll` (or `.so` on Linux)  
- Raspberry Pi OS / Windows / Linux x64  

### 🔹 Run

```bash
# 1. Build the project
mvn clean package

# 2. Start the server
java -jar target/pi-cloud.jar

# 3. Open in browser
http://localhost:8080
```

---

## 🧩 Frontend Features

- Dynamic file listing using `fetch('/api/files/list')`  
- File preview before upload  
- MIME-type-based file icons  
- Responsive design with dark mode support  
- Smooth button animations for uploads/downloads  

---

## 🧪 Development Mode (Frontend Separation)

For faster frontend development without restarting Spring Boot:

```bash
# 1. Run backend
mvn spring-boot:run

# 2. Run frontend separately (e.g., using Vite or Live Server)
npm install
npm run dev
```

> The frontend communicates with the backend via `/api/*` proxy routes.

---

## 📦 Deployment (Raspberry Pi)

1. Copy `FileInSight.so` to `/usr/local/lib/`  
2. Run `pi-cloud.jar`  
3. Configure autostart using `systemd` or `crontab`  

---

## 📜 License

MIT License – 2025 © Your Name
