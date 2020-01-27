import React, { useContext, useEffect, Fragment, useState } from 'react';
import {
  usePolymathSdk,
  useTokenSelector,
  User,
  Network,
} from '@polymathnetwork/react';
import { Layout, Spin, Alert, Button, Modal } from 'antd';

import { Store } from './index';
import STO from './STO';
import STOForm from './STOForm';

const { Content, Header, Sider } = Layout;

export const reducer = (state, action) => {
  console.log('ACTION', action);
  switch (action.type) {
    case 'ASYNC_START':
      return {
        ...state,
        loading: true,
        loadingMessage: action.msg,
        error: undefined,
      };
    case 'ASYNC_COMPLETE':
      const { type, ...payload } = action;
      return {
        ...state,
        ...payload,
        loading: false,
        loadingMessage: '',
        error: undefined,
      };
    case 'ERROR':
    case 'ASYNC_ERROR':
      const { error } = action;
      return {
        ...state,
        loading: false,
        loadingMessage: '',
        error,
      };
    case 'TOKEN_SELECTED':
      const { tokenIndex } = action;
      return {
        ...state,
        tokenIndex,
        error: undefined,
        stos: null,
      };
    default:
      throw new Error(`Unrecognized action type: ${action.type}`);
  }
};

async function asyncAction(dispatch, func, msg = '') {
  try {
    dispatch({ type: 'ASYNC_START', msg });
    const rets = await func();
    dispatch({ type: 'ASYNC_COMPLETE', ...rets });
  } catch (error) {
    dispatch({ type: 'ASYNC_ERROR', error: error.message });
  }
}

function App() {
  const [state, dispatch] = useContext(Store);
  let { error: sdkError, sdk, networkId, walletAddress } = usePolymathSdk();
  let {
    error: tokenSelectorError,
    tokenSelector,
    tokens,
    tokenIndex,
  } = useTokenSelector(sdk, walletAddress);
  const [launching, setLaunching] = useState(false);
  let { loading, loadingMessage, error, stos } = state.AppReducer;
  const token = tokens[tokenIndex];

  error = error || sdkError || tokenSelectorError;
  if (!error && !loadingMessage) {
    if (!sdk) {
      loading = true;
      loadingMessage = 'Initializing Polymath SDK';
    } else if (!tokens.length) {
      loading = true;
      loadingMessage = 'Loading your security tokens';
    }
  }

  useEffect(() => {
    async function getStos() {
      const stos = (await token.issuance.offerings.getStos()).filter(
        sto => sto.stoType === 'Tiered'
      );
      return {
        stos,
      };
    }
    if (token && stos === null) {
      asyncAction(
        dispatch,
        () => getStos(),
        'Loading Security Token Offerings.'
      );
    }
  }, [token, stos]);

  function launchSTO(params) {
    async function launchSTO() {
      console.log('Launching STO', params);
      const queue = await token.issuance.offerings.launchTieredSto(params);
      const ret = await queue.run();
      console.log('LaunchSTO ret', ret);

      dispatch({ type: 'TOKEN_SELECTED' });
    }
    asyncAction(dispatch, () => launchSTO(), 'Launching STO..');
  }

  window.token = token;
  console.log(stos);

  return (
    <div>
      <Spin spinning={loading} tip={loadingMessage} size="large">
        <Layout>
          <Header
            style={{
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Network networkId={networkId} />
            <User walletAddress={walletAddress} />
          </Header>
          <Layout>
            <Sider
              width={350}
              style={{
                padding: 50,
                backgroundColor: '#FAFDFF',
              }}
            >
              {walletAddress && tokens && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: 250,
                    justifyContent: 'flex-start',
                  }}
                >
                  {tokenSelector({
                    onTokenSelect: () => dispatch({ type: 'TOKEN_SELECTED' }),
                  })}
                </div>
              )}
            </Sider>
            <Content
              style={{
                padding: 50,
                backgroundColor: '#FAFDFF',
              }}
            >
              {error && (
                <Alert message={error} type="error" closable showIcon />
              )}
              {token && (
                <Fragment>
                  <Button
                    style={{ marginBottom: 20, alignSelf: 'flex-end' }}
                    type="primary"
                    onClick={() => setLaunching(true)}
                  >
                    LAUNCH TIERED STO
                  </Button>
                  <Modal
                    title="Tiered STO"
                    visible={launching}
                    width={750}
                    onOk={() => setLaunching(false)}
                    onCancel={() => setLaunching(false)}
                  >
                    <STOForm
                      walletAddress={walletAddress}
                      launchSTO={launchSTO}
                    />
                  </Modal>
                </Fragment>
              )}
              {stos && stos.map(sto => <STO key={sto.address} {...sto} />)}
            </Content>
          </Layout>
        </Layout>
      </Spin>
    </div>
  );
}

export default App;
