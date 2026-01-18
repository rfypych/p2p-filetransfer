# AirNode - P2P File Transfer

Simple, secure, and fast peer-to-peer file transfer directly in your browser. No servers, no size limits*, no tracking.
Wrapped in a "Minimalist Editorial" interface designed for focus and clarity.

## Features
- 🚀 **Direct P2P:** Files go directly from device to device.
- 🔒 **Secure:** End-to-end encryption via WebRTC.
- ⚡ **Fast:** No upload to server required.
- 📱 **Responsive:** Works on Mobile and Desktop.
- 🎨 **Minimalist UI:** Distraction-free, typography-led design (Dark Mode).

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- NPM or Bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

### Build
Build for production:
```bash
npm run build
```

### Testing
Run unit tests:
```bash
npm test
```

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for details on the internal design.

## How it Works
1. **Sender** opens the app and clicks "Start Sending".
2. A unique Connection ID (and QR code) is generated.
3. **Sender** shares this ID with the **Receiver**.
4. **Receiver** opens the app, clicks "Receive a File", and enters the ID (or scans QR).
5. Once connected, Sender drops a file, and it transfers directly!

## *Limitations
- Currently optimizes for files under 500MB-1GB due to browser memory constraints on the receiver side.
