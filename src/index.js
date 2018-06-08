import { jsonToGraphQLQuery } from 'json-to-graphql-query'

const default_uuid = "6b5b5d6a-158c-11e7-803e-0242ac110017"

// graphql_query = '{ metadata (uuid: \"' + default_uuid + '\") { edges { node { uuid name } } } }',
const base_url = 'https://registry.aristotlemetadata.com/api/graphql/api?raw=true'

var graphql_query = {
  query: {
    dataElements: {
      __args: {
        uuid: default_uuid
      },
      edges: {
        node: {
          name: true
        }
      }
    }
  }
}

var text_gql_query = jsonToGraphQLQuery(graphql_query)
console.log(text_gql_query)

const request_options = {
  'method': 'GET',
  'headers': {
    'Accept': 'application/json',
  },
  'mode': 'cors',
}

var url = base_url + '&query=' + text_gql_query
var display_data = {}

function reset_data() {
  display_data = {
    'nodes': [],
    'links': []
  }
}

function dfs(data, superitem) {
  // Depth first search on returned graphql data
  // to build 3d-force-graph data
  // assumes structure is a tree
  
  console.log(data)
  var keys = Object.keys(data)
  //console.log(keys)
  
  if ('uuid' in data) {
    superitem = data['uuid']
  }

  for (var i=0; i < keys.length; i++) {
    var key = keys[i]

    if (key == 'edges') {
      for (var j=0; j < data['edges'].length; j++) {
        var edge = data['edges'][j]
        dfs(edge, superitem)
      }
    } else if (key == 'node') {
      //console.log('adding a node')
      display_data['nodes'].push({
        'id': data['node']['uuid'],
        'name': data['node']['name'],
        'val': 1
      })
      
      if (superitem != null) {
        display_data['links'].push({
          'source': superitem,
          'target': data['node']['uuid']
        })
      }

      dfs(data['node'], superitem)
    } else {
      var item = data[key]
      console.log(typeof item)
      if (typeof item == 'object') {
        dfs(item, superitem)
      }
    }
  }

}

fetch(url, request_options).then(
  function(response) {
    console.log(response.status)
    response.json().then(
      function(data) {
        reset_data()
        dfs(data['data'], null)
    })
  }
);
