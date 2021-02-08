import * as onboarding from '../onboarding';
import config from 'src/config';
jest.mock('src/config');

describe('Onboarding helpers', () => {
  it('Should get correct transmission uri', () => {
    config.apiBase = 'http://with-protocol.com/api';
    expect(onboarding.getTransmissionsUri()).toEqual(
      'http://with-protocol.com/api/v1/transmissions',
    );
  });

  it('Should get correct transmission uri with window protocol', () => {
    config.apiBase = '//no-protocol.co/api';
    expect(onboarding.getTransmissionsUri()).toEqual(
      `${window.location.protocol}//no-protocol.co/api/v1/transmissions`,
    );
  });

  it('Should create a curl request', () => {
    config.apiBase = 'http://api.sparkpost.test';
    expect(onboarding.curlRequest({ apiKey: '12345', email: 'test@test.com' })).toMatchSnapshot();
  });
});
