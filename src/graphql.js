import { jsonToGraphQLQuery } from 'json-to-graphql-query'

function build_graphql_query(uuid="66eeaffc-158c-11e7-803e-0242ac110017") {

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

export function gql_request(callback) {

  var gql_text_query = build_graphql_query()

  // Set request params
  const request_options = {
    'method': 'GET',
    'headers': {
      'Accept': 'application/json',
    },
    'mode': 'cors',
  }

  // Set url
  const base_url = 'https://registry.aristotlemetadata.com/api/graphql/api?raw=true'
  var url = base_url + '&query=' + gql_text_query

  fetch(url, request_options).then(
    function(response) {
      response.json().then(
        function(data) {
          callback(data)
      })
    }
  );
}

