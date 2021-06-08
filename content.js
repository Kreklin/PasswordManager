
function insertText(elementId, text) {
    document.activeElement.setAttribute("value", text);
}


// adds event listeners for creating and destroying autocomplete list
function setAutofill(account_list) {
    var input_fields = document.getElementsByTagName("input");
    var i;
    for (i = 0; i < input_fields.length; i++) {
        if (input_fields[i].type == "password" || input_fields[i].id.toUpperCase() == "PASSWORD" || input_fields[i].id.toUpperCase() == "USERNAME" || input_fields[i].id.toUpperCase() == "EMAIL") {
            //console.log("Creating autofill for input field '" + input_fields[i].id + "'.");
            input_fields[i].setAttribute("accounts", JSON.stringify(account_list));
            input_fields[i].setAttribute("autocomplete", "off");
            input_fields[i].addEventListener("focus", function () {
                //console.log("Input field '" + this.id + "' is focused.");
                var a, b, c, i;
                a = document.createElement("DIV");
                this.parentElement.appendChild(a);
                a.setAttribute("id", this.id + "_autocomplete_list");
                a.setAttribute("class", "autocomplete_items");
                var j;
                var autofill_list = JSON.parse(this.getAttribute("accounts"));
                for (j = 0; j < autofill_list.length; j++) {
                    b = document.createElement("DIV");
                    a.appendChild(b);
                    b.innerHTML = autofill_list[j]['username'] + ': ' + '••••••••••';
                    c = document.createElement("input");
                    b.appendChild(c);
                    c.setAttribute("type", "hidden");
                    c.setAttribute("value", JSON.stringify(autofill_list[j]));
                    b.addEventListener("click", function(e) {
                        selected_account = JSON.parse(this.getElementsByTagName("input")[0].value);
                        fillInputFields(selected_account);
                        this.parentElement.parentElement.removeChild(document.getElementById(this.parentElement.id));
                    });
                }
            });
            document.addEventListener("click", function (e) {
                var autofills = document.getElementsByClassName("autocomplete_items");
                //console.log(autofills);
                var j;
                //console.log(e.target);
                for (j = 0; j < autofills.length; j++) {
                    input_field = document.getElementById(autofills[j].id.replace("_autocomplete_list", ""));
                    if (autofills[j] != undefined && e.target != autofills[j] && e.target != input_field) {
                        autofills[j].parentElement.removeChild(autofills[j]);
                    }
                }
            });
        }
    }
}


// fill input fields with details from account
function fillInputFields(account) {
    console.log("Filling input fields with details from " + account['username']);
        decryptPassword(account['password'], function(password) {
        var input_fields = document.getElementsByTagName("input");
        var i;
        for (i = 0; i < input_fields.length; i++) {
            if (input_fields[i].type == "password" || input_fields[i].id.toUpperCase() == "PASSWORD") {
                console.log(input_fields[i]);
                input_fields[i].setAttribute("value", password);
            }
            if (input_fields[i].id.toUpperCase() == "USERNAME" || input_fields[i].id.toUpperCase() == "EMAIL") {
                console.log(input_fields[i]);
                input_fields[i].setAttribute("value", account['username']);
            };
        }
    });
}


// if this URL has saved account(s), setup autofill
chrome.storage.local.get('password_storage', function (storage) {
    var url = stripUrl(document.URL);
    if (storage['password_storage']['account_database'][url] != undefined) {
        setAutofill(storage['password_storage']['account_database'][url]);
    }
})

/*
// message handler
chrome.runtime.onMessage.addListener(
    function (request, sender) {
        switch(request.action) {
            case 'insertText':
                insertText(request.elementId, request.text)
                break;
            case 'setAutofill':
                setAutofill(storage['account_database'][document.URL]);
                break;
            default:
                console.log("Invalid request.");
        }
    }
);*/