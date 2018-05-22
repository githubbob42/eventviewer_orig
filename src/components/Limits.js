import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Limits extends Component {
  propTypes: {
    connection: PropTypes.object.isRequired
  };

  render() {
    const { connection } = this.props;
    if (!connection || !connection.limitInfo || !connection.limitInfo.apiUsage)
      return null;
    const { limit, used } = connection.limitInfo.apiUsage;
    const percent = Math.round(used / limit * 100);
    const danger = percent > 90;

    return (
      <div style={{ width: '100%' }}>
        <h4
          className="ui center aligned header"
          style={{ marginBottom: '.25rem' }}
        >
          API Requests
        </h4>
        <div className={`ui blue tiny progress ${danger ? 'error' : ''}`}>
          <div className="bar" style={{ width: percent + '%' }}>
            <div className="progress" />
          </div>
          <div className="label">{used} / {limit} ( {percent}% )</div>
        </div>
      </div>
    );
  }
}

export default Limits;
