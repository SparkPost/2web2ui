import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';
import * as inboxPlacement from '../inboxPlacement';

jest.mock('src/actions/helpers/sparkpostApiRequest', () => jest.fn(a => a));

describe('Action Creator: Inbox Placement', () => {
  it('it makes request to seed', async () => {
    await inboxPlacement.getSeedList();
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'GET_SEEDS',
      meta: {
        method: 'GET',
        url: '/v1/inbox-placement/seeds',
      },
    });
  });
});
