document.getElementById("save_account").onclick = generateAccount;
document.getElementById("generate_password").onclick = togglePassword;
document.getElementById("options").onclick = openOptions;
refreshAccountCount();

function clearData() {
    bgLog("Clearing password data...");
    refreshAccountCount();
    chrome.storage.local.clear();
}

function printData() {
    chrome.storage.local.get('password_storage', function (storage) {
        bgLog(storage);
    });
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}

function togglePassword() {
    if (document.getElementById("generate_password").value == "on") {
        document.getElementById("password").setAttribute("disabled", "");
        document.getElementById("password").setAttribute("value", "");
        document.getElementById("generate_password").value = "off";
    }
    else {
        document.getElementById("password").removeAttribute("disabled");
        document.getElementById("generate_password").value = "on";
    }
}

function generateAccount(){
    var username = document.getElementById("username").value;
    if (username == "") return;
    var password;
    if (document.getElementById("generate_password").value == "off") {
        password = generatePassword();
    }
    else {
        if (document.getElementById("password").value == "") return;
        password = document.getElementById("password").value;
    }

    encryptPassword(password, function (encryptedHex) {
        getActiveUrl(function (url){
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
    
            chrome.storage.local.get('password_storage', function (storage) {
                if (storage['password_storage']['account_database'][url] == undefined) {
                    storage['password_storage']['account_database'][url] = [];
                }
                var i;
                var account_exists = false;
                for (i=0; i < storage['password_storage']['account_database'][url].length; i++) {
                    if (storage['password_storage']['account_database'][url][i]['username'] == username) {
                        // to do: add pop up asking if user wants to overwrite existing password for user
                        account_exists = true;
                        bgLog("An account for this username and url already exists.");
                    }
                }
                if (!account_exists) {
                    storage['password_storage']['account_database'][url].push({"username":username,"password":encryptedHex});
                    bgLog(storage);
                    chrome.storage.local.set(storage);
                    refreshAccountCount();
                }
            });
        });
    });
}


// Retrieves url of active tab
function getActiveUrl(callback) {
    chrome.tabs.query({currentWindow: true, active : true}, function(tabArray){
        var url = stripUrl(tabArray[0].url);
        callback(url);
    });
}


// refreshes the popup for the number of accounts for this url
function refreshAccountCount() {
    var account_number = 0;
    var url = getActiveUrl(function(url) {
        chrome.storage.local.get('password_storage', function (storage) {
            if (storage['password_storage']['account_database'] != undefined) {
                if (storage['password_storage']['account_database'][url] != undefined) {
                    account_number = storage['password_storage']['account_database'][url].length;
                }
            }
            document.getElementById("account_counter").innerText = "You have " + account_number + " account(s) on this website.";
        });
    });
}