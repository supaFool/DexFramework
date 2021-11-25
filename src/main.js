//import * as helper from './w3Helper.js';

const serverUrl = "https://klpxwezyuiua.usemoralis.com:2053/server"; //Server url from moralis.io
const appId = "SJlvpL4zKheiaYlFnUpSL5ozOZsq7D7Q45nbwckX"; // Application id from moralis.io

//If searching for a cutom coin = true
var custom_coin = false;

//Temp var, will probably delete
var from;

//'from' or 'to'
let currentSelectSide;


let tokens;
let fromToken;
let toToken;
let slippage;

//This is being used to hold the Web3API namespace
let token_obj;

//keeps track of if a user is logged in.
let logged_in;

//Called when site is loading.
async function init() {
    await Moralis.start({ serverUrl, appId });
    await Moralis.enableWeb3();
    await listAvailableTokens();

    token_obj = await Moralis.Web3API.token;
    currentUser = await Moralis.User.current();
    global.user_profile.entity = currentUser;
    //document.getElementById("slippage").value = slippage;
    //If User is logged in
    if (currentUser) {
        logged_in = true;
        document.getElementById("swap_button").disabled = false;
        document.getElementById("login_button").innerText = "Logout";
        setHelperData();
        console.log(global.user_profile.born);
    }

    //If user is not logged in
    else {
        logged_in = false;
        document.getElementById("swap_button").disabled = true;
        document.getElementById("login_button").innerText = "Sign in with Metamask";
    }
}

async function setHelperData() {
    global.user_profile.born = JSON.stringify(currentUser.createdAt);
    const options = { chain: 'bsc' }
    global.user_profile.balances = await Moralis.Web3API.account.getTokenBalances(options);
    global.user_profile.native_bal = await Moralis.Web3API.account.getNativeBalance(options);
}

//Adds Searched Token info to vars, and prints to console.
// Will be framework for adding coin to 'modal'
function listSearchedTokens(found_token, log_tokens) {
    //console.log(found_token.name);
    const fname = JSON.stringify(found_token.name);
    let fsymbol = found_token.symbol;
    let flogo = found_token.logo;
    let faddress = found_token.address;
    let fdecimals = found_token.decimals;

    //If statements prevent trying to print a property that has no data.
    if (log_tokens) {
        printTokenProps(fname, fsymbol, flogo, faddress, fdecimals);
    }

    selectToken(found_token);
}

function printTokenProps(fname, fsymbol, flogo, faddress, fdecimals) {
    console.log("Token Name: " + fname);
    console.log("Token Name: " + fname);
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

    if (custom_coin) {
        console.log("Buying token: " + address.name);
        if (currentSelectSide == 'from') {
            fromToken = address;
            //fromToken.amount = address.amount;
        }
        if (currentSelectSide == 'to') {
            toToken = address;
        }
        //currentTrade[currentSelectSide] = address;
        renderInterface();
        getQuote();
    } else {
        //currentTrade[currentSelectSide] = tokens[address];
        console.log("Using from token: " + tokens[address].name);
        if (currentSelectSide == 'from') {
            fromToken = tokens[address];
        }
        if (currentSelectSide == 'to') {
            toToken = tokens[address];
        }
        renderInterface();
        getQuote();
    }
    custom_coin = false;

}

async function renderInterface() {
    if (currentSelectSide == 'from') {
        //document.getElementById("from_token_img").src = currentTrade.from.logo;
        document.getElementById("from_token_text").innerHTML =
            fromToken.symbol;
        console.log(fromToken.address);

        if (fromToken.address == global.helper_data.bnb_address) {
            console.log("using bnb");

            //Here is the ISSUE
            console.log(global.user_profile.native_bal.balance / 10 ** 18);
            document.getElementById("bnbdiv_from").innerText = (global.user_profile.native_bal.balance / 10 ** 18).toFixed(6);
            return;
        }

        for (let index = 0; index < global.user_profile.balances.length; index++) {
            const id = global.user_profile.balances[index];
            if (id.token_address == fromToken.address) {
                console.log("Found Balance");
                console.log("Found " + id.token_address);
                document.getElementById("bnbdiv_from").innerText = (id.balance / 10 ** id.decimals).toFixed(6);
                return;
            } else {
                //console.log("Didnt Find" + id.token_address + " using address: " + fromToken.address);
                document.getElementById("bnbdiv_from").innerText = "";
            }
        }
    }
    if (currentSelectSide == 'to') {
        //document.getElementById("to_token_img").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = toToken.symbol;

        if (toToken.address == global.helper_data.bnb_address) {
            console.log("using bnb");

            //Here is the ISSUE
            console.log(global.user_profile.native_bal.balance / 10 ** 18);
            document.getElementById("bnbdiv_to").innerText = (global.user_profile.native_bal.balance / 10 ** 18).toFixed(6);
            return;
        } else {
            //console.log("Didnt Find" + id.token_address + " using address: " + fromToken.address);
            document.getElementById("bnbdiv_to").innerText = "";
        }

        console.log(toToken.address);
        for (let index = 0; index < global.user_profile.balances.length; index++) {
            const id = global.user_profile.balances[index];
            if (id.token_address == toToken.address) {
                console.log("Found Balance");
                console.log("Found " + id.token_address);
                document.getElementById("bnbdiv_to").innerText = (id.balance / 10 ** id.decimals).toFixed(6);
                return;
            }
        }
    }
}

async function login() {
    try {
        currentUser = Moralis.User.current();
        if (!currentUser) {
            document.getElementById("login_button").innerText = "Authenticating...";
            currentUser = await Moralis.authenticate();
            document.getElementById("swap_button").disabled = false;
            setHelperData();
        } else {
            logOut();
        }
        document.getElementById("swap_button").disabled = false;
        document.getElementById("login_button").innerText = "Logout";
        logged_in = true;
    } catch (error) {
        if (error.message == "MetaMask Message Signature: User denied message signature.") {
            alert("Login cancelled")
            document.getElementById("login_button").innerText = "Sign in with Metamask";
        }
    }
}
async function logOut() {
    currentUser = await Moralis.User.logOut();
    document.getElementById("login_button").innerText = "Sign in with Metamask";
    document.getElementById("swap_button").disabled = true;

    logged_in = false;
}

async function loginWC() {
    try {
        currentUser = Moralis.User.current();
        if (!currentUser) {
            document.getElementById("login_button_wc").innerText = "Authenticating...";
            currentUser = await Moralis.authenticate({ provider: "walletconnect", chainId: 56 })
            document.getElementById("swap_button").disabled = false;
            setHelperData();
        } else {
            logOutWC();
        }
        document.getElementById("swap_button").disabled = false;
        document.getElementById("login_button_wc").innerText = "Logout";
        logged_in = true;
    } catch (error) {
        if (error.message == "User closed modal") {
            alert("Login cancelled")
            document.getElementById("login_button_wc").innerText = "Sign in with WalletConnect";
        }
    }
}
async function logOutWC() {
    currentUser = await Moralis.User.logOut();
    document.getElementById("login_button_wc").innerText = "Sign in with WalletConnect";
    document.getElementById("swap_button").disabled = true;

    logged_in = false;
}

function openModal(side) {
    currentSelectSide = side;
    if (side == 'from') {
        from = true;
    } else {
        from = false;
    }
    document.getElementById("token_modal").style.display = "block";
}

function closeModal() {
    document.getElementById("token_modal").style.display = "none";
}

async function searchForToken() {
    custom_coin = true;
    var bar = document.getElementById("tokenSearch");
    let searchedTokenAddress = bar.value;
    const options = { chain: "bsc", addresses: searchedTokenAddress };
    let searchedTokenMetaData = await token_obj.getTokenMetadata(options);
    if (searchedTokenMetaData) {
        listSearchedTokens(searchedTokenMetaData[0], false);
    }
}

function setSlippage() {
    var slipinput = document.getElementById("slippage");
    slippage = slipinput.value;
    console.log(slippage);
}

//Gets the Quote of Gas, and swap exchange rate. This is what is called when
//typing the in 'Amount' input field
async function getQuote() {
    //If any of the input fields are empty, then dont do anything
    if (!fromToken ||
        !toToken ||
        !document.getElementById("from_amount").value
    )
        return;

    // Convert the input text to the tenth power
    let amount = Number(
        document.getElementById("from_amount").value *
        10 ** fromToken.decimals
    );

    //set the quote const to whatever oneInch returns when it asks for the quote.
    const quote = await Moralis.Plugins.oneInch.quote({
        chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: fromToken.address, // The token you want to swap
        toTokenAddress: toToken.address, // The token you want to swapreceive
        //Amount of tokens you want to swap from
        amount: amount,
    });
    // console.log(JSON.stringify(quote.toToken.decimals) + "This is the qoute");
    document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
    document.getElementById("to_amount").value =
        quote.toTokenAmount / 10 ** toToken.decimals;
    //Fixes quote not auto updating on NaN
    if (document.getElementById("to_amount").value == "NaN") {
        //console.log("Calling get Quote again");
        getQuote();
        document.getElementById("to_amount").value == "";
    };
    if (document.getElementById("from_amount").value == "NaN") {
        //console.log("Calling get Quote again");
        getQuote();
        document.getElementById("from_amount").value == "";
    };
}
async function getQuoteReverse() {
    //If any of the input fields are empty, then dont do anything
    if (!fromToken ||
        !toToken ||
        !document.getElementById("to_amount").value
    )
        return;

    // Convert the input text to the tenth power
    let amount = Number(
        document.getElementById("to_amount").value *
        10 ** fromToken.decimals
    );

    //set the quote const to whatever oneInch returns when it asks for the quote.
    const quote = await Moralis.Plugins.oneInch.quote({
        chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: toToken.address, // The token you want to swap
        toTokenAddress: fromToken.address, // The token you want to swapreceive
        //Amount of tokens you want to swap from
        amount: amount,
    });
    // console.log(JSON.stringify(quote.toToken.decimals) + "This is the qoute");
    document.getElementById("gas_estimate").innerText = () => { quote.estimatedGas };
    console.log(quote.gas_estimate + " fuel used");
    document.getElementById("from_amount").value =
        quote.toTokenAmount / 10 ** toToken.decimals;
}
async function trySwap() {
    let address = Moralis.User.current().get("ethAddress");
    let amount = Number(
        document.getElementById("from_amount").value *
        10 ** fromToken.decimals
    );

    if (fromToken.symbol !== "BNB") {
        const allowance = await Moralis.Plugins.oneInch.hasAllowance({
            chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: fromToken.address, // The token you want to swap
            fromAddress: address, // Your wallet address
            amount: amount,
        });

        if (!allowance) {
            if (!custom_coin) {
                await Moralis.Plugins.oneInch.approve({
                    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
                    tokenAddress: fromToken.address, // The addresstoken you want to swap
                    fromAddress: address, // Your wallet address
                });
            } else {
                await Moralis.Plugins.oneInch.approve({
                    chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
                    tokenAddress: fromToken.address, // The token you want to swap
                    fromAddress: address, // Your wallet address
                });
            }
        }
    }
    try {
        let receipt = await doSwap(address, amount);
        if (receipt.description == "cannot estimate") {
            alert("Please allow for more slippage.");
        }
        console.log(receipt);
        rtest = receipt;
        clearAmounts();
        txHistory();
        alert("Swap Complete");
    } catch (error) {
        if (error.code == 4001) {
            alert("Transaction cancelled");
            clearAmounts();
        }
        console.log(error);
    }
}
//For clearing text input boxes after swap complete
function clearAmounts() {
    document.getElementById("from_amount").value = "";
    document.getElementById("to_amount").value = "";
    document.getElementById("slippage").value = "";
}

function doSwap(userAddress, amount) {
    if (slippage) {
        return Moralis.Plugins.oneInch.swap({
            chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: fromToken.address, // The token you want to swap
            toTokenAddress: toToken.address, // The token you want to receive
            amount: amount,
            fromAddress: userAddress, // Your wallet address
            slippage: slippage,
        });
    } else {
        alert("Please Set Slippage");
    }
}

function txHistory() {
    var url = "https://bscscan.com/tx/";
    var tId = rtest.transactionHash;



    document.getElementById("test3").innerHTML = " <a href='" + url + tId + "'>" + "View Transaction" + "</a> ";
}

function openSidebar() {
    $('.ui.sidebar')
        .sidebar('toggle');
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
document.getElementById("login_button_wc").onclick = loginWC;
document.getElementById("from_amount").oninput = getQuote;
document.getElementById("to_amount").oninput = getQuoteReverse;
document.getElementById("swap_button").onclick = trySwap;
document.getElementById("search_button").onclick = searchForToken;
document.getElementById("slippage").oninput = setSlippage;