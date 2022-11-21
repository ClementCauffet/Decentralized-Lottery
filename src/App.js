import { useState } from "react";
import { ethers } from "ethers";

//Import ABI Code

import Loto from "./artifacts/contracts/Loto.sol/Loto.json";
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { useEffect } from "react";
import { ContractType } from "hardhat/internal/hardhat-network/stack-traces/model";

//Contract Adress
const lotoAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [accountAddress, setAccountAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [accountManager, setAccountManager] = useState("");
  const [isManager, setIsManager] = useState(false);
  const [participants, setParticipants] = useState([]);

  async function initVariables() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();

    // Create Contract with signer
    const contract = new ethers.Contract(lotoAddress, Loto.abi, signer);

    const address = await contract.manager();

    setAccountManager(address.toLowerCase());
  }

  initVariables();

  //is Manager connected ?
  function testManager(accountAddress, accountManager) {
    if (accountAddress == accountManager) {
      setIsManager(true);
      console.log("Manager connected");
    } else {
      setIsManager(false);
      console.log("Manager not connected");
      console.log(accountAddress, accountManager);
    }
  }

  //Handle Wallet / chain change
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        console.log("Account Changed");
        window.location.reload();
      });
    }
  });

  //Request access to the user's metamask account
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  //Wallet Connection
  const connectWallet = async () => {
    try {
      console.log("Connect Wallet");
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum, "any");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const deployer = accounts[0];

      setAccountAddress(deployer.toLowerCase());
      let balance = await provider.getBalance(accounts[0]);
      let bal = ethers.utils.formatEther(balance);
      setAccountBalance(bal);
      setIsConnected(true);
      testManager(accountAddress, accountManager);
    } catch (error) {
      setIsConnected(false);
    }
  };

  //Entering Lottery
  async function enterLottery() {
    // If MetaMask exists
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();

      // Create Contract with signer
      const contract = new ethers.Contract(lotoAddress, Loto.abi, signer);
      const transaction = await contract.enter({
        value: ethers.utils.parseEther("1"),
      });
      await provider.waitForTransaction(transaction.hash);
      console.log(
        "Balance du contrat :",
        (await provider.getBalance(lotoAddress)).toString() / 1e18,
        "Ethers"
      );

      const preParticipants = await contract.getPlayers();
      console.log(preParticipants);

      for (var i = 0; i < preParticipants.length; i++) {
        if (preParticipants(i)) {
        }
      }

      setParticipants(await contract.getPlayers());
    }
  }

  //Choosing winner (only Owner)
  async function pickWinner() {
    // If MetaMask exists
    if (typeof window.ethereum !== "undefined") {
      if (isManager) {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        const signer = provider.getSigner();

        // Create Contract with signer
        const contract = new ethers.Contract(lotoAddress, Loto.abi, signer);
        //console.log(await contract.getBalance(contract.address));
        try {
          const winning = await contract.pickWinner();
          await provider.waitForTransaction(winning.hash);
        } catch (Error) {
          console.log(Error);
          return false;
        }

        //console.log(await contract.getBalance(contract.address));
        console.log(
          "Balance du contrat :",
          (await provider.getBalance(lotoAddress)).toString() / 1e18,
          "Ethers"
        );
      } else {
        alert("User must me a manager !");
      }
    } else {
      console.log("Metamask doesn't exists !");
    }
  }

  return (
    <div className="App">
      <div
        className="App-header"
        style={{ display: "flex", flexDirection: "row" }}
      >
        <div className="main">
          <div>
            <button onClick={connectWallet}>connectWallet</button>
          </div>

          <div>Adresse connectée à MetaMask : {accountAddress}</div>
          <div>Balance du compte : {accountBalance} ETH</div>
          <h1>Decentralized Lottery by Caufman</h1>
          <h3>Full stack dApp using React.js and Hardhat</h3>

          <button onClick={() => enterLottery()}>Enter Lottery</button>
          <button onClick={() => pickWinner()}>Pick Winner</button>
        </div>
        <div className="tab">
          <h1> Participants </h1>
          <table>
            <thead>
              <th scope="col"> Participant </th>
              <th scope="col"> Nb Participations</th>
            </thead>
            <tbody>
              {participants.map((participant, i) => (
                <tr key={i}>
                  <th scope="row">{participant}</th>
                  <th scope="row"></th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
