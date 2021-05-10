import {jsonToGraphQLQuery} from 'json-to-graphql-query'

const axios = require('axios')

function buildGraphqlQuery(uuid, metadataType) {
    function getQuery(field, fieldSet) {
        return {
            query: {
                [field]: {
                    __args: {
                        uuid: uuid
                    },
                    edges: {
                        node: {
                            name: true,
                            uuid: true,
                            [fieldSet]: {
                                dataElement: {
                                    uuid: true,
                                    name: true,
                                    dataElementConcept: {
                                        uuid: true,
                                        name: true,
                                        objectClass: {
                                            uuid: true,
                                            name: true
                                        },
                                        property: {
                                            uuid: true,
                                            name: true
                                        }
                                    },
                                    valueDomain: {
                                        uuid: true,
                                        name: true
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    }
    if (metadataType === 'aristotle_dse:distribution') {
        return jsonToGraphQLQuery(getQuery('distributions', 'distributiondataelementpathSet'))
    } else {
        return jsonToGraphQLQuery(getQuery('datasetSpecifications', 'dssdeinclusionSet'))
    }
}

function graphqlRequest(baseurl, query, callback, errorCallback, apiToken) {
    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/graphql',
    }
    if (apiToken) {
        headers.Authorization = `Token ${apiToken}`
    }
    axios({
        method: 'post',
        headers: headers,
        url: `https://${baseurl}/api/graphql/json`,
        data: query,
    }).then((response) => {
        if (response.status !== 200) {
            errorCallback(response.status)
        } else {
            callback(response.data)
        }
    }).catch((error) => {
        errorCallback(error.response.data.detail)
    })
}

export function gqlSearch(baseurl, searchText, callback, errorCallback, apiToken) {
    let params = {
        __args: {
            name_Icontains: searchText,
            first: 5,
        },
        edges: {
            node: {
                name: true,
                uuid: true,
                metadataType: true,
            },
        },
    }
    let searchQuery = jsonToGraphQLQuery(
        {
            query: {
                datasetSpecifications: params,
                distributions: params,
            },
        },
    )
    graphqlRequest(baseurl, searchQuery, callback, errorCallback, apiToken)
}

export function gqlRequest(baseurl, uuid, callback, errorCallback, apiToken, metadataType) {
    let gqlTextQuery = buildGraphqlQuery(uuid, metadataType)
    graphqlRequest(baseurl, gqlTextQuery, callback, errorCallback, apiToken)
}
