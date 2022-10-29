import algosdk from "algosdk";
import { useState, useEffect } from "react";
import { Network, APIProvider, getAlgodClient } from "beaker-ts/lib/clients";
import {
  PlaceHolderSigner,
  SessionWalletManager,
  SessionWalletData,
} from "beaker-ts/lib/web";
import { RandomPicker } from "./randompicker_client";
import { AwardWinner, type AwardData } from "./awardWinner";
import WalletSelector from "./WalletSelector";
import {
  AppBar,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { SettleForm } from "./SettleForm";
import { NftForm } from "./NftForm";
// import ShuffleIcon from '@mui/icons-material/Shuffle';

// AnonClient can still allow reads for an app but no transactions
// can be signed
const AnonClient = (client: algosdk.Algodv2, appId: number): RandomPicker => {
  return new RandomPicker({
    client: client,
    signer: PlaceHolderSigner,
    sender: "",
    appId: appId,
  });
};

export default function App() {
  // Start with no app id for this demo, since we allow creation
  // Otherwise it'd come in as part of conf
  const [appId, setAppId] = useState<number>(118384113);
  const [appAddress, setAppAddress] = useState<string>(
    algosdk.getApplicationAddress(appId)
  );

  const [isCreator, setIsCreator] = useState<boolean>(true);

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
  const [holdersArray, setHoldersArray] = useState<string[]>([]);

  const [winner, setWinner] = useState<string>("");

  // Set up user wallet from session
  const [accountSettings, setAccountSettings] = useState<SessionWalletData>(
    SessionWalletManager.read(network)
  );

  // Init our app client
  const [appClient, setAppClient] = useState<RandomPicker>(
    AnonClient(algodClient, appId)
  );

  // If the account info, client, or app id change
  // update our app client
  useEffect(() => {
    // Bad way to track connected status but...
    if (accountSettings.data.acctList.length == 0 && appClient.sender !== "") {
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
    return connected() ? SessionWalletManager.address(network) : "";
  }

  // Check for an update bet round
  useEffect(() => {
    if (!connected()) return setround(0);
    if (round !== 0) return;
    getround().then((round) => {
      setround(round);
    });
  }, [accountSettings]);

  async function getround(): Promise<number> {
    try {
      const acctState = await appClient.getAccountState(account());
      if ("commitment_round" in acctState)
        return acctState["commitment_round"] as number;
    } catch (err) {}
    return 0;
  }

  // Check for an update opted in status
  useEffect(() => {
    const addr = account();
    if (addr === "") return setOptedIn(false);

    algodClient
      .accountApplicationInformation(addr, appId)
      .do()
      .then((data) => {
        setOptedIn("app-local-state" in data);
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

  async function updateApp() {
    await appClient.update();
  }
  async function deleteApp() {
    await appClient.delete();
  }

  async function closeOut() {
    console.log("OptingOut...");
    setLoading(true);
    await appClient.closeOut();
    setOptedIn(false);
    setround(0);
    setLoading(false);
  }

  async function awardWinner(bfd: AwardData) {
    console.log(`Award Winner with data: `, bfd.holders);

    try {
      const result = await appClient.pickWinner({
        holdersArrayLength: bfd.holders.length,
      });

      setround(Number(result.returnValue));
      setHoldersArray(bfd.holders);
    } catch (err) {
      console.error(err);
    }
  }

  async function settle() {
    console.log("Settling...");
    const feePaySp = await appClient.getSuggestedParams(undefined, 1);
    const result = await appClient.settle(
      { creator: appClient.sender },
      { suggestedParams: feePaySp }
    );
    setround(0);
    const outcome: number = result.value;
    setWinner(holdersArray[outcome]);
    const msg = `${outcome} `;
    console.log(holdersArray, winner);
    alert(msg);
  }

  // We allow creation, opt in, bet, settle
  const action = !appId ? (
    <Button variant="outlined" onClick={createApp}>
      Create App
    </Button>
  ) : !optedIn ? (
    <LoadingButton loading={loading} variant="outlined" onClick={optIn}>
      Opt In to app
    </LoadingButton>
  ) : !round ? (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography>Supporter</Typography>
      <Switch onChange={handleChange} checked={isCreator} />
      <Typography> Creator</Typography>
    </Stack>
  ) : (
    // <AwardWinner
    //   network={network}
    //   accountSettings={accountSettings}
    //   awardWinner={awardWinner}
    // />
    <SettleForm round={round} settle={settle} algodClient={algodClient} />
  );
  console.log(isCreator);
  // The app ui
  return (
    <div className="App">
      <AppBar position="static">
        {/* <ShuffleIcon className="text-2xl m-5" /> */}
        <Toolbar variant="regular">
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
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="space-around"
        spacing={6}
        margin="10px"
      >
        {winner ? (
          <Grid item lg>
            <Box>
              <NftForm
                algodClient={algodClient}
                winner={winner}
                creator={appClient.sender}
              />
            </Box>
          </Grid>
        ) : (
          <Grid item lg>
            <Box>{action}</Box>
            <Box>
              {isCreator ? (
                <AwardWinner
                  network={network}
                  accountSettings={accountSettings}
                  awardWinner={awardWinner}
                />
              ) : (
                ""
              )}
            </Box>
          </Grid>
        )}

        <Grid item lg>
          <LoadingButton color="warning" loading={loading} onClick={closeOut}>
            Opt Out of App
          </LoadingButton>
        </Grid>
      </Grid>
    </div>
  );
}
