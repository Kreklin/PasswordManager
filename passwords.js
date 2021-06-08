// encrypts specified password with saved key
function encryptPassword(password, callback) {
    chrome.storage.local.get("password_storage", function(storage) {
        var key = storage["password_storage"]["password_key"];
        var textBytes = aesjs.utils.utf8.toBytes(password);
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var encryptedBytes = aesCtr.encrypt(textBytes);
        var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
        callback(encryptedHex);
    })
}


// decrypts specified hex with saved key
function decryptPassword(encryptedHex, callback) {
    chrome.storage.local.get("password_storage", function(storage) {
        var key = storage["password_storage"]["password_key"];
        var encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
        var textBytes = aesCtr.decrypt(encryptedBytes);
        var password = aesjs.utils.utf8.fromBytes(textBytes);
        callback(password);
    });
}


// Generates random 128-bit key for AES
function generateKey() {
    var key = [];
    for (var i = 0; i < 16; i++) {
        key.push(Math.floor(Math.random() * 256));
    }
    chrome.storage.local.get('password_storage', function(storage) {
        storage["password_storage"] = {};
        storage["password_storage"]["account_database"] = {};
        storage["password_storage"]["password_key"] = key;
        chrome.storage.local.set(storage);
    })
}

// Generates a random string of length 20 out of common script characters
// Always contains at least 1 number, uppercase letter, and lowercase letter.
function generatePassword(){
    var password;
    var x;
    var i;

    password = "";
    password += generateCharacter(48, 57); // generate random number
    password += generateCharacter(65, 90); // generate random uppercase letter
    password += generateCharacter(97,122); // generate random lowercase letter
    for (i = 3; i < 20; i++) {
        password += generateCharacter(32, 126); // generate random common script character
    }

    return password;
}


// Generates a random character between two unicode values
function generateCharacter(min_char, max_char){
    var x = min_char + (max_char-min_char) * Math.random();
    return String.fromCharCode(x.toFixed(0));
}


// Strips scheme and subdomain from url string
function stripUrl(url) {
    url = url.substring(url.search("://") + 3);
    url = url.substring(0, url.search("/"));
    return url;
}


// Prints message to background page console
function bgLog(message) {
    chrome.extension.getBackgroundPage().console.log(message);
}


// clear all account data
function clearData() {
    chrome.storage.local.get("password_storage", function (storage) {
        storage["password_storage"]["account_database"] = {};
        chrome.storage.local.set(storage);
    })
}

// if account exists, remove from database
function removeAccount(url, username) {
    chrome.storage.local.get("password_storage", function (storage) {
        if (storage["password_storage"]["account_database"][url] != null) {
            for (var i=0; i < storage["password_storage"]["account_database"][url].length; i++) {
                if (storage["password_storage"]["account_database"][url][i]["username"] == username) {
                    storage["password_storage"]["account_database"][url].splice(i, 1);
                    break;
                }
            }
            if (storage["password_storage"]["account_database"][url].length == 0) 
                storage["password_storage"]["account_database"][url] = null;
        }
        chrome.storage.local.set(storage);
    })
}