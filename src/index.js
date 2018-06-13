import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue from 'vue'
import { gql_request, gql_search } from './graphql.js'

var vm = new Vue({
  el: '#vue',
  data: {
    display_data: {},
    seen_uuids: [],
    uuid_input: '66eeaffc-158c-11e7-803e-0242ac110017',
    search_text: '',
    display_name: '',
    loading: true,
    search_loading: false,
    search_results: {},
    display_info: {},
    error_message: ''
  },
  mounted: function() {
    this.initGraph()
  },
  methods: {
    request_uuid: function(uuid) {
      this.loading = true
      this.uuid_input = uuid
      this.request()
    },
    request: function() {
      this.loading = true
      var currentvue = this
      gql_request(currentvue.uuid_input, 
        function(data) {
          // console.log(data)
          if ('datasetSpecifications' in data['data']) {
            currentvue.reset_data()
            currentvue.dfs(data['data'], null, 'datasetSpecification')
            currentvue.display_name = data['data']['datasetSpecifications']['edges'][0]['node']['name']
          } else {
            currentvue.error_message = "Not a valid Dataset UUID"
          }
          currentvue.loading = false
        },
        function(error) {
          currentvue.error_message = "Request could not be completed"
          currentvue.loading = false
        }
      )
    },
    search: function() {
      this.search_loading = true
      var cvue = this
      gql_search(cvue.search_text,
        function(data) {
          cvue.search_results = data['data']['datasetSpecifications']['edges']
          console.log(cvue.search_results)
          cvue.search_loading = false
        },
        function(error) {
          cvue.search_results = {}
          cvue.search_loading = false
        }
      )
    },
    dfs: function(data, superitem, type) {
      // Depth first search on returned graphql data
      // to build 3d-force-graph data
      // assumes structure is a tree
      
      // console.log(data)
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
            this.dfs(edge, superitem, type)
          }
        } else if (key == 'dssdeinclusionSet') {
          for (var k=0; k < data['dssdeinclusionSet'].length; k++) {
            var item = data['dssdeinclusionSet'][k]
            this.dfs(item, superitem, type)
          }
        } else if (key == 'node') {
          this.add_display_data(data['node'], superitem, type)
          this.dfs(data['node'], superitem, type)
        } else {
          var item = data[key]
          // console.log(typeof item)
          if (typeof item == 'object') {
            if (item != null) {
              this.add_display_data(item, superitem, key)
              this.dfs(item, superitem, type)
            }
          }
        }
      }
    },
    add_display_data: function(node, superitem, type) {
      console.log(type)
      
      if ('uuid' in node && 'name' in node) {

        if (!this.seen_uuids.includes(node['uuid'])) {
          this.display_data['nodes'].push({
            'id': node['uuid'],
            'name': node['name'],
            'val': 1,
            'type': type
          })
          this.seen_uuids.push(node['uuid'])
        }
        
        if (superitem != null) {
          this.display_data['links'].push({
            'source': superitem,
            'target': node['uuid']
          })
        }

        this.aristotleGraph.graphData(this.display_data);

      }
    },
    reset_data: function() {
      this.display_data = {
        'nodes': [],
        'links': []
      }
      this.seen_uuids = []
      this.display_info = {}
      this.error_message = ''
      this.search_results = {}
    },
    initGraph: function() {
      this.loading = true

      import(/* webpackChunkName: "3d-force-graph" */ '3d-force-graph').then(tdfg => {

        var ForceGraph3D = tdfg.default

        // Setup Graph
        var graph_elem = document.getElementById('3d-graph')
        this.aristotleGraph = ForceGraph3D()(graph_elem)
          .nodeAutoColorBy('type')
          .width(1280)
          .height(720)
          .onNodeClick(this.setDisplayInfo)

        this.request()
      })
    },
    setDisplayInfo: function(node) {
      var base_url = 'https://registry.aristotlemetadata.com/item/'

      var display_type = node.type
        // Spaces before caps
        .replace(/([A-Z])/g, ' $1')
        // Capitalise first letter
        .replace(/^./, function(str){ return str.toUpperCase(); })

      this.display_info = {
        Name: node.name,
        Type: display_type,
        Link: base_url + node.id
      }
    }
  }
});
