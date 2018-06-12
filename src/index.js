import './style.css'
import Vue from 'vue'
import { gql_request } from './graphql.js'

var vm = new Vue({
  el: '#vue',
  data: {
    display_data: {},
    seen_uuids: [],
    uuid_input: '66eeaffc-158c-11e7-803e-0242ac110017',
    display_name: '',
    loading: true
  },
  mounted: function() {
    this.initGraph()
  },
  methods: {
    request: function() {
      this.loading = true
      var currentvue = this
      gql_request(currentvue.uuid_input, function(data) {
        console.log(data)
        currentvue.reset_data()
        currentvue.dfs(data['data'], null, 'root')
        currentvue.display_name = data['data']['datasetSpecifications']['edges'][0]['node']['name']
        currentvue.loading = false
      })
    },
    dfs: function(data, superitem, type) {
      // Depth first search on returned graphql data
      // to build 3d-force-graph data
      // assumes structure is a tree
      
      //console.log(data)
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
          this.add_display_data(data['node'], superitem)
          this.dfs(data['node'], superitem, type)
        } else {
          var item = data[key]
          // console.log(typeof item)
          if (typeof item == 'object') {
            if (item != null) {
              this.add_display_data(item, superitem, key)
              this.dfs(item, superitem)
            }
          }
        }
      }
    },
    add_display_data: function(node, superitem, type) {
      // console.log(node)
      
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

        this.request()
      })
    }
  }
});
