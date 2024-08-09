import {jsonToGraphQLQuery} from 'json-to-graphql-query'

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

function graphqlRequest(argusJS, query, callback, errorCallback) {
    if (argusJS) {
        argusJS.graphql(query)
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(errorData.errors[0].message || response.status)
                })
            }
            return response.json()
        })
        .then((data) => {
            callback(data)
        })
        .catch((error) => {
            errorCallback(error.message)
        })

    }
}

export function gqlSearch(argusJS, searchText, callback, errorCallback) {
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
    graphqlRequest(argusJS, searchQuery, callback, errorCallback)
}

export function gqlRequest(argusJS, uuid, callback, errorCallback, metadataType) {
    let gqlTextQuery = buildGraphqlQuery(uuid, metadataType)
    graphqlRequest(argusJS, gqlTextQuery, callback, errorCallback)
}
