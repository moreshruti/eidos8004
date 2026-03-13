import { test, expect, describe } from 'bun:test';
import { mockDesigns, mockAgents, mockAttributions, mockMetrics } from '../mock-data';

// ---------------------------------------------------------------------------
// mockDesigns
// ---------------------------------------------------------------------------

describe('mockDesigns', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(mockDesigns)).toBe(true);
    expect(mockDesigns.length).toBeGreaterThan(0);
  });

  test('each design has the required DesignMetadata fields with correct types', () => {
    for (const design of mockDesigns) {
      expect(typeof design.tokenId).toBe('number');
      expect(typeof design.title).toBe('string');
      expect(typeof design.category).toBe('string');
      expect(Array.isArray(design.tags)).toBe(true);
      expect(typeof design.baseRoyaltyBps).toBe('number');
      expect(typeof design.isPublic).toBe('boolean');
      expect(typeof design.ipfsHash).toBe('string');
      expect(typeof design.creator).toBe('string');
      expect(typeof design.createdAt).toBe('number');
    }
  });

  test('every ipfsHash starts with "Qm"', () => {
    for (const design of mockDesigns) {
      expect(design.ipfsHash.startsWith('Qm')).toBe(true);
    }
  });

  test('tokenIds are unique', () => {
    const ids = mockDesigns.map((d) => d.tokenId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// mockAgents
// ---------------------------------------------------------------------------

describe('mockAgents', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(mockAgents)).toBe(true);
    expect(mockAgents.length).toBeGreaterThan(0);
  });

  test('each agent has the required Agent fields with correct types', () => {
    for (const agent of mockAgents) {
      expect(typeof agent.address).toBe('string');
      expect(typeof agent.name).toBe('string');
      expect(typeof agent.description).toBe('string');
      expect(typeof agent.wallet).toBe('string');
      expect(Array.isArray(agent.capabilities)).toBe(true);
      expect(agent.capabilities.length).toBeGreaterThan(0);
      expect(typeof agent.agentCardURI).toBe('string');
      expect(typeof agent.trustScore).toBe('number');
      expect(typeof agent.isActive).toBe('boolean');
      expect(typeof agent.registeredAt).toBe('number');
    }
  });

  test('trustScore is between 0 and 100 for every agent', () => {
    for (const agent of mockAgents) {
      expect(agent.trustScore).toBeGreaterThanOrEqual(0);
      expect(agent.trustScore).toBeLessThanOrEqual(100);
    }
  });

  test('addresses are unique', () => {
    const addrs = mockAgents.map((a) => a.address);
    expect(new Set(addrs).size).toBe(addrs.length);
  });
});

// ---------------------------------------------------------------------------
// mockAttributions
// ---------------------------------------------------------------------------

describe('mockAttributions', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(mockAttributions)).toBe(true);
    expect(mockAttributions.length).toBeGreaterThan(0);
  });

  test('each attribution has the required Attribution fields with correct types', () => {
    for (const attr of mockAttributions) {
      expect(typeof attr.id).toBe('number');
      expect(typeof attr.agentAddress).toBe('string');
      expect(typeof attr.designerAddress).toBe('string');
      expect(typeof attr.designId).toBe('number');
      expect(typeof attr.usageType).toBe('string');
      expect(typeof attr.royaltyAmount).toBe('string');
      expect(typeof attr.timestamp).toBe('number');
    }
  });

  test('usageType is one of the known values', () => {
    const allowed = ['direct_usage', 'inspiration', 'training'];
    for (const attr of mockAttributions) {
      expect(allowed).toContain(attr.usageType);
    }
  });

  test('ids are unique', () => {
    const ids = mockAttributions.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// mockMetrics
// ---------------------------------------------------------------------------

describe('mockMetrics', () => {
  test('has the required DesignerMetrics fields with correct types', () => {
    expect(typeof mockMetrics.totalEarned).toBe('string');
    expect(typeof mockMetrics.totalAttributions).toBe('number');
    expect(typeof mockMetrics.activeDesigns).toBe('number');
    expect(typeof mockMetrics.uniqueAgents).toBe('number');
    expect(Array.isArray(mockMetrics.monthlyEarnings)).toBe(true);
  });

  test('monthlyEarnings is non-empty and each entry has month and amount', () => {
    expect(mockMetrics.monthlyEarnings.length).toBeGreaterThan(0);
    for (const entry of mockMetrics.monthlyEarnings) {
      expect(typeof entry.month).toBe('string');
      expect(typeof entry.amount).toBe('number');
    }
  });

  test('numeric metrics are positive', () => {
    expect(mockMetrics.totalAttributions).toBeGreaterThan(0);
    expect(mockMetrics.activeDesigns).toBeGreaterThan(0);
    expect(mockMetrics.uniqueAgents).toBeGreaterThan(0);
    expect(parseFloat(mockMetrics.totalEarned)).toBeGreaterThan(0);
  });
});
