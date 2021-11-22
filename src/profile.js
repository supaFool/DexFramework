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
        await global.helper_functions.loadData();

        for (var i = 0; i < global.user_profile.balances.length; i++) {

        }

        document.getElementById("testing").innerText = global.user_profile.balances[0].balance;
    }

    //If user is not logged in
    else {
        logged_in = false;
        document.getElementById("login_button").innerText = "Sign in with Metamask";
    }
}

init();