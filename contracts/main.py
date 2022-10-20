from time import sleep
from algosdk.mnemonic import *
from algosdk.future import transaction
from algosdk.atomic_transaction_composer import *
from algosdk.logic import get_application_address
from application import *
from beaker import *


ALGOD_HOST = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""


ACCOUNT_MNEMONIC = "nasty tenant element daughter gather shock they decide climb april define kitten clip now swim carry fashion amused wait coin grass monitor menu abstract rebuild"
#ACCOUNT_MNEMONIC = "extra gaze useful aspect forest brother romance breeze sting any same canvas tent movie home gallery avoid smile asset post banner pave slab absorb pony"


ACCOUNT_ADDRESS = to_public_key(ACCOUNT_MNEMONIC)
ACCOUNT_SECRET = to_private_key(ACCOUNT_MNEMONIC)
ACCOUNT_SIGNER = AccountTransactionSigner(ACCOUNT_SECRET)

# TODO uncomment this if you want to use the currently deployed coin-flipper app on testnet
#APP_ID = 115057669
APP_ID = 117283575

WAIT_DELAY = 11

HOLDERSARRAY = ["0x1", "0x2", "0x3", "0x4"]


def demo(app_id: int = 0):
    purestake_key =  # fill in yours here
    endpoint_address = 'https://testnet-algorand.api.purestake.io/ps2'
    purestake_header = {'X-Api-key': purestake_key}
    algod_client = algod.AlgodClient(
        purestake_key, endpoint_address, headers=purestake_header)

    # Create  an app client for our app
    app_client = client.ApplicationClient(
        algod_client, RandomPicker(), signer=ACCOUNT_SIGNER, app_id=app_id
    )

    # If no app id, we need to create it
    if app_id == 0:
        app_id, app_addr, _ = app_client.create()
        print(f"Created app at {app_id} {app_addr}")
        # app_client.fund(5 * consts.algo)
        # print("Funded app")
        app_client.opt_in()
        print("Opted in")
    else:
        app_addr = get_application_address(app_id)
        app_client.opt_in()
        print("Opted in")

    print(f"Current app state:{app_client.get_application_state()}")

    acct_state = app_client.get_account_state()

    # We don't have a bet yet
    if "commitment_round" not in acct_state:
        sp = algod_client.suggested_params()

        # Add 3 rounds to the first available round to give us a little
        # padding time
        round = sp.first + 3

        # Call coin flip to reserve randomness in the future
        print(f"Flipping coin :crossed_fingers:")
        app_client.call(
            RandomPicker.pickWinner,
            bet_payment=TransactionWithSigner(
                txn=transaction.PaymentTxn(
                    ACCOUNT_ADDRESS, sp, app_addr, consts.algo),
                signer=ACCOUNT_SIGNER,
            ),
            holdersArrayLength=len(HOLDERSARRAY)

        )
    else:
        # We have a bet
        round = acct_state["commitment_round"]

    print(f"Award process started for round: {round}")

    # wait an extra couple rounds
    wait_round = round + 2

    sp = algod_client.suggested_params()
    current_round = sp.first
    while current_round < wait_round:
        print(f"Currently at round {current_round}")
        algod_client.status_after_block(current_round)
        current_round += 1

    print("Settling...")
    sp = algod_client.suggested_params()
    sp.flat_fee = True
    sp.fee = 2000  # cover this and 1 inner transaction
    result = app_client.call(
        RandomPicker.settle, creator=ACCOUNT_ADDRESS, suggested_params=sp,
    )
    print(f"Results: {result.return_value}")


if __name__ == "__main__":
    demo(app_id=APP_ID)
