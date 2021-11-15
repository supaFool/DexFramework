const serverUrl = "https://klpxwezyuiua.usemoralis.com:2053/server"; //Server url from moralis.io
const appId = "SJlvpL4zKheiaYlFnUpSL5ozOZsq7D7Q45nbwckX"; // Application id from moralis.io


let currentTrade = {};
let currentSelectSide;
let tokens;



//This is being used to hold the Web3API namespace 
let token_obj;


let logged_in;


//Called when site is loading.
async function init() {
  await Moralis.start({ serverUrl, appId });
  await Moralis.enableWeb3();
  await listAvailableTokens();

  token_obj = await Moralis.Web3API.token;
  currentUser = Moralis.User.current();

  //If User is logged in
  if (currentUser) {
    logged_in = true;
    document.getElementById("swap_button").disabled = false;
    document.getElementById("login_button").hidden = true;

    //Option being used by Web3API.token search.
    //We will add the Search value to the 'address'
    //const options = { chain: "bsc", addresses: searchedTokenAddress };

    //Sets what Web3 sends back in a Var
//let tokenMetadata = await token_obj.getTokenMetadata(options);

    //Since it is only returning one token, set the index to '0', and grab that tokens name, and add to Div under swap box
  //document.getElementById("testing").innerText = tokenMetadata[0].name;

  //log all data recieved from Web3API
  //console.log(JSON.stringify(tokenMetadata) + "This is current trade");
  //listSearchedTokens(tokenMetadata[0]);
  }

  //If user is not logged in
  else 
  {
    logged_in = false;
    document.getElementById("login_button").innerText = "Sign in with Metamask";
  }

}

//Adds Searched Token info to vars, and prints to console.
// Will be framework for adding coin to 'modal'
function listSearchedTokens(found_token){
  console.log(found_token.name);
  const fname = JSON.stringify(found_token.name)
  let fsymbol = found_token.symbol;
  let flogo = found_token.logo;
  let faddress = found_token.address;
  let fdecimals = found_token.decimals;

  
  //If statements prevent trying to print a property that has no data.
  
    console.log("Token Name: " + fname);
    
  if (fsymbol) {
    console.log("Token Symbol: " + fsymbol);
  }
  if (flogo) {
    console.log("Token Logo: " + flogo);
  }
  if (faddress) {
    console.log("Token Address: " + faddress);
  }
  if (fdecimals) {
    console.log("Token Decimals: " + fdecimals);
  }
}

async function listAvailableTokens() {

  //result holds the data returned by the 1inche plugin. Same as Token_obj, only the token vars are named differently.
  //refer to line '100' this logo property is named 'logoURI', compared to being named 'logo' in the WEB3 return (line: 60).
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
  });
  tokens = result.tokens;
  let parent = document.getElementById("token_list");

  //Creates a new div for each token returned.
  for (const address in tokens) {
    let token = tokens[address];
    let div = document.createElement("div");
    div.setAttribute("data-address", address);
    div.className = "token_row";
    let html = `
        <img class="token_list_img" src="${token.logoURI}">
        <span class="token_list_text">${token.symbol}</span>
        `;
    div.innerHTML = html;

    //attaches a listener to each div to call a function when a token is clicked, in this case 'selectToken(adress of the token you clicked.)'
    div.onclick = () => {
      selectToken(address);
    };
    //Dont know WTF this does.
    parent.appendChild(div);
  }
}

//Gets called when the token is clicked from the modal
async function selectToken(address) {
  closeModal();
  console.log(tokens);
  currentTrade[currentSelectSide] = tokens[address];
  renderInterface();
  getQuote();
}

function renderInterface() {
  if (currentTrade.from) {
    document.getElementById("from_token_img").src = currentTrade.from.logoURI;
    document.getElementById("from_token_text").innerHTML =
      currentTrade.from.symbol;
  }
  if (currentTrade.to) {
    document.getElementById("to_token_img").src = currentTrade.to.logoURI;
    document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
  }
}

async function login() {
  try {
    currentUser = Moralis.User.current();
    if (!currentUser) {
      document.getElementById("login_button").innerText = "Authenticating...";
      currentUser = await Moralis.authenticate();
    } else {
      logOut();
    }
    document.getElementById("swap_button").disabled = false;
    document.getElementById("login_button").innerText = "Logout";
    logged_in = true;
  } catch (error) {
    //document.getElementById("login_button").innerText = "Logout";
    console.log(error);
  }
}
async function logOut() {
  currentUser = await Moralis.User.logOut();
  document.getElementById("login_button").innerText = "Log In";
  logged_in = false;
}

function openModal(side) {
  currentSelectSide = side;
  document.getElementById("token_modal").style.display = "block";
}
function closeModal() {
  document.getElementById("token_modal").style.display = "none";
}

async function searchForToken() {
  var bar = document.getElementById("tokenSearch");
  const searchedTokenAddress = bar.value;
  document.getElementById("testing").innerText = searchedTokenAddress;
    const options = { chain: "bsc", addresses: searchedTokenAddress };
    closeModal();
    let searchedTokenMetaData = await token_obj.getTokenMetadata(options)
    listSearchedTokens(searchedTokenMetaData[0]);
 }
function setSlippage() {
  var slipinput = document.getElementById("slippage");
    document.getElementById("slippage").innerText = slipinput.value;
    console.log(slipinput.value);
 }

 //Gets the Quote of Gas, and swap exchange rate. This is what is called when 
 //typing the in 'Amount' input field
async function getQuote() {

  //If any of the input fields are empty, then dont do anything
  if (
    !currentTrade.from ||
    !currentTrade.to ||
    !document.getElementById("from_amount").value
  )
    return;


  // Convert the input text to the tenth power
  let amount = Number(
    document.getElementById("from_amount").value *
    10 ** currentTrade.from.decimals
  );
  
  //set the quote const to whatever oneInch returns when it asks for the quote.
  const quote = await Moralis.Plugins.oneInch.quote({
    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    //Amount of tokens you want to swap from
    amount: amount,
  });
  console.log(quote);
  document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
  document.getElementById("to_amount").value =
    quote.toTokenAmount / 10 ** quote.toToken.decimals;
}

async function trySwap() {
  let address = Moralis.User.current().get("ethAddress");
  let amount = Number(
    document.getElementById("from_amount").value *
    10 ** currentTrade.from.decimals
  );
  if (currentTrade.from.symbol !== "BNB") {
    const allowance = await Moralis.Plugins.oneInch.hasAllowance({
      chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
      fromTokenAddress: currentTrade.from.address, // The token you want to swap
      fromAddress: address, // Your wallet address
      amount: amount,
    });
    console.log(allowance);
    if (!allowance) {
      await Moralis.Plugins.oneInch.approve({
        chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
        tokenAddress: currentTrade.from.address, // The token you want to swap
        fromAddress: address, // Your wallet address
      });
    }
  }
  try {
    let receipt = await doSwap(address, amount);
    alert("Swap Complete");
  } catch (error) {
    console.log(error);
  }
}

function doSwap(userAddress, amount) {
  return Moralis.Plugins.oneInch.swap({
    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
    amount: amount,
    fromAddress: userAddress, // Your wallet address
    slippage: slipinput.value,
  });
}

init();

document.getElementById("modal_close").onclick = closeModal;
document.getElementById("lg").onclick = logOut;
document.getElementById("from_token_select").onclick = () => {
  openModal("from");
};
document.getElementById("to_token_select").onclick = () => {
  openModal("to");
};
document.getElementById("login_button").onclick = login;
document.getElementById("from_amount").oninput = getQuote;
document.getElementById("swap_button").onclick = trySwap;
document.getElementById("search_button").onclick = searchForToken;
document.getElementById("slippage").oninput = setSlippage;
