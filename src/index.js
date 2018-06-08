import { jsonToGraphQLQuery } from 'json-to-graphql-query'
import ForceGraph3D from '3d-force-graph'

// Setup graphql query

const default_uuid = "66eeaffc-158c-11e7-803e-0242ac110017"

var graphql_query = {
  query: {
    datasetSpecifications: {
      __args: {
        uuid: default_uuid
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

var text_gql_query = jsonToGraphQLQuery(graphql_query)
console.log(text_gql_query)

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
var url = base_url + '&query=' + text_gql_query
var display_data = {}

// Setup Graph

const graph_elem = document.getElementById('3d-graph')
var aristotleGraph = ForceGraph3D()(graph_elem);
var seen_uuids = []

function reset_data() {
  display_data = {
    'nodes': [],
    'links': []
  }
}

function add_display_data(node, superitem) {
  // console.log(node)
  
  if ('uuid' in node && 'name' in node) {

    if (!seen_uuids.includes(node['uuid'])) {
      display_data['nodes'].push({
        'id': node['uuid'],
        'name': node['name'],
        'val': 1
      })
      seen_uuids.push(node['uuid'])
    }
    
    if (superitem != null) {
      display_data['links'].push({
        'source': superitem,
        'target': node['uuid']
      })
    }

    aristotleGraph.graphData(display_data);

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
    } else if (key == 'dssdeinclusionSet') {
      for (var k=0; k < data['dssdeinclusionSet'].length; k++) {
        var item = data['dssdeinclusionSet'][k]
        dfs(item, superitem)
      }
    } else if (key == 'node') {
      add_display_data(data['node'], superitem)
      dfs(data['node'], superitem)
    } else {
      var item = data[key]
      // console.log(typeof item)
      if (typeof item == 'object') {
        if (item != null) {
          add_display_data(item, superitem)
          dfs(item, superitem)
        }
      }
    }
  }
}

// Make request

fetch(url, request_options).then(
  function(response) {
    response.json().then(
      function(data) {
        reset_data()
        dfs(data['data'], null)
    })
  }
);
