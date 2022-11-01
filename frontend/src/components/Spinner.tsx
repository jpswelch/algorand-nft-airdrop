import { Wheel } from "react-custom-roulette";

// @ts-nocheck
import algosdk from "algosdk";
import { useState, useEffect } from "react";
import {
  Button,
  Grid,
  Stack,
  Typography,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  PlaceHolderSigner,
  SessionWalletManager,
  SessionWalletData,
} from "beaker-ts/lib/web";
type SpinnerProps = {
  algodClient: algosdk.Algodv2;
  network: string;
  accountSettings: SessionWalletData;
  winner: string;
  eligibleWinners: Object[];
};
// const data = [
//     { option: '0', style: { backgroundColor: 'green', textColor: 'black' } },
//     { option: '1', style: { backgroundColor: 'white' } },
//     { option: '2' },
//   ]

export function Spinner(props: SpinnerProps) {
  const { eligibleWinners, winner } = props;
  const data = eligibleWinners.map((element) => {
    return {
      option: `${element.address.substring(
        0,
        4
      )} ... ${element.address.substring(54, 57)}`,
    };
  });

  const [mustSpin, setMustSpin] = useState<boolean>(false);

  useEffect(() => {
    if (winner) {
      setMustSpin(true);
    } else {
      setMustSpin(false);
    }
  }, []);
  return (
    <Wheel
      mustStartSpinning={mustSpin}
      prizeNumber={3}
      data={data}
      backgroundColors={["#3e3e3e", "#df3428"]}
      textColors={["#ffffff"]}
    />
  );
}
