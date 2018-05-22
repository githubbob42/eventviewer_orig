import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';

class User extends Component {
  propTypes: {
    connection: PropTypes.object.isRequired,
    user: PropTypes.object
  };

  render() {
    const { user } = this.props;
    const { Name, Username, UserRole, Profile } = user || {};

    return (
      <Header as="h3">
        <Header.Content>
          {Name}&nbsp;
          <Header.Subheader>
            <strong>{(UserRole && UserRole.Name) || Profile.Name}</strong>
            &nbsp;
            <br />
            {Username}&nbsp;
          </Header.Subheader>
        </Header.Content>
      </Header>
    );
  }
}

export default User;
