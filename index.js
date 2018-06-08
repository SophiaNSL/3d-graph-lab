var default_uuid = "6b5b5d6a-158c-11e7-803e-0242ac110017"

graphql_query = '{ metadata (uuid: \"' + default_uuid + '\") { edges { node { uuid name } } } }',
base_url = 'https://registry.aristotlemetadata.com/api/graphql/api?raw=true'

request_options = {
  'method': 'GET',
  'headers': {
    'Accept': 'application/json',
  },
  'mode': 'cors',
}

url = base_url + '&query=' + graphql_query

display_data = {}

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
  keys = Object.keys(data)
  //console.log(keys)
  
  if ('uuid' in data) {
    superitem = data['uuid']
  }

  for (i=0; i < keys.length; i++) {
    key = keys[i]

    if (key == 'edges') {
      for (j=0; j < data['edges'].length; j++) {
        edge = data['edges'][j]
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
      item = data[key]
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
