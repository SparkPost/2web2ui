import * as reports from '../reports';
import sparkpostApiRequest from '../helpers/sparkpostApiRequest';

jest.mock('src/actions/helpers/sparkpostApiRequest');

describe('Action Creator: Reports', () => {
  it('it makes request to list saved reports', async () => {
    await reports.getReports();
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'GET_REPORTS',
      meta: {
        method: 'GET',
        url: '/v1/reports',
      },
    });
  });

  it('it makes request to get a specific report', async () => {
    await reports.getReport('abc123');
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'GET_REPORT',
      meta: {
        method: 'GET',
        url: `/v1/reports/abc123`,
        showErrorAlert: false,
      },
    });
  });

  it('it makes request to create a saved report', async () => {
    const formData = { foo: 'bar' };
    await reports.createReport(formData);
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'CREATE_REPORT',
      meta: {
        method: 'POST',
        url: `/v1/reports`,
        data: formData,
      },
    });
  });

  it('it makes request to update a specific saved report', async () => {
    const formData = { foo: 'bar' };
    await reports.updateReport({ id: 'abc123', ...formData });
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'UPDATE_REPORT',
      meta: {
        method: 'PUT',
        url: `/v1/reports/abc123`,
        data: formData,
      },
    });
  });

  it('it makes request to delete a saved report', async () => {
    await reports.deleteReport('foo');
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'DELETE_REPORT',
      meta: {
        method: 'DELETE',
        url: `/v1/reports/foo`,
      },
    });
  });

  it('it makes request to list scheduled reports', async () => {
    await reports.getScheduledReports('foo');
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'GET_SCHEDULED_REPORTS',
      meta: {
        method: 'GET',
        url: '/v1/reports/foo/schedules',
      },
    });
  });

  it('it makes request to get a specific scheduled report', async () => {
    await reports.getScheduledReport('foo', 'bar');
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'GET_SCHEDULED_REPORT',
      meta: {
        method: 'GET',
        url: `/v1/reports/foo/schedules/bar`,
        showErrorAlert: false,
      },
    });
  });

  it('it makes request to create a scheduled report', async () => {
    const formData = { foo: 'bar' };
    await reports.createScheduledReport('foo', formData);
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'CREATE_SCHEDULED_REPORT',
      meta: {
        method: 'POST',
        url: `/v1/reports/foo/schedules`,
        data: formData,
      },
    });
  });

  it('it makes request to update a specific scheduled report', async () => {
    const formData = { foo: 'bar' };
    await reports.updateScheduledReport({
      reportId: 'abc123',
      scheduleId: 'zyx987',
      data: formData,
    });
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'UPDATE_SCHEDULED_REPORT',
      meta: {
        method: 'PUT',
        url: `/v1/reports/abc123/schedules/zyx987`,
        data: formData,
      },
    });
  });

  it('it makes request to test sending a scheduled report', async () => {
    await reports.deleteScheduledReport('foo', 'bar');
    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'DELETE_SCHEDULED_REPORT',
      meta: {
        method: 'DELETE',
        url: `/v1/reports/foo/schedules/bar`,
      },
    });
  });
  it('it makes request to send a test scheduled report', async () => {
    const formData = { name: 'foo', subject: 'bar', recipients: ['me'] };
    await reports.testScheduledReport({ reportId: 'foo', ...formData });

    expect(sparkpostApiRequest).toHaveBeenCalledWith({
      type: 'TEST_SCHEDULED_REPORT',
      meta: {
        method: 'POST',
        url: `/v1/reports/foo/schedules/test`,
        data: formData,
      },
    });
  });
});
