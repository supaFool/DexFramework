const serverUrl = "https://klpxwezyuiua.usemoralis.com:2053/server"; //Server url from moralis.io
const appId = "SJlvpL4zKheiaYlFnUpSL5ozOZsq7D7Q45nbwckX"; // Application id from moralis.io

let currentTrade = {};
let currentSelectSide;
let tokens;
let logged_in;

async function init() {
  await Moralis.start({ serverUrl, appId });
  await Moralis.enableWeb3();
  await listAvailableTokens();
  currentUser = Moralis.User.current();
  if (currentUser) {
    logged_in = true;
    document.getElementById("swap_button").disabled = false;
    //document.getElementById("login_button").innerText = "Logout";
    document.getElementById("login_button").hidden = true;
  } else {
    logged_in = false;
    document.getElementById("login_button").innerText = "Sign in with Metamask";
  }
}

async function listAvailableTokens() {
  const result = await Moralis.Plugins.oneInch.getSupportedTokens({
    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
  });
  tokens = result.tokens;
  let parent = document.getElementById("token_list");
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
    div.onclick = () => {
      selectToken(address);
    };
    parent.appendChild(div);
  }
}

async function selectToken(address) {
  closeModal();
  console.log(tokens);
  currentTrade[currentSelectSide] = tokens[address];
  const options = { chain: "bsc", addresses: "0x7301D90C8B778e37124C9AE0cf1Cd1E6f7B58a06" };
const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);
  document.getElementById("testing").innerText = JSON.stringify(tokenMetadata);
  console.log(JSON.stringify(tokenMetadata) + "This is current trade");
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

function searchForToken() {
  var bar = document.getElementById("tokenSearch");
    document.getElementById("testing").innerText = bar.value;
 }
function setSlippage() {
  var slipinput = document.getElementById("slippage");
    document.getElementById("slippage").innerText = slipinput.value;
    console.log(slipinput.value);
 }
async function getQuote() {
  if (
    !currentTrade.from ||
    !currentTrade.to ||
    !document.getElementById("from_amount").value
  )
    return;

  let amount = Number(
    document.getElementById("from_amount").value *
    10 ** currentTrade.from.decimals
  );

  const quote = await Moralis.Plugins.oneInch.quote({
    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
    fromTokenAddress: currentTrade.from.address, // The token you want to swap
    toTokenAddress: currentTrade.to.address, // The token you want to receive
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
