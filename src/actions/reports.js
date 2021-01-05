import sparkpostApiRequest from 'src/actions/helpers/sparkpostApiRequest';

export function createReport(data) {
  return sparkpostApiRequest({
    type: 'CREATE_REPORT',
    meta: {
      method: 'POST',
      url: '/v1/reports',
      data,
    },
  });
}

export function updateReport({ id, ...data }) {
  return sparkpostApiRequest({
    type: 'UPDATE_REPORT',
    meta: {
      method: 'PUT',
      url: `/v1/reports/${id}`,
      data,
    },
  });
}

export function getReports() {
  return sparkpostApiRequest({
    type: 'GET_REPORTS',
    meta: {
      method: 'GET',
      url: '/v1/reports',
    },
  });
}

export function deleteReport(id) {
  return sparkpostApiRequest({
    type: 'DELETE_REPORT',
    meta: {
      method: 'DELETE',
      url: `/v1/reports/${id}`,
    },
  });
}

export function getReport(id) {
  return sparkpostApiRequest({
    type: 'GET_REPORT',
    meta: {
      method: 'GET',
      url: `/v1/reports/${id}`,
    },
  });
}

export function createScheduledReport(reportId, data) {
  return sparkpostApiRequest({
    type: 'CREATE_SCHEDULED_REPORT',
    meta: {
      method: 'POST',
      url: `/v1/reports/${reportId}/schedules`,
      data,
    },
  });
}

export function getScheduledReports(reportId) {
  return sparkpostApiRequest({
    type: 'GET_SCHEDULED_REPORTS',
    meta: {
      method: 'GET',
      url: `/v1/reports/${reportId}/schedules`,
    },
  });
}

export function getScheduledReport(reportId, scheduleId) {
  return sparkpostApiRequest({
    type: 'GET_SCHEDULED_REPORT',
    meta: {
      method: 'GET',
      url: `/v1/reports/${reportId}/schedules/${scheduleId}`,
    },
  });
}

export function updateScheduledReport({ reportId, scheduleId, data }) {
  return sparkpostApiRequest({
    type: 'UPDATE_SCHEDULED_REPORT',
    meta: {
      method: 'PUT',
      url: `/v1/reports/${reportId}/schedules/${scheduleId}`,
      data,
    },
  });
}
export function deleteScheduledReport(reportId, scheduleId) {
  return sparkpostApiRequest({
    type: 'DELETE_SCHEDULED_REPORT',
    meta: {
      method: 'DELETE',
      url: `/v1/reports/${reportId}/schedules/${scheduleId}`,
    },
  });
}

export function testScheduledReport({ reportId, name, subject, recipients }) {
  return sparkpostApiRequest({
    type: 'TEST_SCHEDULED_REPORT',
    meta: {
      method: 'POST',
      url: `/v1/reports/${reportId}/schedules/test`,
      data: {
        name,
        subject,
        recipients,
      },
    },
  });
}
