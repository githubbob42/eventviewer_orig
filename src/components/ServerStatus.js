import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as api from '../api/api';

const ICON = {
  OK: 'green check circle',
  MAJOR_INCIDENT_CORE: 'red remove',
  MINOR_INCIDENT_CORE: 'yellow configure',
  MAINTENANCE_CORE: 'yellow configure',
  INFORMATIONAL_CORE: 'blue info circle',
  MAJOR_INCIDENT_NONCORE: 'red remove',
  MINOR_INCIDENT_NONCORE: 'yellow configure',
  MAINTENANCE_NONCORE: 'blue info circle',
  INFORMATIONAL_NONCORE: 'blue info circle'
};

class ServerStatus extends Component {
  propTypes: {
    connection: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      trust: null
    };
  }

  componentWillMount() {
    const { connection } = this.props;
    connection &&
      api.fetchTrustInfo(connection).then(trust => this.setState({ trust }));
  }

  renderInstanceStatus() {
    const { trust } = this.state;
    if (!trust) return null;

    return (
      <div className="item">
        Server <strong>{trust.key}</strong>
        <span data-tooltip={trust.releaseVersion} data-position="bottom center">
          <i className={`${ICON[trust.status]} icon`} />
        </span>
      </div>
    );
  }

  render() {
    const { connection } = this.props;
    if (!connection) return null;

    return (
      <div className="ui list">
        {this.renderInstanceStatus()}
        <div className="item">
          API Version <strong>{connection.version}</strong>
        </div>
      </div>
    );
  }
}

export default ServerStatus;
