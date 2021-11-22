const global = {
    user_profile: {
        chain: "bsc",
        entity: "id",
        saved_tokens: "tokens favorited",
        balances: "",
        native_bal: ""
    },

    helper_data: {
        bnb_address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },

    helper_functions: {
        //Loads data to user_profile
        loadData: async function() {
            global.user_profile.born = JSON.stringify(currentUser.createdAt);
            const options = { chain: 'bsc' }
            global.user_profile.balances = await Moralis.Web3API.account.getTokenBalances(options);
            global.user_profile.native_bal = await Moralis.Web3API.account.getNativeBalance(options);
            console.log("Data logged to user");
        }
    }
}