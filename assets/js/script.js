const API_KEY = '_eZsQjn9dYfcgwYE16npzrwQNQQ';
const API_URL = 'https://ci-jshint.herokuapp.com/api'
const resultsModal = new bootstrap.Modal(document.getElementById("resultsModal"));

document.getElementById("status").addEventListener("click", e => getStatus(e));
document.getElementById("submit").addEventListener("click", e => postForm(e));

async function getStatus(e){
    const queryString = `${API_URL}?api_key=${API_KEY}`;

    const response = await fetch(queryString);

    const data = await response.json();

    if (response.ok) {
        displayStatus(data);
    } else {
        displayException(data);
        throw new Error(data.error);
    }
}

function displayStatus(data) {
    document.getElementById('resultsModalTitle').innerText = "API Key Status";
    document.getElementById('results-content').innerText = `Your key is valid until \n ${data.expiry}`;
    resultsModal.show();
}

function getOptions(form) {

    let formOptions = [];

    for (let entry of form) {
        if (entry[0] === 'options') {
            formOptions.push(entry[1]);
        }
    }

    form.delete("options");
    form.append("options", formOptions.join());

    return form;
}

async function postForm(e){
    const form = getOptions(new FormData(document.getElementById("checksform")));

    for (let entry of form.entries()) {
        console.log(entry);
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": API_KEY,
        },
        body: form,
    });

    const data = await response.json();

    if (response.ok) {
        displayErrors(data);
    } else {
        displayException(data);
        throw new Error(data.error);
    };
}

function displayErrors(data) {
    let heading = `JSHint Results for ${data.file}`;

    if (data.total_errors === 0) {
        results = `<div class="no_errors">No errors reported!</div>`;
    } else {
        results = `<div>Total Errors: <span class="error_count">${data.total_errors}</span></div>`
        for (let error of data.error_list) {
            results += `<div>At line <span class="line">${error.line}</span>, `;
            results += `column <span class="column">${error.col}</span></div>`;
            results += `<div class="error">${error.error}</div>`;
        }
    }
    document.getElementById('resultsModalTitle').innerText = heading;
    document.getElementById('results-content').innerHTML = results;
    resultsModal.show();
}

function displayException(data) {
    let heading = "An exception occurred";
    let exception = `<div>The API returned status code <strong>${data.status_code}</strong></div>`
    exception += `<div>Error number: <strong>${data.error_no}</strong></div>`
    exception += `<div>Error text: <strong>${data.error}</strong></div>`

    document.getElementById('resultsModalTitle').innerText = heading;
    document.getElementById('results-content').innerHTML = exception;
    resultsModal.show();
}