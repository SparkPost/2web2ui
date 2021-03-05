import * as support from '../support';
import * as formActions from 'redux-form';
import { selectSupportIssues } from 'src/selectors/support';

jest.mock('../helpers/sparkpostApiRequest');
jest.mock('src/selectors/support');

describe('Action Creator: Support', () => {
  let dispatchMock;
  let getStateMock;

  beforeEach(() => {
    dispatchMock = jest.fn(a => a);
    getStateMock = jest.fn();
    formActions.change = jest.fn(a => a);
  });

  it('should close support panel', () => {
    const action = support.closeSupportPanel();
    expect(action).toMatchSnapshot();
  });

  it('should open support panel', () => {
    const action = support.openSupportPanel();
    expect(action).toMatchSnapshot();
  });

  it('should open support panel with specific view', () => {
    const action = support.openSupportPanel({ view: 'ticket' });
    expect(action).toMatchSnapshot();
  });

  describe('openSupportTicketForm', () => {
    it('should open support panel', () => {
      support.openSupportTicketForm()(dispatchMock, getStateMock);
      expect(dispatchMock).toMatchSnapshot();
    });

    it('should open support panel and set support ticket message', () => {
      support.openSupportTicketForm({ message: 'test' })(dispatchMock, getStateMock);
      expect(formActions.change).toHaveBeenCalledWith('support-form', 'message', 'test');
      expect(formActions.change).toHaveBeenCalledTimes(1);
    });

    it('should open support panel and set support ticket issue', () => {
      const stateMock = {};
      getStateMock.mockImplementation(() => stateMock);
      selectSupportIssues.mockImplementation(() => [{ id: 'technical_errors' }]);
      support.openSupportTicketForm({ issueId: 'technical_errors' })(dispatchMock, getStateMock);
      expect(formActions.change).toHaveBeenCalledWith(
        'support-form',
        'issueId',
        'technical_errors',
      );
      expect(formActions.change).toHaveBeenCalledTimes(1);
      expect(selectSupportIssues).toHaveBeenCalledWith(stateMock);
    });
  });

  describe('createTicket', () => {
    it('should create a ticket', () => {
      const ticket = { issueType: 'billing', subject: 'sub', message: 'mess' };
      expect(support.createTicket(ticket)).toMatchSnapshot();
    });
  });
});
