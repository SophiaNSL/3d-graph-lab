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
    baseurl: 'registry.aristotlemetadata.com',
    search_text: '',
    display_name: '',
    loading: true,
    search_loading: false,
    search_results: {},
    search_display: false,
    display_info: {},
    error_message: '',
    colormap: {
      datasetSpecification: '#e31a1c',
      dataElement: '#1f78b4',
      dataElementConcept: '#b2df8a',
      objectClass: '#33a02c',
      valueDomain: '#a6cee3',
      property: '#fb9a99'
    }
  },
  mounted: function() {
    this.initGraph()
  },
  computed: {
    prettymap: function() {
      var pmap = {}
      for (var key in this.colormap) {
        var newkey = this.uncamel(key)
        pmap[newkey] = this.colormap[key]
      }
      return pmap
    }
  },
  methods: {
    request_uuid: function(uuid) {
      // Request a dss by uuid and display it
      this.loading = true
      this.uuid_input = uuid
      this.request()
    },
    request: function() {
      // Request the current uuid and display it if successfull
      this.loading = true
      var currentvue = this
      gql_request(
        this.baseurl,
        currentvue.uuid_input, 
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
      // Perform a search request and display results
      this.search_results = {}
      this.search_loading = true
      this.search_display = true
      this.error_message = ''
      var cvue = this
      gql_search(
        this.baseurl,
        cvue.search_text,
        function(data) {
          cvue.search_results = data['data']['datasetSpecifications']['edges']
          cvue.search_loading = false
        },
        function(error) {
          cvue.search_results = {}
          cvue.search_loading = false
          cvue.error_message = "Search could not be completed"
        }
      )
    },
    searchHide: function(event) {
      // Hide the search results on focusout
      if (event.relatedTarget != null) {
        if (!event.relatedTarget.classList.contains('list-group-item')) {
          this.search_display=false
        }
      } else {
        this.search_display=false
      }
    },
    searchKey: function(event) {
      // Search box on keyup
      if (event.keyCode == 13) {
        var button = document.getElementById('searchButton')
        button.focus()
        button.click()
      }
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
      // Adds data returned by dfs to the graph
      
      if ('uuid' in node && 'name' in node) {

        if (!this.seen_uuids.includes(node['uuid'])) {

          var nodeobj = {
            'id': node['uuid'],
            'name': node['name'],
            'val': 1,
            'type': type
          }

          var nodecolor = this.colormap[type]
          if (nodecolor != undefined) {
            nodeobj.color = nodecolor
          }


          this.display_data['nodes'].push(nodeobj)
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
      // Reset the data, used on new load
      this.display_data = {
        'nodes': [],
        'links': []
      }
      this.seen_uuids = []
      this.display_info = {}
      this.error_message = ''
      this.search_results = {}
      this.search_display = false
    },
    initGraph: function() {
      // Initialise the graph
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
      // Set the display info (runs on node click)
      var full_url = 'https://' + this.baseurl + '/item/'

      var display_type = this.uncamel(node.type)

      this.display_info = {
        Name: node.name,
        Type: display_type,
        Link: full_url + node.id
      }
    },
    uncamel: function(text) {
      var display_text = text
        // Spaces before caps
        .replace(/([A-Z])/g, ' $1')
        // Capitalise first letter
        .replace(/^./, function(str){ return str.toUpperCase(); })

      return display_text
    }
  }
});
