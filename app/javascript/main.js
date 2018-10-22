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

  if (document.querySelector('#create-property')) {
    document.querySelector('#create-property').onclick = async () => {
      const price = document.querySelector('#property-price').value;
      try {
        const tx = await propertyContract.createProperty({
          from: alice,
          gas: 250000
        });
        await registerProperty(tx.logs[0].args._tokenId, price);
      } catch(e) {
        alert('Error creating property', e)
      }
    }
  }

  async function reserveProperty(tokenId) {
    try {
      const checkIn = new Date(2018, 09, 10).getTime() / 1000;
      const checkOut = new Date(2018, 09, 15).getTime() / 1000;
      const tx = await propertyRegistryContract.request(tokenId, checkIn, checkOut, {from: bob, gas: 250000});
    } catch(e) {
      alert('Error requesting property', e)
    }
  }

  const event = propertyContract.allEvents({ fromBlock: 0, toBlock: 'latest' });

  event.watch((err, res) => {
    if (err)
      console.log('watch error', err)
    else
      handleEvent(res);
  });

  const registryEvents = propertyRegistryContract.allEvents({ fromBlock: 0, toBlock: 'latest' });

  registryEvents.watch((err, res) => {
    if (err)
      console.log('watch error', err)
    else
      handleEvent(res);
  });

  async function handleEvent(res) {
    if (res.event == "Registered" && document.querySelector('#my-property-list')) {
      getStayData(res.args._tokenId);
    } else if (res.event == "Registered" && document.querySelector('#property-list')) {
      getListingData(res.args._tokenId);
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
      const priceElement = document.createElement("p");
      priceElement.className = "price";
      priceElement.innerHTML = "Price " + tx[0];
      propertyDiv.appendChild(priceElement);
      tx[2].forEach(function(element) {
        requestElement = document.createElement("p");
        requestElement.className = "request";
        requestElement.innerHTML = "Request " + element;
        propertyDiv.appendChild(requestElement);
      });
      document.querySelector('#my-property-list').appendChild(propertyDiv);
    } catch(e) {
      alert('Error getting stay data', e)
    }
  }

  async function getListingData(tokenId) {
    try {
      const tx = await propertyRegistryContract.getStayData(tokenId, {
        from: alice,
        gas: 250000
      });
      const propertyDiv = document.createElement("div");
      propertyDiv.className = "property";
      propertyDiv.appendChild(document.createTextNode("Property " + tokenId));
      const priceElement = document.createElement("p");
      priceElement.className = "price";
      priceElement.innerHTML = "Price " + tx[0];
      propertyDiv.appendChild(priceElement);
      const propertyButton = document.createElement("button");
      const buttonText = document.createTextNode("Reserve");
      propertyButton.appendChild(buttonText);
      propertyButton.onclick = () => {
        reserveProperty(tokenId)
      };
      propertyDiv.appendChild(propertyButton);
      document.querySelector('#property-list').appendChild(propertyDiv);
    } catch(e) {
      alert('Error getting stay data', e)
    }
  }

  async function registerProperty(tokenId, price) {
    try {
      const tx = await propertyRegistryContract.registerProperty(tokenId, price, {from: alice, gas: 250000});
    } catch(e) {
      alert('Error registering property', e)
    }
  }
}

setContracts();
