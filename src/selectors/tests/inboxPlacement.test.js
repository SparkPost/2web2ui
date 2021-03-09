import { selectReferenceSeed } from '../inboxPlacement';

describe('Selectors: Inbox Placement', () => {
  describe('selectReferenceSeed', () => {
    let state;
    beforeEach(() => {
      state = {
        inboxPlacement: {
          seeds: ['foo@bar.com', 'abc@xyz.com', 'refSeed@seed.sparkpost.com'],
        },
      };
    });

    it('returns first reference seed', () => {
      expect(selectReferenceSeed(state)).toEqual('refSeed@seed.sparkpost.com');
    });

    it('returns first undefined if no reference seed found', () => {
      state.inboxPlacement.seeds.pop();
      expect(selectReferenceSeed(state)).toBe(undefined);
    });
  });
});
