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

const { accounts } = web3.eth;
const alice = accounts[0];
const bob = accounts[1];

async function setContracts() {
  const jsonProperty = await fetch('../../build/contracts/Property.json').then((res) => res.json());
  propertyContract = await getContract(jsonProperty);

  const jsonPropertyRegistry = await fetch('../../build/contracts/PropertyRegistry.json').then((res) => res.json());
  propertyRegistryContract = await getContract(jsonPropertyRegistry);

  document.querySelector('#create-property').onclick = async () => {
    try {
      const tx = await propertyContract.createProperty({
        from: alice,
        gas: 250000
      });
      console.log('Property Created for Alice');
    } catch(e) {
      console.log(e);
      alert('Error creating property', e)
    }
  }

  document.querySelector('#request-property').onclick = async () => {
    try {
      const checkIn = new Date(2018, 09, 10).getTime() / 1000;
      const checkOut = new Date(2018, 09, 15).getTime() / 1000;
      const token = await propertyContract.tokenOfOwnerByIndex(alice, 0);
      const tx = await propertyRegistryContract.request(token, checkIn, checkOut, {from: bob, gas: 250000});
      console.log(tx);
      console.log('Property Request by Bob');
    } catch(e) {
      console.log(e);
      alert('Error requesting property', e)
    }
  }

  const event = propertyContract.allEvents({ fromBlock: 0, toBlock: 'latest' });
  event.watch((err, res) => {
    if (err)
      console.log('watch error', err)
    else
      handleEvent(res);
      console.log('got an event', res)
  });

  async function handleEvent(res) {
    if (res.event == "Transfer") {
      await registerProperty(res.args._tokenId);
      getStayData(res.args._tokenId);
    }
  }

  async function getStayData(tokenId) {
    try {
      const tx = await propertyRegistryContract.getStayData(tokenId, {
        from: alice,
        gas: 250000
      });
      const propertyDiv = document.createElement("div");
      propertyDiv.className = "property";
      propertyDiv.appendChild(document.createTextNode("Property " + tokenId));
      tx[2].forEach(function(element) {
        requestElement = document.createElement("p");
        requestElement.className = "request";
        requestElement.innerHTML = "Request " + element;
        propertyDiv.appendChild(requestElement);
      });
      document.querySelector('#property-list').appendChild(propertyDiv);
      console.log(tx);
      // console.log('Got stay data for Alice');
    } catch(e) {
      // console.log(e);
      alert('Error getting stay data', e)
    }
  }

  async function registerProperty(tokenId) {
    try {
      const tx = await propertyRegistryContract.registerProperty(tokenId, 100, {from: alice, gas: 250000});
      console.log('Property Registered for Alice');
    } catch(e) {
      console.log(e);
      alert('Error registering property', e)
    }
  }
}

setContracts();

