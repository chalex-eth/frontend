import './App.css';
import Auction from './components/Auction';
import Header from './components/Header';
import { useMoralis } from "react-moralis"


function App() {

  const { enableWeb3, isWeb3Enabled, isWeb3EnableLoading, account, Moralis, deactivateWeb3 } =
    useMoralis()

  return (
    <>
      <Header />
      {account ? (<Auction />) : (<h2> Please connect wallet</h2>)}

    </>
  );
}

export default App;

