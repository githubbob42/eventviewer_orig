// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h1 className="App-title">Welcome to React</h1>
//         </header>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }

// export default App;

import React, { Component } from 'react';
import * as api from './api/api';
import Limits from './components/Limits';
import ServerStatus from './components/ServerStatus';
import Loading from './components/Loading';
import Organization from './components/Organization';

import { Button, Icon, Header, Modal } from 'semantic-ui-react'

import SyncEvents from './components/SyncEvents';

var isDev = api.appVersion === 'DEV';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      connection: props.connection,
      isBusy: false,
      isAdmin: false,
      identity: null,
      user: null,
      spec: props.spec,
      auditLogId: this.getQueryVariable('id'),
      betaAccepted: JSON.parse(localStorage.getItem('fxBetaAccepted_PV') || false),
      promptForBeta: null,
      isBeta: true
    };
  }

  getQueryVariable = (variable) => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] === variable) {
        return pair[1];
      }
    }
    return(false);
  }

  componentWillMount() {
    const { connection } = this.state;
    return this.fetchUserDetails(connection);
  }

  fetchUserDetails = connection => {
    console.log({ connection });
    if (!connection) return;

    this.setState({ isBusy: true });

    return api.fetchIdentity(connection)
      .then(identity => {
        this.setState({ connection, identity, error: null });

        return api.fetchUser(connection, identity.user_id).then(user => {
          const isAdmin = api.isAdminUser(user);

          this.setState({
            isBusy: false,
            isAdmin,
            user: !isAdmin && user
          });
        });
      })
      .catch(error => {
        console.error('connection error', error);
        this.setState({ error });
        this.logout();
      });
  };

  logout() {
    api.disconnect().then(() => {
      this.setState({
        isBusy: false,
        isAdmin: false,
        connection: null,
        identity: null,
        user: null
      });
      window.location.reload();
    });
  }

  renderHeader() {
    const { identity } = this.state;

    if (!identity) // || api.appVersion !== 'DEV')
      return null;

    return (
      <header>
        <div className="ui top attached five steps">
          <div className="step">
            <div className={`ui blue ${isDev ? "animated fluid" : ""} button`}
                 onClick={() => api.appVersion === 'DEV' && this.logout()} >
              <div className="visible content">{identity.username}</div>
              {isDev && <div className="hidden content"> Log Out </div> }
            </div>
          </div>
          <div className="step">
            <Organization {...this.state} />
          </div>
          <div className="step">
            <ServerStatus {...this.state} />
          </div>
          <div className="step">
            <Limits {...this.state} />
          </div>
        </div>
      </header>
    );
  }

  agreeToBeta = (agreed) => {
    localStorage.setItem('fxBetaAccepted_PV', agreed);
    this.setState({betaAccepted: agreed, promptForBeta: agreed});
  }

  showBetaMessage() {
    const { betaAccepted } = this.state;
    return (
      <Modal open={!betaAccepted} size='small'>
        <Header icon='warning' color='red' content='Beta Software' />
        <Modal.Content>
          <div>
            <p>DISCLAIMER: This is Beta software.</p>
            <p>Click "Ok" if you understand the consequences of using beta software and you agree to help beta test this module.</p>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' inverted onClick={() => this.agreeToBeta(false)}>
            <Icon name='remove' /> Cancel
          </Button>
          <Button color='green' inverted onClick={() => this.agreeToBeta(true)}>
            <Icon name='checkmark' /> Ok
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  render() {
    const { isBusy, isBeta, promptForBeta } = this.state;

    if (isBusy) return <Loading isBusy={true} />;

    var betaAccepted = JSON.parse(localStorage.getItem('fxBetaAccepted_PV') || false);
    if (isBeta && promptForBeta === null && !betaAccepted) return (this.showBetaMessage());
    if (isBeta && !promptForBeta && !betaAccepted) return (
        <div onClick={() => window.location.reload()}>
          <table className="ui very  single line collapsing compact unstackable selectable small table">
            <tbody>
              <tr>
                <td>This is beta software.  You must agree to the terms to use this module.</td>
              </tr>
            </tbody>
          </table>
        </div>
      );

    return (
      <article id="container">
        {this.renderHeader()}
        <SyncEvents {...this.state}  />
        <div style={{paddingLeft: '20px'}}>
          Version: {api.appVersion} {isDev && ` | PostEnv: ${window.postEnv}` }
        </div>
      </article>
    );
  }
}

export default App;
