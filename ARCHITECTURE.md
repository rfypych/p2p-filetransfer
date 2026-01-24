# Architecture & Design

## Overview
AirNode (P2P File Transfer) is a client-side Single Page Application (SPA) built with React and Vite. It leverages WebRTC (via PeerJS) for direct peer-to-peer file transfer without storing files on a server.

## Tech Stack
- **Frontend:** React, Vite
- **Styling:** Tailwind CSS
- **P2P Networking:** WebRTC via PeerJS
- **Signaling:** PeerJS Cloud (default public server)
- **Testing:** Vitest

## Core Components

### 1. P2PClient (`src/core/P2PClient.js`)
A framework-agnostic class that encapsulates all P2P logic.
- **Responsibilities:**
  - Manages `Peer` lifecycle (create, destroy).
  - Manages `DataConnection` (connect, close, error).
  - Handles file chunking (sending) and reassembly (receiving).
  - Emits events for UI updates (`status`, `progress`, `file-received`, `error`).
- **Memory Optimization:**
  - Uses **Generator Functions** for file reading to avoid loading the entire file into memory before sending.
  - *Note:* Receiving still requires accumulating chunks in memory (Blob) before download in this version.

### 2. React Hook (`src/hooks/useP2P.js`)
Adapts the `P2PClient` events into React state.
- Provides `connect(id)`, `send(file)`, `reset()` methods to components.
- Exposes reactive state: `status`, `progress`, `error`, etc.

### 3. UI Components (`src/components/`)
- **Hero:** Landing view, choice to Send or Receive.
- **ConnectionPanel:** Shows QR code, ID, or Input field for connecting.
- **FileDropZone:** Drag & drop interface.
- **ProgressBar:** Visual feedback during transfer.

## Data Flow

1. **Signaling (Discovery):**
   - **Sender** creates a Peer ID.
   - **Receiver** inputs Sender's Peer ID.
   - PeerJS Broker connects them via WebRTC (ICE/STUN).

2. **File Transfer Protocol:**
   - **Metadata Handshake:** Sender sends JSON `{ type: 'meta', name, size, mime }`.
   - **Chunk Transfer:** Sender iterates through file, sending `{ type: 'chunk', data, index }` packets.
   - **Completion:** Receiver validates chunk count and builds Blob.

## Limitations
- **Memory:** Large files (>1GB) may crash the receiver tab due to Blob construction in memory.
- **Network:** Symmetric NATs or Corporate Firewalls might block P2P connections (no TURN server configured by default).
