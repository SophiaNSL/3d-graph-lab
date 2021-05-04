import { jsonToGraphQLQuery } from 'json-to-graphql-query'
const axios = require('axios')

function buildGraphqlQuery(uuid) {
    return jsonToGraphQLQuery(
        {
            query: {
                datasetSpecifications: {
                    __args: {
                        uuid: uuid
                    },
                    edges: {
                        node: {
                            name: true,
                            uuid: true,
                            dssdeinclusionSet: {
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
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    )
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
    }).catch(errorCallback)
}

export function gqlSearch(baseurl, searchText, callback, errorCallback, apiToken) {
    let searchQuery = jsonToGraphQLQuery({
        query: {
            datasetSpecifications: {
                __args: {
                    name_Icontains: searchText,
                    first: 5
                },
                edges: {
                    node: {
                        name: true,
                        uuid: true
                    }
                }
            }
        }
    })
    graphqlRequest(baseurl, searchQuery, callback, errorCallback, apiToken)
}

export function gqlRequest(baseurl, uuid, callback, error_callback, apiToken) {
    let gql_text_query = buildGraphqlQuery(uuid)
    graphqlRequest(baseurl, gql_text_query, callback, error_callback, apiToken)
}
