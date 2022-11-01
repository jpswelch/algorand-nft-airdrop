import { Wheel } from "react-custom-roulette";
import algosdk from "algosdk";
import { useState, useEffect } from "react";
import {
  SessionWalletData,
} from "beaker-ts/lib/web";
import JSConfetti from 'js-confetti'
import { transferAsset } from "../actions/NftTransferActions"
import {
  getDatabase,
  ref,
  child,
  push,
  update,
  onValue,
} from "firebase/database";
import { TwitterShareButton } from "react-twitter-embed";
type SpinnerProps = {
  algodClient: algosdk.Algodv2;
  assetId: number;
  winner: number;
  eligibleWinners: Object[];
  creator: string;
  assetKey: string
};

export function Spinner(props: SpinnerProps) {
  const { eligibleWinners, winner, algodClient, creator, assetId, assetKey } = props;
  const jsConfetti = new JSConfetti()
  function updateData(key: string, donated: boolean) {
    const db = getDatabase();
    const updates: {
      [key: string]: boolean;
    } = {};
    updates["/airdrop/" + key + "/donated"] = donated;
    update(ref(db), updates);
  }

  const data = eligibleWinners.map((element) => {
    return {
      option: `${element.address.substring(
        0,
        4
      )} ... ${element.address.substring(54, 58)}`,
    };
  });

  const [mustSpin, setMustSpin] = useState<boolean>(false);

  async function endSpinner() {
    jsConfetti.addConfetti()
    const txn = await transferAsset(creator, eligibleWinners[winner].address, algodClient, assetId);
    console.log(assetKey);

    if (txn) {
      updateData(assetKey, true);
      alert(`success, ${txn}`);
    } else {
      alert("transfer failed");
    }
  }

  useEffect(() => {
    if (winner) {
      setMustSpin(true);
    } else {
      setMustSpin(false);
    }
  }, []);

  console.log(creator)

  return (
    <><Wheel
      mustStartSpinning={mustSpin}
      prizeNumber={winner}
      data={data}
      backgroundColors={["#3e3e3e", "#df3428"]}
      textColors={["#ffffff"]}
      onStopSpinning={endSpinner} />
      <TwitterShareButton
        url={`https://goalseeker.purestake.io/algorand/testnet/asset/${assetId}`}
        options={{ text: `I just airdropped an exclusive NFT to one of my best supporters ${eligibleWinners[winner].address}`, via: 'AlgorandAirdrop' }} />
    </>
  );
}
