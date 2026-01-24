import { describe, it, expect, vi, beforeEach } from 'vitest';
import { P2PClient, P2P_EVENTS } from '../core/P2PClient';
import Peer from 'peerjs';

const mockOn = vi.fn();
const mockConnect = vi.fn();
const mockDestroy = vi.fn();

// Mock PeerJS module correctly
vi.mock('peerjs', () => {
    return {
        // Must use a regular function to be constructible with 'new'
        default: vi.fn(function() {
            this.on = mockOn;
            this.connect = mockConnect;
            this.destroy = mockDestroy;
            this.id = 'mock-id';
        })
    };
});

// Mock DataConnection
const mockConnOn = vi.fn();
const mockConnSend = vi.fn();
const mockConnClose = vi.fn();

const MockConn = {
    on: mockConnOn,
    send: mockConnSend,
    close: mockConnClose,
    open: true,
    peer: 'remote-peer-id'
};

describe('P2PClient', () => {
    let client;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new P2PClient();
    });

    it('should initialize in idle state', () => {
        expect(client.status).toBe('idle');
    });

    it('should initialize peer on calling initialize()', () => {
        client.initialize();
        expect(Peer).toHaveBeenCalled();
        expect(mockOn).toHaveBeenCalledWith('open', expect.any(Function));
    });

    it('should update status to waiting when peer opens', () => {
        client.initialize();

        // Find the 'open' callback from the mock
        const openCall = mockOn.mock.calls.find(call => call[0] === 'open');
        const openCallback = openCall[1];

        const statusListener = vi.fn();
        client.addEventListener(P2P_EVENTS.STATUS, (e) => statusListener(e.detail));

        openCallback('my-id');

        expect(client.peerId).toBe('my-id');
        expect(statusListener).toHaveBeenCalledWith('waiting');
    });

    it('should connect to remote peer', () => {
        client.initialize();
        client.peerId = 'my-id';

        // Mock connect returning our MockConn
        mockConnect.mockReturnValue(MockConn);

        client.connect('remote-id');

        expect(mockConnect).toHaveBeenCalledWith('remote-id', expect.objectContaining({ reliable: true }));
        // Connection handling
        expect(MockConn.on).toHaveBeenCalledWith('open', expect.any(Function));
    });

    it('should handle incoming file metadata', () => {
        // Setup connected state manually for test
        client.connection = MockConn;
        client.status = 'connected';

        const progressListener = vi.fn();
        client.addEventListener(P2P_EVENTS.PROGRESS, (e) => progressListener(e.detail));

        // Simulate receiving data
        client._handleData({
            type: 'meta',
            name: 'test.txt',
            size: 1000,
            mimeType: 'text/plain',
            totalChunks: 2
        });

        expect(client.status).toBe('transferring');
        expect(progressListener).toHaveBeenCalledWith({ percent: 0, speed: 0 });
    });
});
