import { Wheel } from "react-custom-roulette";
import algosdk from "algosdk";
import { useState, useEffect } from "react";
import JSConfetti from 'js-confetti'
import emoji from "../assets/emoji.jpg"
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
import { Button, Modal, Box, Typography } from "@mui/material";

type SpinnerProps = {
  algodClient: algosdk.Algodv2;
  assetId: number;
  winner: number;
  eligibleWinners: Object[];
  creator: string;
  assetKey: string
};

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


export function Spinner(props: SpinnerProps) {
  const { eligibleWinners, winner, algodClient, creator, assetId, assetKey } = props;
  const jsConfetti = new JSConfetti()
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
    jsConfetti.addConfetti({ emojis: ["🥳", "🎉", "🎊", "🎈"] })
    handleOpen();


    const txn = await transferAsset(creator, eligibleWinners[winner].address, algodClient, assetId);


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


  return (
    <><Wheel
      mustStartSpinning={mustSpin}
      prizeNumber={winner}
      data={data}
      backgroundColors={["#0c4160", "#738fa7"]}
      textColors={["#c3ceda"]}
      onStopSpinning={endSpinner} />

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {eligibleWinners[winner].address.substring(0, 4)} ...{eligibleWinners[winner].address.substring(54, 58)} was the winner!
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Let your supporters know the results!
          </Typography>
          <Box sx={{ mt: 2 }}>
            <TwitterShareButton
              url={`https://goalseeker.purestake.io/algorand/testnet/asset/${assetId}`}
              options={{ text: `I just airdropped an exclusive NFT to one of my best supporters ${eligibleWinners[winner].address}`, via: 'AlgorandAirdrop' }} />
          </Box>
          <Box
            m={1}
            //margin
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <Button onClick={handleClose}>Close</Button>
          </Box>
        </Box>
      </Modal>

    </>
  );
}
