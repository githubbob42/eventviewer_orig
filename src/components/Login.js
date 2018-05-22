import React, { Component } from 'react';
import * as api from '../api/api';
import jsforce from 'jsforce';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginUrl: localStorage.getItem('loginUrl') || api.ENVIRONMENTS.PRODUCTION,
      username: localStorage.getItem('username') || '',
      password: '',
      error: this.props.error
    };
  }

  componentWillMount() {
    const { onLogin, connection } = this.props;
    if (global.salesforce && global.salesforce.sessionId) {
      this.setState({connection: new jsforce.Connection({ accessToken: global.salesforce.sessionId }) });
    }

    if (!connection) {
      this.setState({ isBusy: true });
// console.log('%c>>>> reconnect ', 'background-color: yellow;'  );
      api.reconnect(connection)
        .then(connection => {
          this.setState({ isBusy: false });
          if (connection) return onLogin(connection);
        })
        .catch(this.onError);
    }
  }

  authenticate(e) {
    e.preventDefault();
    const { onLogin } = this.props;
// console.log('%c>>>> authenticate ', 'background-color: yellow;'  );

    this.setState({ isBusy: true });
    api.connect(this.state)
      .then(connection => {
        if (connection) return onLogin(connection);
        this.setState({ isBusy: false });
      })
      .catch(this.onError);
  }

  onError = error => {
    console.error('login error', error);
    this.setState({ isBusy: false, error });
  };

  renderError() {
    const { error } = this.state;
    if (!error) return null;

    return (
      <div className="ui negative message">
        <p>{error.message}</p>
      </div>
    );
  }

  render() {
    const { isBusy, loginUrl, username, password } = this.state;
    const { PRODUCTION, SANDBOX } = api.ENVIRONMENTS;

    return (
      <div id="login">
        <form className="ui large form" onSubmit={e => this.authenticate(e)}>

          <h1 className="ui blue image header">
            <i className="rocket icon" />
            <div className="content">
              Mission Control
            </div>
          </h1>

          <div className={`ui raised ${isBusy ? 'loading' : ''} segment`}>

            {this.renderError()}

            <div className="field">
              <div className="ui left icon input">
                <i className="user icon" />
                <input
                  type="text"
                  placeholder="Username"
                  autoFocus={!username}
                  value={username}
                  onChange={e => this.setState({ username: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <div className="ui left icon input">
                <i className="lock icon" />
                <input
                  type="password"
                  placeholder="Password"
                  autoFocus={!!username}
                  value={password}
                  onChange={e => this.setState({ password: e.target.value })}
                />
              </div>
            </div>
            <h4 className="ui horizontal divider header">
              Log In to Salesforce
            </h4>
            <div className="two ui buttons">
              <button
                className={
                  loginUrl === PRODUCTION ? 'ui blue button' : 'ui button'
                }
                onClick={() => this.setState({ loginUrl: PRODUCTION })}
              >
                Production
              </button>
              <div className="or" />
              <button
                className={
                  loginUrl === SANDBOX ? 'ui blue button' : 'ui button'
                }
                onClick={() => this.setState({ loginUrl: SANDBOX })}
              >
                Sandbox
              </button>
            </div>
          </div>

        </form>

      </div>
    );
  }
}

export default Login;
