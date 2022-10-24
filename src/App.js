/* global AlgoSigner */
import "./App.css";
import MyHeader from "./components/header/header.component";
import AwardWinner from "./components/awardWinner";
import { useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState("");

  const login = async () => {
    await AlgoSigner.connect({
      ledger: "TestNet",
    });
    const accts = await AlgoSigner.accounts({
      ledger: "TestNet",
    });
    // grabbing first account on the list for now.
    console.log(accts[0].address);
    setIsLoggedIn(true);
    setAddress(accts[0].address);
  };

  const logout = async () => {
    console.log("logging out");
    // TODO: logout of AlgoSigner?
    setIsLoggedIn(true);
    setAddress("");
  };

  return (
    <div>
      <header className="p-4 dark:bg-gray-800 dark:text-gray-100">
        <div className="container flex justify-between h-16 mx-auto">
          <a
            rel="noopener noreferrer"
            href="/"
            aria-label="Back to homepage"
            className="flex items-center p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 dark:text-violet-400"
            >
              <path d="M3.8 3.8l16.4 16.4M20.2 3.8L3.8 20.2M15 3h6v6M9 3H3v6M15 21h6v-6M9 21H3v-6" />
            </svg>
          </a>
          <ul className="items-stretch hidden space-x-3 lg:flex">
            <li className="flex">
              {/* <a
                rel="noopener noreferrer"
                href="#"
                className="flex items-center px-4 -mb-1 border-b-2 dark:border-transparent dark:text-violet-400 dark:border-violet-400"
              >
                Link
              </a> */}
            </li>
            <li className="flex">
              {/* <a
                rel="noopener noreferrer"
                href="#"
                className="flex items-center px-4 -mb-1 border-b-2 dark:border-transparent"
              >
                Link
              </a> */}
            </li>
            <li className="flex">
              {/* <a
                rel="noopener noreferrer"
                href="#"
                className="flex items-center px-4 -mb-1 border-b-2 dark:border-transparent"
              >
                Link
              </a> */}
            </li>
            <li className="flex">
              {/* <a
                rel="noopener noreferrer"
                href="#"
                className="flex items-center px-4 -mb-1 border-b-2 dark:border-transparent"
              >
                Link
              </a> */}
            </li>
          </ul>
          <div className="items-center flex-shrink-0 hidden lg:flex">
            {isLoggedIn ? (
              address.slice(0, 5) + "..." + address.slice(address.length - 5)
            ) : (
              <button
                className="self-center px-8 py-3 font-semibold rounded dark:bg-violet-400 dark:text-gray-900"
                onClick={login}
              >
                Connect Wallet
              </button>
            )}
          </div>
          <button className="p-4 lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 dark:text-gray-100"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </header>
      <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
        <p className="text-3xl text-gray-700 font-bold mb-5">
          Random Algorand NFT AirDrop
        </p>
        <AwardWinner address={address} />
      </div>
    </div>
  );
}

export default App;
