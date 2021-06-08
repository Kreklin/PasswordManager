fillPasswordTable();
document.getElementById("clear_selected").onclick = clearSelectedAccounts;

function fillPasswordTable() {
    chrome.storage.local.get('password_storage', function (storage) {
        var table = document.getElementById("storage_table_body");
        var url;
        for (url in storage['password_storage']['account_database']) {
            var urlDone = false;
            var account;
            if (storage['password_storage']['account_database'][url] != null) {
                for (account of storage['password_storage']['account_database'][url]) {
                    var row = document.createElement("tr");
                    table.appendChild(row);
                    if (!urlDone) {
                        var urlCell = document.createElement("td");
                        row.appendChild(urlCell);
                        urlCell.innerHTML = url;
                        urlCell.setAttribute("rowspan", storage['password_storage']['account_database'][url].length);
                        urlDone = true;
                    }

                    var usernameCell = document.createElement("td");
                    row.appendChild(usernameCell);
                    usernameCell.innerHTML = account['username'];

                    var passwordCell = document.createElement("td");
                    passwordCell.setAttribute("ciphertext", account['password']);
                    passwordCell.onclick = viewPassword;
                    row.appendChild(passwordCell);
                    passwordCell.innerHTML = "**********";

                    var checkboxCell = document.createElement("td");
                    row.appendChild(checkboxCell);
                    var checkbox = document.createElement("input");
                    checkboxCell.appendChild(checkbox);
                    checkbox.setAttribute("type", "checkbox");
                    checkbox.setAttribute("class", "select_account");
                    checkbox.setAttribute("url", url);
                    checkbox.setAttribute("username", account["username"]);
                }
            }
        }
    })
}

function viewPassword(event) {
    decryptPassword(event.target.getAttribute("ciphertext"), function (password) {
        event.target.innerHTML = password;
    });
    event.target.onclick = hidePassword;
}

function hidePassword(event) {
    event.target.innerHTML = "**********";
    event.target.onclick = viewPassword;
}

function clearAccountData() {
    clearData();
    var table = document.getElementById("storage_table_body");
    while (table.hasChildNodes()) table.removeChild(table.lastChild);
}

function clearSelectedAccounts() {
    var checkboxes = document.getElementsByClassName("select_account");
    for (var i=0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
            removeAccount(checkboxes[i].getAttribute("url"), checkboxes[i].getAttribute("username"));
            var row =  checkboxes[i].parentElement.parentElement;
            row.parentElement.removeChild(row);
        }
    }
}