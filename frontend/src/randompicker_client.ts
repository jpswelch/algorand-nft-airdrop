import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class RandomPicker extends bkr.ApplicationClient {
  desc: string = "";
  override methods: algosdk.ABIMethod[] = [
    new algosdk.ABIMethod({
      name: "configure",
      desc: "",
      args: [
        { type: "uint64", name: "app_id", desc: "" },
        { type: "uint64", name: "min_bet", desc: "" },
        { type: "uint64", name: "max_bet", desc: "" },
      ],
      returns: { type: "void", desc: "" },
    }),
    new algosdk.ABIMethod({
      name: "pickWinner",
      desc: "",
      args: [{ type: "uint64", name: "holdersArrayLength", desc: "" }],
      returns: { type: "uint64", desc: "" },
    }),
    new algosdk.ABIMethod({
      name: "settle",
      desc: "",
      args: [
        { type: "account", name: "creator", desc: "" },
        { type: "application", name: "beacon_app", desc: "" },
      ],
      returns: { type: "uint64", desc: "" },
    }),
  ];
  async configure(
    args: {
      app_id: bigint;
      min_bet: bigint;
      max_bet: bigint;
    },
    txnParams?: bkr.TransactionOverrides
  ): Promise<bkr.ABIResult<void>> {
    const result = await this.execute(
      await this.compose.configure(
        { app_id: args.app_id, min_bet: args.min_bet, max_bet: args.max_bet },
        txnParams
      )
    );
    return new bkr.ABIResult<void>(result);
  }
  async pickWinner(
    args: {
      holdersArrayLength: bigint;
    },
    txnParams?: bkr.TransactionOverrides
  ): Promise<bkr.ABIResult<bigint>> {
    const result = await this.execute(
      await this.compose.pickWinner(
        { holdersArrayLength: args.holdersArrayLength },
        txnParams
      )
    );
    return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
  }
  async settle(
    args: {
      creator: string;
      beacon_app?: bigint;
    },
    txnParams?: bkr.TransactionOverrides
  ): Promise<bkr.ABIResult<bigint>> {
    const result = await this.execute(
      await this.compose.settle(
        { creator: args.creator, beacon_app: args.beacon_app },
        txnParams
      )
    );
    return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
  }
  compose = {
    configure: async (
      args: {
        app_id: bigint;
        min_bet: bigint;
        max_bet: bigint;
      },
      txnParams?: bkr.TransactionOverrides,
      atc?: algosdk.AtomicTransactionComposer
    ): Promise<algosdk.AtomicTransactionComposer> => {
      return this.addMethodCall(
        algosdk.getMethodByName(this.methods, "configure"),
        { app_id: args.app_id, min_bet: args.min_bet, max_bet: args.max_bet },
        txnParams,
        atc
      );
    },
    pickWinner: async (
      args: {
        holdersArrayLength: bigint;
      },
      txnParams?: bkr.TransactionOverrides,
      atc?: algosdk.AtomicTransactionComposer
    ): Promise<algosdk.AtomicTransactionComposer> => {
      return this.addMethodCall(
        algosdk.getMethodByName(this.methods, "pickWinner"),
        { holdersArrayLength: args.holdersArrayLength },
        txnParams,
        atc
      );
    },
    settle: async (
      args: {
        creator: string;
        beacon_app?: bigint;
      },
      txnParams?: bkr.TransactionOverrides,
      atc?: algosdk.AtomicTransactionComposer
    ): Promise<algosdk.AtomicTransactionComposer> => {
      return this.addMethodCall(
        algosdk.getMethodByName(this.methods, "settle"),
        {
          creator: args.creator,
          beacon_app:
            args.beacon_app === undefined
              ? await this.resolve("global-state", "beacon_app_id")
              : args.beacon_app,
        },
        txnParams,
        atc
      );
    },
  };
}
