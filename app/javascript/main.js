let web3Provider;

if (typeof web3 !== 'undefined') {
  web3Provider = web3.currentProvider;
} else {
  web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545/');
}

window.web3 = new Web3(web3Provider);

async function getContract(json, web3 = window.web3) {
  const contract = TruffleContract(json);
  contract.setProvider(web3.currentProvider);
  return contract.deployed();
}

async function setContracts() {
  const json = await fetch('../../build/contracts/Property.json').then((res) => res.json());
  propertyContract = await getContract(json);

  const event = propertyContract.allEvents({ fromBlock: 0, toBlock: 'latest' });
  event.watch((err, res) => {
    if (err)
      console.log('watch error', err)
    else
      console.log('got an event', res)
  });
}

setContracts();

