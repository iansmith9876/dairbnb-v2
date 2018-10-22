window.addEventListener('load', async () => {

    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();
            setContracts();
        } catch (error) {
            // User denied account access...
        }
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

async function setContracts() {

  async function getContract(json, web3 = window.web3) {
    const contract = TruffleContract(json);
    contract.setProvider(web3.currentProvider);
    return contract.deployed();
  }

  const user = web3.eth.accounts[0];

  const jsonProperty = await fetch('../../build/contracts/Property.json').then((res) => res.json());
  propertyContract = await getContract(jsonProperty);

  const jsonPropertyRegistry = await fetch('../../build/contracts/PropertyRegistry.json').then((res) => res.json());
  propertyRegistryContract = await getContract(jsonPropertyRegistry);

  if (document.querySelector('#create-property')) {
    document.querySelector('#create-property').onclick = async () => {
      const price = document.querySelector('#property-price').value;
      try {
        const tx = await propertyContract.createProperty({
          from: user,
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
      const tx = await propertyRegistryContract.request(tokenId, checkIn, checkOut, {from: user, gas: 250000});
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
      const owner = await propertyContract.ownerOf(tokenId);
      if (owner == user) {
        const tx = await propertyRegistryContract.getStayData(tokenId, {
          from: user,
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
      }
    } catch(e) {
      alert('Error getting stay data', e)
    }
  }

  async function getListingData(tokenId) {
    try {
      const owner = await propertyContract.ownerOf(tokenId);
      const tx = await propertyRegistryContract.getStayData(tokenId, {
        from: user,
        gas: 250000
      });
      const propertyDiv = document.createElement("div");
      propertyDiv.className = "property";
      propertyDiv.appendChild(document.createTextNode("Property " + tokenId));
      const priceElement = document.createElement("p");
      priceElement.className = "price";
      priceElement.innerHTML = "Price " + tx[0];
      propertyDiv.appendChild(priceElement);

      if (owner != user) {
        const propertyButton = document.createElement("button");
        const buttonText = document.createTextNode("Reserve");
        propertyButton.appendChild(buttonText);
        propertyButton.onclick = () => {
          reserveProperty(tokenId)
        };
        propertyDiv.appendChild(propertyButton);
      }

      document.querySelector('#property-list').appendChild(propertyDiv);
    } catch(e) {
      alert('Error getting stay data', e)
    }
  }

  async function registerProperty(tokenId, price) {
    try {
      const tx = await propertyRegistryContract.registerProperty(tokenId, price, {from: user, gas: 250000});
    } catch(e) {
      alert('Error registering property', e)
    }
  }
}
