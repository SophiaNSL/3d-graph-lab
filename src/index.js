import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue from 'vue'
import {gqlRequest, gqlSearch} from './graphql.js'

new Vue({
    el: '#vue',
    data: {
        displayData: {},
        seenUuids: [],
        uuidInput: '66eeaffc-158c-11e7-803e-0242ac110017',
        baseurl: 'registry.aristotlemetadata.com',
        placeHolder: 'e.g. registry.aristotlemetadata.com',
        apiToken: '',
        apiTokenInputType: 'password',
        apiTokenButtonText: 'Show Token',
        searchText: '',
        metadataType: '',
        displayName: '',
        displayType: '',
        loading: true,
        searchLoading: false,
        searchResults: {},
        searchDisplay: false,
        displayInfo: {},
        errorMessage: '',
        colormap: {
            datasetSpecification: '#e31a1c',
            distribution: '#ff6e00',
            dataElement: '#1f78b4',
            dataElementConcept: '#b2df8a',
            objectClass: '#33a02c',
            valueDomain: '#a6cee3',
            property: '#fb9a99',
        },
    },
    mounted: function() {
        this.initGraph()
    },
    computed: {
        prettyMap: function() {
            let pMap = {}
            for (let key in this.colormap) {
                pMap[this.unCamel(key)] = this.colormap[key]
            }
            return pMap
        },
    },
    methods: {
        requestUuid: function(node) {
            /* Request a dss by uuid and display it. */
            this.searchText = node.name
            this.uuidInput = node.uuid
            this.metadataType = node.metadataType
            this.searchDisplay = false
            this.request()
        },
        request: function() {
            /* Request the current uuid and display it if successful. */
            this.loading = true
            let currentVue = this

            gqlRequest(
                this.baseurl,
                currentVue.uuidInput,
                function(data) {
                    if ('datasetSpecifications' in data['data']) {
                        currentVue.resetData()
                        currentVue.dfs(data['data'], null, 'datasetSpecification')
                        currentVue.displayName = data['data']['datasetSpecifications']['edges'][0]['node']['name']
                        currentVue.displayType = 'Data Set Specification'
                    } else if ('distributions' in data['data']) {
                        currentVue.resetData()
                        currentVue.dfs(data['data'], null, 'distribution')
                        currentVue.displayName = data['data']['distributions']['edges'][0]['node']['name']
                        currentVue.displayType = 'Distribution'
                    } else {
                        currentVue.errorMessage = "Not a valid UUID"
                    }
                    currentVue.loading = false
                },
                function(error) {
                    currentVue.errorMessage = "Request could not be completed"
                    currentVue.loading = false
                },
                this.apiToken,
                this.metadataType
            )
        },
        search: function() {
            /* Perform a search request and display results. */
            this.searchResults = {}
            this.searchLoading = true
            this.searchDisplay = true
            this.errorMessage = ''
            let cVue = this
            gqlSearch(
                this.baseurl,
                cVue.searchText,
                function(data) {
                    let datasetSpecificationEdges = data['data']['datasetSpecifications']['edges']
                    let distributionEdges = data['data']['distributions']['edges']
                    cVue.searchResults = datasetSpecificationEdges.concat(distributionEdges)
                    cVue.searchLoading = false
                },
                function(error) {
                    cVue.searchResults = {}
                    cVue.searchLoading = false
                    cVue.errorMessage = error
                },
                this.apiToken
            )
        },
        searchHide: function(event) {
            /* Hide the search results on focusout. */
            if (event.relatedTarget != null) {
                if (!event.relatedTarget.classList.contains('list-group-item')) {
                    this.searchDisplay=false
                }
            } else {
                this.searchDisplay=false
            }
        },
        searchKey: function(event) {
            /* Search box on keyup. */
            if (event.keyCode === 13) {
                let button = document.getElementById('searchButton')
                button.focus()
                button.click()
            }
        },
        dfs: function(data, superItem, type) {
            /* Depth first search on returned graphql data to build 3d-force-graph data.
            Assumes structure is a tree. */

            let keys = Object.keys(data)

            if ('uuid' in data) {
                superItem = data['uuid']
            }

            for (let key of keys) {
                if (key === 'edges') {
                    for (let edge of data['edges']) {
                        this.dfs(edge, superItem, type)
                    }
                } else if (key === 'dssdeinclusionSet') {
                    for (let dssDeInclusion of data['dssdeinclusionSet']) {
                        this.dfs(dssDeInclusion, superItem, type)
                    }
                } else if (key === 'distributiondataelementpathSet') {
                    for (let distributionDataElementPath of data['distributiondataelementpathSet']) {
                        this.dfs(distributionDataElementPath, superItem, type)
                    }
                } else if (key === 'node') {
                    this.addDisplayData(data['node'], superItem, type)
                    this.dfs(data['node'], superItem, type)
                } else {
                    let item = data[key]
                    if (typeof item == 'object') {
                        if (item != null) {
                            this.addDisplayData(item, superItem, key)
                            this.dfs(item, superItem, type)
                        }
                    }
                }
            }
        },
        addDisplayData: function(node, superItem, type) {
            /* Adds data returned by dfs to the graph. */

            if ('uuid' in node && 'name' in node) {
                if (!this.seenUuids.includes(node['uuid'])) {
                    let nodeObj = {
                        'id': node['uuid'],
                        'name': node['name'],
                        'val': 1,
                        'type': type
                    }
                    let nodeColor = this.colormap[type]
                    if (nodeColor !== undefined) {
                        nodeObj.color = nodeColor
                    }
                    this.displayData['nodes'].push(nodeObj)
                    this.seenUuids.push(node['uuid'])
                }
                if (superItem != null) {
                    this.displayData['links'].push({
                        'source': superItem,
                        'target': node['uuid']
                    })
                }
                this.aristotleGraph.graphData(this.displayData)
            }
        },
        resetData: function() {
            /* Reset the data, used on new load. */
            this.displayData = {
                'nodes': [],
                'links': []
            }
            this.seenUuids = []
            this.displayInfo = {}
            this.errorMessage = ''
            this.searchResults = {}
            this.searchDisplay = false
        },
        initGraph: function() {
            /* Initialise the graph.  */
            this.loading = true

            let graphElem = document.getElementById('3d-graph')
            const container = graphElem.parentElement.parentElement
            const containerWidth = container.clientWidth
            const containerPaddingLeft = parseInt(getComputedStyle(container).getPropertyValue('padding-left'))
            const containerPaddingRight = parseInt(getComputedStyle(container).getPropertyValue('padding-right'))
            const graphWidth = containerWidth - containerPaddingLeft - containerPaddingRight
            graphElem.style.width = `${graphWidth}px`

            import(/* webpackChunkName: "3d-force-graph" */ '3d-force-graph').then(tdfg => {

                let ForceGraph3D = tdfg.default

                // Setup Graph
                this.aristotleGraph = ForceGraph3D()(graphElem)
                    .nodeAutoColorBy('type')
                    .width(graphWidth)
                    .height(720)
                    .onNodeClick(this.setDisplayInfo)
                this.request()
            })
        },
        setDisplayInfo: function(node) {

            this.displayInfo = {
                Name: node.name,
                Type: this.unCamel(node.type),
                Link: `https://${this.baseurl}/item/${node.id}`,  // Set the display info (runs on node click).
            }
        },
        unCamel: function(text) {
            return text
                .replace(/([A-Z])/g, ' $1')  // Spaces before caps.
                .replace(/^./, function (str) {
                    return str.toUpperCase()  // Capitalise first letter.
                })
        },
        showToken: function () {
            if (this.apiTokenInputType === 'text') {
                this.apiTokenInputType = 'password'
                this.apiTokenButtonText = 'Show Token'
            } else if (this.apiTokenInputType === 'password') {
                this.apiTokenInputType = 'text'
                this.apiTokenButtonText = 'Hide Token'
            }
        },
        getDropdownText: function (node) {
            if (node.metadataType === 'aristotle_dse:distribution') {
                return `${node.name} (Distribution)`
            }
            return `${node.name} (DSS)`
        },
    },
})
