import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import qs from 'query-string';
import { relativeDateOptions } from 'src/helpers/date';
import { Button, Checkbox, Panel, WindowEvent, Modal, Stack } from 'src/components/matchbox';
import { CopyField } from 'src/components';
import { onEnter } from 'src/helpers/keyEvents';
import _ from 'lodash';

export class ShareModal extends Component {
  state = {
    pinned: true,
    open: false,
  };

  componentDidMount() {
    this.updateLink();
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(prevProps.searchOptions, this.props.searchOptions)) {
      this.updateLink();
    }
  }

  updateLink = () => {
    const { searchOptions, history, location } = this.props;
    const search = qs.stringify(searchOptions);

    history.replace({ pathname: location.pathname, search });
  };

  getLink() {
    const { searchOptions } = this.props;
    const { pinned } = this.state;
    const modifiedQuery = { ...searchOptions };

    if (pinned) {
      modifiedQuery.range = 'custom';
    }

    if (modifiedQuery.range !== 'custom') {
      delete modifiedQuery.from;
      delete modifiedQuery.to;
    }

    const search = qs.stringify(modifiedQuery);
    const url = window.location.href.split('?')[0];

    return `${url}?${search}`;
  }

  handleKeydown = e => {
    onEnter(this.toggleModal)(e);
  };

  handlePin = () => {
    this.setState({ pinned: !this.state.pinned });
  };

  toggleModal = () => {
    this.setState({ open: !this.state.open });
  };

  renderPinToggle() {
    const { searchOptions } = this.props;
    const { pinned } = this.state;
    const relativeRange = relativeDateOptions.find(item => item.value === searchOptions.range);
    const isRelative = relativeRange && searchOptions.range !== 'custom';

    if (!isRelative) {
      return null;
    }

    return (
      <Checkbox
        id="pin-relative-link"
        label="Pin dates for this link"
        checked={pinned}
        onChange={this.handlePin}
        helpText="Pins this report's relative time range to its calculated dates (this is usually what
          you want when sharing a report)."
      />
    );
  }

  render() {
    const { open } = this.state;
    const { triggerComponent: TriggerComponent } = this.props;

    return (
      <Fragment>
        {TriggerComponent ? (
          <TriggerComponent
            id="shareModalButton"
            disabled={this.props.disabled}
            onClick={this.toggleModal}
          />
        ) : (
          <Button
            id="shareModalButton"
            disabled={this.props.disabled}
            fullWidth
            onClick={this.toggleModal}
            variant="secondary"
          >
            Share
          </Button>
        )}
        <Modal.LEGACY open={open} onClose={this.toggleModal} showCloseButton={true}>
          {open && <WindowEvent event="keydown" handler={this.handleKeydown} />}
          <Panel.LEGACY title="Share this report">
            <Panel.LEGACY.Section>
              <Stack>
                <CopyField value={this.getLink()} />
                {this.renderPinToggle()}
              </Stack>
            </Panel.LEGACY.Section>
            <Panel.LEGACY.Section>
              <Button variant="primary" onClick={this.toggleModal}>
                Done
              </Button>
            </Panel.LEGACY.Section>
          </Panel.LEGACY>
        </Modal.LEGACY>
      </Fragment>
    );
  }
}

export default withRouter(connect(null, {})(ShareModal));
