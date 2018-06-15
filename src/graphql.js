import { jsonToGraphQLQuery } from 'json-to-graphql-query'

function build_graphql_query(uuid) {

  var graphql_query = {
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

  return jsonToGraphQLQuery(graphql_query)
}

function graphql_request(baseurl, query, callback, error_callback) {
  
  // Set request params
  const request_options = {
    'method': 'GET',
    'headers': {
      'Accept': 'application/json',
    },
    'mode': 'cors',
  }

  // Set url
  var api_url = 'https://' + baseurl + '/api/graphql/api?raw=true'
  var url = api_url + '&query=' + query

  fetch(url, request_options)
    .then(
      function(response) {
        if (response.status != 200) {
          error_callback(response.status)
        } else {
          response.json()
            .then(callback)
            .catch(error_callback)
        }
      }
    )
    .catch(error_callback)

}

export function gql_search(baseurl, search_text, callback, error_callback) {

  var search_query = jsonToGraphQLQuery({
    query: {
      datasetSpecifications: {
        __args: {
          name_Icontains: search_text,
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
  graphql_request(baseurl, search_query, callback, error_callback)

}

export function gql_request(baseurl, uuid, callback, error_callback) {

  var gql_text_query = build_graphql_query(uuid)
  graphql_request(baseurl, gql_text_query, callback, error_callback)

}

