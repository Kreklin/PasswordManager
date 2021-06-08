chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get("password_storage", function(storage) {
        if (storage["password_storage"]["password_key"] == null) {
            generateKey();
            bgLog("Key generated.");
        }
    });
    
});

