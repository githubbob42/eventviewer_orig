import React, { Component, PropTypes } from 'react';
import { Header } from 'semantic-ui-react';

class SyncEvents extends Component {
  render() {
    // const { user } = this.props;
    // const { Name, Username, UserRole, Profile } = user || {};

    return (
      <Header as="h3">
        <Header.Content>
          Hello!!!
          <Header.Subheader>
            <strong>welcome to Sync Events</strong>
            &nbsp;
            <br />
            Under Construction
          </Header.Subheader>
        </Header.Content>
      </Header>
    );
  }
}

export default SyncEvents;
