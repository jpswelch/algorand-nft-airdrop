import './App.css';
// import algosdk from 'algosdk';
import MyHeader from './components/header/header.component';

function App() {
  return (
    <div>
      <MyHeader />
      <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8 m-10">
        <p className="text-3xl text-gray-700 font-bold mb-5">NFT AirDrop</p>
      </div>
    </div>
  );
}

export default App;
