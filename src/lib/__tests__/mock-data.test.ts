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
      expect(typeof design.artist).toBe('string');
      expect(typeof design.title).toBe('string');
      expect(typeof design.description).toBe('string');
      expect(typeof design.category).toBe('string');
      expect(typeof design.ipfsCid).toBe('string');
      expect(Array.isArray(design.tags)).toBe(true);
      expect(typeof design.thresholdPrice).toBe('bigint');
      expect(typeof design.createdAt).toBe('number');
      expect(typeof design.isPublic).toBe('boolean');
    }
  });

  test('every ipfsCid starts with "Qm"', () => {
    for (const design of mockDesigns) {
      expect(design.ipfsCid.startsWith('Qm')).toBe(true);
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
      expect(typeof agent.agentId).toBe('number');
      expect(typeof agent.wallet).toBe('string');
      expect(typeof agent.agentType).toBe('number');
      expect(typeof agent.name).toBe('string');
      expect(typeof agent.description).toBe('string');
      expect(typeof agent.capabilitiesURI).toBe('string');
      expect(typeof agent.registeredAt).toBe('number');
      expect(typeof agent.active).toBe('boolean');
    }
  });

  test('reputationScore is between 0 and 100 for every agent that has one', () => {
    for (const agent of mockAgents) {
      if (agent.reputationScore !== undefined) {
        expect(agent.reputationScore).toBeGreaterThanOrEqual(0);
        expect(agent.reputationScore).toBeLessThanOrEqual(100);
      }
    }
  });

  test('agentIds are unique', () => {
    const ids = mockAgents.map((a) => a.agentId);
    expect(new Set(ids).size).toBe(ids.length);
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
      expect(typeof attr.designId).toBe('number');
      expect(typeof attr.clientAgent).toBe('string');
      expect(typeof attr.artistAgent).toBe('string');
      expect(typeof attr.artist).toBe('string');
      expect(Array.isArray(attr.artifactIds)).toBe(true);
      expect(typeof attr.totalPaid).toBe('string');
      expect(typeof attr.x402ProofHash).toBe('string');
      expect(typeof attr.timestamp).toBe('number');
    }
  });

  test('x402ProofHash starts with 0x', () => {
    for (const attr of mockAttributions) {
      expect(attr.x402ProofHash.startsWith('0x')).toBe(true);
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
