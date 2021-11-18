const serverUrl = "https://klpxwezyuiua.usemoralis.com:2053/server"; //Server url from moralis.io
const appId = "SJlvpL4zKheiaYlFnUpSL5ozOZsq7D7Q45nbwckX"; // Application id from moralis.io


//keeps track of if a user is logged in.
let logged_in;

//Called when site is loading.
async function init() {
    await Moralis.start({ serverUrl, appId });
    await Moralis.enableWeb3();

    token_obj = await Moralis.Web3API.token;
    currentUser = Moralis.User.current();

    //document.getElementById("slippage").value = slippage;
    //If User is logged in
    if (currentUser) {
        logged_in = true;
        document.getElementById("login_button").innerText = "Logout";
    }

    //If user is not logged in
    else {
        logged_in = false;
        document.getElementById("login_button").innerText = "Sign in with Metamask";
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

    logged_in = false;
}

init();
document.getElementById("login_button").onclick = login;