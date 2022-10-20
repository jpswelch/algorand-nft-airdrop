from typing import Final
from pyteal import *
from beaker import *
import logging


class BetResult(abi.NamedTuple):
    won: abi.Field[abi.Bool]
    amount: abi.Field[abi.Uint64]


class RandomPicker(Application):
    """
    Allows user to flip a coin, choosing heads or tails and some future round to settle.

    If the user guesses correctly, their bet is doubled and paid out to them.

    """

    ###
    # App state values
    ###
    beacon_app_id: Final[ApplicationStateValue] = ApplicationStateValue(
        TealType.uint64,
        default=Int(110096026),
        descr="The App ID of the randomness beacon. Should adhere to ARC-21",
    )

    awards_outstanding: Final[ApplicationStateValue] = ApplicationStateValue(
        TealType.uint64,
        default=Int(0),
        descr="Counter to keep track of how many awards are outstanding.",
    )

    ###
    # Account state values
    ###
    commitment_round: Final[AccountStateValue] = AccountStateValue(
        TealType.uint64,
        descr="The round this account committed to, to use for future randomness",
    )
    pick: Final[AccountStateValue] = AccountStateValue(
        TealType.uint64, descr="The location of the winner's address within the holder array "
    )
    holdersArrayLength: Final[AccountStateValue] = AccountStateValue(
        TealType.uint64, descr="Thelength of the holder array "
    )

    ###
    # API Methods
    ###

    @external
    def pickWinner(
        self, holdersArrayLength: abi.Uint64, *, output: abi.Uint64
    ):
        """called to start the process of picking a winner

        Args:
            payment: Algo payment transaction held in escrow until settlement
            round: Uint64 representing the round to claim randomness for (must be for a future round)
            heads: boolean representing heads or tails

        """
        return Seq(
            # Assert(
            #     holdersLength > Int(1),
            #     comment="Must be greater than 1",
            # ),
            (round := ScratchVar()).store(Global.round() + Int(3)),
            # Set fields for this sender
            self.commitment_round[Txn.sender()].set(round.load()),
            self.holdersArrayLength[Txn.sender()].set(
                holdersArrayLength.get()),
            self.awards_outstanding.increment(),
            output.set(round.load())
        )

    @ external
    def settle(
        self,
        creator: abi.Account,
        beacon_app: abi.Application = beacon_app_id,
        *,
        output: abi.Uint64,
    ):
        """allows settlement of a bet placed during `flip_coin`

        Args:
            beacon_app: App ref for random oracle beacon

        Returns:
            A string with the result of the bet
        """

        won = abi.Uint64()

        return Seq(
            # Get the randomness back
            (randomness := abi.Uint64()).decode(
                self.get_randomness(
                    self.commitment_round[creator.address()])
            ),

            # take the modulo of the random number and the length of the holders array to get a value within the array
            won.set(randomness.get() % self.holdersArrayLength),

            output.set(won),

            # Reset state
            self.commitment_round[creator.address()].delete(),
            self.holdersArrayLength[creator.address()].delete(),
            # Decrement counter
            self.awards_outstanding.decrement(),
        )

    @ internal(TealType.bytes)
    def get_randomness(self, acct_round: Expr):
        """requests randomness from random oracle beacon for requested round"""
        return Seq(
            # Prep arguments
            (round := abi.Uint64()).set(acct_round),
            (user_data := abi.make(abi.DynamicArray[abi.Byte])).set([]),
            # Get randomness from oracle
            InnerTxnBuilder.ExecuteMethodCall(
                app_id=self.beacon_app_id,
                method_signature="must_get(uint64,byte[])byte[]",
                args=[round, user_data],
            ),
            # Remove first 4 bytes (ABI return prefix)
            # and return the rest
            Suffix(InnerTxn.last_log(), Int(4)),
        )

    ###
    # App lifecycle
    ###

    @ create
    def create(self):
        return self.initialize_application_state()

    @ external(authorize=Authorize.only(Global.creator_address()))
    def configure(self, app_id: abi.Uint64, min_bet: abi.Uint64, max_bet: abi.Uint64):
        """Allows configuration of the application state values

        Args:
            app_id: The uint64 app id of the beacon app to use
        """
        return Seq(
            Assert(min_bet.get() < max_bet.get(),
                   comment="min bet must be < max bet"),
            self.beacon_app_id.set(app_id.get()),
        )

    @ delete(authorize=Authorize.only(Global.creator_address()))
    def delete(self):
        return Seq(
            # Make sure we dont have any outstanding bets
            Assert(self.awards_outstanding == Int(0)),
            # Close out algo balance to app creator
            InnerTxnBuilder.Execute(
                {
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.receiver: Txn.sender(),
                    TxnField.amount: Int(0),
                    TxnField.close_remainder_to: Txn.sender(),
                }
            ),
            Approve(),
        )

    @ update(authorize=Authorize.only(Global.creator_address()))
    def update(self):
        return Approve()

    @ opt_in
    def opt_in(self):
        return Approve()

    # Clear/close out ok, but app keeps algos
    # otherwise user could see that they'd lose a bet
    # and try to cancel before settlement
    @ clear_state
    def clear_state(self):
        return Seq(
            If(self.commitment_round[Txn.sender()] > Int(0)).Then(
                self.awards_outstanding.decrement()
            ),
            Approve(),
        )

    @ close_out
    def close_out(self):
        return Seq(
            If(self.commitment_round[Txn.sender()] > Int(0)).Then(
                self.awards_outstanding.decrement()
            ),
            Approve(),
        )


if __name__ == "__main__":
    RandomPicker().dump("./artifacts")
