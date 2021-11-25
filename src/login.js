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

document.getElementById("login_button").onclick = login;

async function loginWC() {
    try {
        currentUser = Moralis.User.current();
        if (!currentUser) {
            document.getElementById("login_button_wc").innerText = "Authenticating...";
            currentUser = await Moralis.authenticate({ provider: "walletconnect", chainId: 56 })

        } else {
            logOut();
        }
        document.getElementById("login_button_wc").innerText = "Logout";
        logged_in = true;
    } catch (error) {
        if (error.message == "MetaMask Message Signature: User denied message signature.") {
            alert("Login cancelled")
            document.getElementById("login_button_wc").innerText = "Sign in with WalletConnect";
        }
    }
}
async function logOut() {
    currentUser = await Moralis.User.logOut();
    document.getElementById("login_button_wc").innerText = "Sign in with WalletConnect";

    logged_in = false;
}

document.getElementById("login_button_wc").onclick = loginWC;