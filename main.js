const serverUrl = "https://klpxwezyuiua.usemoralis.com:2053/server"; //Server url from moralis.io
const appId = "SJlvpL4zKheiaYlFnUpSL5ozOZsq7D7Q45nbwckX"; // Application id from moralis.io

//If searching for a cutom coin = true
var custom_coin = false;
var from;

//let currentTrade = {};
let currentSelectSide;
let tokens;
let fromToken;
let toToken;
let slippage;

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
        document.getElementById("login_button").innerText = "Logout";

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
    else {
        logged_in = false;
        document.getElementById("login_button").innerText = "Sign in with Metamask";
    }
}

//Adds Searched Token info to vars, and prints to console.
// Will be framework for adding coin to 'modal'
function listSearchedTokens(found_token) {
    console.log(found_token.name);
    const fname = JSON.stringify(found_token.name);
    let fsymbol = found_token.symbol;
    let flogo = found_token.logo;
    let faddress = found_token.address;
    let fdecimals = found_token.decimals;
    console.log(fdecimals);

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

    selectToken(found_token);
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
        parent.appendChild(div);
    }
}

//Gets called when the token is clicked from the modal
async function selectToken(address) {
    closeModal();
    console.log(address.name);

    if (custom_coin) {
        console.log("Using custom token address: " + address.name);
        if (currentSelectSide == 'from') {
            fromToken = address;
        }
        if (currentSelectSide == 'to') {
            toToken = address;
        }
        console.log(fromToken + "This is the log I added");
        //currentTrade[currentSelectSide] = address;
        renderInterface();
        getQuote();
    } else {
        //currentTrade[currentSelectSide] = tokens[address];
        console.log("Using default token address: " + tokens[address].name);
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

function renderInterface() {
    if (currentSelectSide == 'from') {
        //document.getElementById("from_token_img").src = currentTrade.from.logo;
        document.getElementById("from_token_text").innerHTML =
            fromToken.symbol;
    }
    if (currentSelectSide == 'to') {
        //document.getElementById("to_token_img").src = currentTrade.to.logoURI;
        document.getElementById("to_token_text").innerHTML = toToken.symbol;
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
    //document.getElementById("testing").innerText = searchedTokenAddress;
    const options = { chain: "bsc", addresses: searchedTokenAddress };
    //closeModal();
    let searchedTokenMetaData = await token_obj.getTokenMetadata(options);
    if (searchedTokenMetaData) {
        listSearchedTokens(searchedTokenMetaData[0]);
    }
}

function setSlippage() {
    var slipinput = document.getElementById("slippage");
    slippage = slipinput.value;
    //document.getElementById("slippage").innerText = slipinput.value;
    console.log(slippage);
}

//Gets the Quote of Gas, and swap exchange rate. This is what is called when
//typing the in 'Amount' input field
async function getQuote() {
    //If any of the input fields are empty, the0xae3fE7bB963e9A3274061818EA54466E123B1772n dont do anything
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
}

async function trySwap() {
    if (slippage == undefined) {
        alert("Please set slippage");
        return;
    };
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

        console.log(allowance + "This is allowance");

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
        console.log(receipt);
        rtest = receipt;
        //console.log(JSON.stringify(receipt));
        //var myWindow = window.open("", "MsgWindow", "width=200, height=100")
        //myWindow.document.write("<p>This is 'MsgWindow'. I am 200px wide and 100px tall!</p>");
        //alert("Swap Complete");
        txHistory();
    } catch (error) {
        console.log(error);
    }
}

//function recentTransaction() {
//    document.getElementById("test3").innerHTML  ('<a href="https://bscscan.com/tx/' + rtest.transactionHash + '">OPEN ME</a>');
//}

function doSwap(userAddress, amount) {
    return Moralis.Plugins.oneInch.swap({
        chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
        fromTokenAddress: fromToken.address, // The token you want to swap
        toTokenAddress: toToken.address, // The token you want to receive
        amount: amount,
        fromAddress: userAddress, // Your wallet address
        slippage: slippage,
    });
}

function txHistory() {
    document.getElementById("test3").innerHTML = "W3Schools";
    document.getElementById("test3").href = "https://www.w3schools.com";
    document.getElementById("test3").target = "_blank";
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