import algosdk from 'algosdk';
import { useState, useEffect } from 'react';
import { Network, APIProvider, getAlgodClient } from 'beaker-ts/lib/clients';
import {
  PlaceHolderSigner,
  SessionWalletManager,
  SessionWalletData,
} from 'beaker-ts/lib/web';

import { RandomPicker } from './randompicker_client';
import { CreatorView, type AwardData } from './components/CreatorView';
import { SupporterView } from './components/SupporterView';
import { Spinner } from './components/Spinner';
import WalletSelector from './components/WalletSelector';
import {
  AppBar,
  Box,
  Button,
  Grid,
  Stack,
  Switch,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { SettleForm } from './forms/SettleForm';
import RedeemIcon from '@mui/icons-material/Redeem';
import firebase from './firebase';
import {
  getDatabase,
  ref,
  set,
  child,
  push,
  update,
  onValue,
} from 'firebase/database';
import { async } from '@firebase/util';
import CardList from './components/card-list-component';
import { ResetTvOutlined } from '@mui/icons-material';

// AnonClient can still allow reads for an app but no transactions
// can be signed
const AnonClient = (client: algosdk.Algodv2, appId: number): RandomPicker => {
  return new RandomPicker({
    client: client,
    signer: PlaceHolderSigner,
    sender: '',
    appId: appId,
  });
};

const token = {
  'X-API-Key': import.meta.env.VITE_NETWORK_API_KEY,
};
const indexerClient = new algosdk.Indexer(
  token,
  import.meta.env.VITE_NETWORK_INDEXER,
  ''
);

export default function App() {
  // Start with no app id for this demo, since we allow creation
  // Otherwise it'd come in as part of conf
  const [appId, setAppId] = useState<number>(118384113);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [appAddress, setAppAddress] = useState<string>(
    algosdk.getApplicationAddress(appId)
  );

  const [isCreator, setIsCreator] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target);
    setIsCreator(event.target.checked);
  };

  // Setup config for client/network.
  const [apiProvider, setApiProvider] = useState(APIProvider.AlgoNode);
  const [network, setNetwork] = useState(Network.TestNet);

  // Init our algod client
  const algodClient = getAlgodClient(apiProvider, network);

  const [round, setround] = useState<number>(0);
  const [optedIn, setOptedIn] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [eligibleWinners, setEligibleWinners] = useState<string[]>([]);
  const [assetId, setAssetId] = useState<number>(0);
  const [assetKey, setAssetKey] = useState<string>('');

  const [winner, setWinner] = useState<number | null>(null);

  // Set up user wallet from session
  const [accountSettings, setAccountSettings] = useState<SessionWalletData>(
    SessionWalletManager.read(network)
  );

  // Init our app client
  const [appClient, setAppClient] = useState<RandomPicker>(
    AnonClient(algodClient, appId)
  );

  // get list of assets
  type AssetObj = {
    name: string;
    index: number;
    url: string;
    image: string;
  };


  // If the account info, client, or app id change
  // update our app client
  useEffect(() => {
    // Bad way to track connected status but...
    if (accountSettings.data.acctList.length == 0 && appClient.sender !== '') {
      setAppClient(AnonClient(algodClient, appId));
    } else if (
      SessionWalletManager.connected(network) &&
      SessionWalletManager.address(network) !== appClient.sender
    ) {
      console.log(SessionWalletManager.signer(network));
      setAppClient(
        new RandomPicker({
          client: algodClient,
          signer: SessionWalletManager.signer(network),
          sender: SessionWalletManager.address(network),
          appId: appId,
        })
      );
    }
  }, [accountSettings, appId, algodClient]);

  function connected(): boolean {
    return accountSettings.data.acctList.length > 0;
  }

  function account(): string {
    return connected() ? SessionWalletManager.address(network) : '';
  }

  // Check for an update bet round
  useEffect(() => {
    if (connected()) setConnected(true);
    if (!connected()) return setround(0);
    if (round !== 0) return;
    getround().then((round) => {
      setround(round);
    });
  }, [accountSettings]);

  async function getround(): Promise<number> {
    try {
      const acctState = await appClient.getAccountState(account());
      if ('commitment_round' in acctState)
        return acctState['commitment_round'] as number;
    } catch (err) { }
    return 0;
  }

  // Check for an update opted in status
  useEffect(() => {
    const addr = account();
    if (addr === '') return setOptedIn(false);

    algodClient
      .accountApplicationInformation(addr, appId)
      .do()
      .then((data) => {
        setOptedIn('app-local-state' in data);
      })
      .catch((err) => {
        setOptedIn(false);
      });
  }, [accountSettings]);

  // Deploy the app on chain
  async function createApp() {
    setLoading(true);
    const { appId, appAddress } = await appClient.create();
    setAppId(appId);
    setAppAddress(appAddress);

    console.log(`Created app: ${appId}`);
    setLoading(false);
  }

  // Opt account into app
  async function optIn() {
    setLoading(true);
    await appClient.optIn();
    setOptedIn(true);
    setLoading(false);
  }

  async function closeOut() {
    console.log('OptingOut...');
    setLoading(true);
    await appClient.closeOut();
    setOptedIn(false);
    setround(0);
    setLoading(false);
  }

  async function awardWinner(props: AwardData) {
    console.log(`Award Winner with data: `, props.eligibleWinners);

    try {
      const result = await appClient.pickWinner({
        holdersArrayLength: props.eligibleWinners.length,
      });

      setEligibleWinners(props.eligibleWinners);
      setAssetId(props.assetId);
      setAssetKey(props.assetKey);
      setround(Number(result.returnValue));
    } catch (err) {
      console.error(err);
    }
  }

  async function settle() {
    console.log('Settling...');
    const feePaySp = await appClient.getSuggestedParams(undefined, 1);
    const result = await appClient.settle(
      { creator: appClient.sender },
      { suggestedParams: feePaySp }
    );

    const winner: number = Number(result.value);
    setWinner(winner);
    // console.log(account(), eligibleWinners, winner);
  }

  // We allow creation, opt in, bet, settle
  const action = !appId ? (
    <Button variant="outlined" onClick={createApp}>
      Create App
    </Button>
  ) : !round ? (
    <>
      {isCreator ? (
        <CreatorView
          algodClient={algodClient}
          network={network}
          accountSettings={accountSettings}
          awardWinner={awardWinner}
        />
      ) : (
        <SupporterView
          algodClient={algodClient}
          accountSettings={accountSettings}
        />
      )}
    </>
  ) : (
    <>
      {winner === 0 || winner ? (
        <>
          <Spinner
            algodClient={algodClient}
            winner={winner}
            eligibleWinners={eligibleWinners}
            creator={account()}
            assetId={assetId}
            assetKey={assetKey}
          />
          <Button onClick={(e) => { setround(0); setWinner(null) }}>Reset</Button>
        </>
      ) : (
        <SettleForm round={round} settle={settle} algodClient={algodClient} />
      )}
    </>
  );
  // The app ui
  console.log(winner)
  return (
    <div className="App">
      <AppBar position="static" color="secondary">
        {/* <ShuffleIcon className="text-2xl m-5" /> */}

        <Toolbar variant="regular">
          <Box sx={{ p: 4 }}>
            <RedeemIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" component="h6">
              Algorand Airdrop
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ borderRadius: "30px", backgroundColor: "secondary.light", padding: "10px" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography color={"primary.main"}>Supporter</Typography>
              <Switch onChange={handleChange} checked={isCreator} />
              <Typography color={"primary.main"}> Creator</Typography>
            </Stack>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Box>
            {/*
              Adding our wallet selector here with hooks to acct settings
              lets us provide an input for logging in with different wallets
              and updating session and in memory state
            */}
            <WalletSelector
              network={network}
              accountSettings={accountSettings}
              setAccountSettings={setAccountSettings}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Box>{action}</Box>
    </div >
  );
}
