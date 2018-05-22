import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as api from '../api/api';

class Organization extends Component {
  propTypes: {
    connection: PropTypes.object.isRequired,
    identity: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      organization: null
    };
  }

  componentWillMount() {
    return this.fetchData(this.props);
  }

  componentWillUpdate(nextProps) {
    const { identity } = nextProps;
    if (identity !== this.props.identity) return this.fetchData(nextProps);
  }

  fetchData({ connection, identity }) {
    if (!identity) return;

    return api.fetchOrganization(
      connection,
      identity.organization_id
    ).then(organization => this.setState({ organization }));
  }

  render() {
    const { organization } = this.state;
    if (!organization) return null;

    const { Name, OrganizationType } = organization || {};

    return (
      <h4 className="ui header">
        <div className="content">
          {Name}
          <div className="sub header">
            {OrganizationType}
          </div>
        </div>
      </h4>
    );
  }
}

export default Organization;
