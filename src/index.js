import ForceGraph3D from '3d-force-graph'
import { gql_request } from './graphql.js'

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

// Setup Graph

const graph_elem = document.getElementById('3d-graph')
var aristotleGraph = ForceGraph3D()(graph_elem);
var display_data = {}
var seen_uuids = []

gql_request(function(data) {
  reset_data()
  dfs(data['data'], null)
})
