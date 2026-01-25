
# AirNode ☁️
> **Secure, Serverless, Peer-to-Peer File Transfer & Anonymous Chat**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Privacy](https://img.shields.io/badge/Privacy-First-green)

AirNode is a modern, privacy-focused web application that enables **direct device-to-device file transfer** and **anonymous encrypted chat** directly in your browser. No middleman servers, no file tracking, just pure P2P connection wrapped in a stunning, minimalist editorial design.

---

## ✨ Key Features

### 🚀 Direct P2P File Transfer
transfer files of any type directly between devices using **WebRTC**.
- **No Size Limits**: Transfer what your browser memory handles.
- **No Cloud Storage**: Files never touch our servers.
- **Fast**: utilized local network speed when possible.

### 🕵️ Anonymous Encrypted Chat
Instant messaging without accounts or logs.
- **End-to-End Encryption**: AES-256-GCM encryption for all messages.
- **Anonymous Lobby**: Discover peers in a secure, ephemeral lobby.
- **Connection Requests**: Consent-based P2P connection system - you choose who connects to you.

### 🛡️ Security First
- **Ephemeral IDs**: Peer IDs are randomly generated and vanish on session close.
- **No Tracking**: No Google Analytics, no behavioral profiling pixels.
- **DTLS Encryption**: All data channels secured by standard WebRTC encryption methods.

### 🎨 Premium UI/UX
- **Minimalist Editorial Design**: Focus on content and clarity.
- **Responsive**: Flawless experience on Desktop, Tablet, and Mobile.
- **Interactive**: Smooth animations powered by Framer Motion.

---

## 🛠️ Tech Stack

### Core
- **Frontend**: [React 18](https://reactjs.org/) (Vite)
- **Language**: JavaScript (ES6+)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (FontAwesome, etc.)

### Connectivity & Data
- **P2P Signaling**: [PeerJS](https://peerjs.com/) (WebRTC wrapper)
- **Lobby/Signaling**: [Firebase Realtime Database](https://firebase.google.com/)
- **Encryption**: [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (AES-GCM, PBKDF2)

### Animations
- **Motion**: [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- NPM, Yarn, or Bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/airnode.git
   cd airnode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ...
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 📖 How It Works

### File Transfer
1. **User A (Sender)** gets a unique 6-character Connection ID.
2. **User A** shares this ID with **User B (Receiver)**.
3. **User B** enters the ID.
4. **Direct WebRTC connection** is established.
5. Files stream directly from A to B.

### Anonymous Lobby
1. Users join a shared "Lobby" with ephemeral usernames (e.g., `User_a1b2`).
2. Global chat messages are **encrypted client-side** with a shared secret before sending to Firebase.
3. To chat privately or transfer files, User A clicks on User B to send a **Connection Request**.
4. User B **accepts** the request.
5. Secure P2P private channel is established.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with 🧠 for Privacy</p>
  <p>© 2026 AirNode</p>
</div>
