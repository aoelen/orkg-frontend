export const url = process.env.REACT_APP_SERVER_URL;
export const resourcesUrl = `${url}resources/`;
export const predicatesUrl = `${url}predicates/`;
export const statementsUrl = `${url}statements/`;
export const literalsUrl = `${url}literals/`;
export const crossrefUrl = process.env.REACT_APP_CROSSREF_URL;

/**
 * Sends simple GET request to the URL.
 */
export const submitGetRequest = (url) => {
    if (!url) {
        throw new Error('Cannot submit GET request. URL is null or undefined.');
    }

    return new Promise(
        (resolve, reject) => {
            fetch(url, { method: 'GET' })
                    .then((response) => {
                        console.log(`Response type: ${response.type}`);
                        if (!response.ok) {
                            reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                        } else {
                            return resolve(response.json());
                        }
                    });
        }
    );
};

const submitPostRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit POST request. URL is null or undefined.');
    }

    return new Promise(
        (resolve, reject) => {
            fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(data) })
                .then((response) => {
                    console.log(`Response type: ${response.type}`);
                    if (!response.ok) {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    } else {
                        return resolve(response.json());
                    }
                });
        }
    );
};

const submitPutRequest = (url, headers, data) => {
    if (!url) {
        throw new Error('Cannot submit PUT request. URL is null or undefined.');
    }

    return new Promise(
        (resolve, reject) => {
            fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(data) })
                .then((response) => {
                    console.log(`Response type: ${response.type}`);
                    if (!response.ok) {
                        reject(new Error(`Error response. (${response.status}) ${response.statusText}`));
                    } else {
                        return resolve(response.json());
                    }
                });
        }
    );
};

export const updateResource = (id, label) => {
    return submitPutRequest(`${resourcesUrl}${id}`, {'Content-Type': 'application/json'}, {label: label});
};

export const updateLiteral = (id, label) => {
    return submitPutRequest(`${literalsUrl}${id}`, {'Content-Type': 'application/json'}, {label: label});
};

export const createResource = (label) => {
    submitPostRequest(resourcesUrl, {'Content-Type': 'application/json'}, {label: label});
};

export const createLiteral = (label) => {
    submitPostRequest(literalsUrl, {'Content-Type': 'application/json'}, {label: label});
};

export const createResourceStatement = (subjectId, predicateId, objectId) => {
    submitPostRequest(`${statementsUrl}${subjectId}/${predicateId}/${objectId}/`, {'Content-Type': 'application/json'},
            {});
};

export const createLiteralStatement = (subjectId, predicateId, property) => {
    submitPostRequest(`${statementsUrl}${subjectId}/${predicateId}/`, {'Content-Type': 'application/json'},
            {'object': {'id': property}});
};

export const createPredicate = (label) => {
    submitPostRequest(predicatesUrl, {'Content-Type': 'application/json'}, { label: label });
};

export const getPredicate = (id) => {
    submitGetRequest(`${predicatesUrl}${encodeURIComponent(id)}/`);
};

export const getResource = (id) => {
    submitGetRequest(`${resourcesUrl}${encodeURIComponent(id)}/`);
};

export const getPredicatesByLabel = (label) => {
    submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(label));
};
