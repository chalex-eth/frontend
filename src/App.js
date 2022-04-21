import './App.css';
import Auction from './components/Auction';
import Header from './components/Header';
import img from './asset/img.jpg';

function App() {


  return (
    <>
      <Header />
      <img src={img}></img>
      <Auction />

    </>
  );
}

export default App;

