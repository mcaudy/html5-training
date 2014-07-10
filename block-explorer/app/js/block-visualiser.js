'use strict';

var d3module = angular.module('blockExplorer.blockVisualiser', []);

d3module.service('visualiseService', function() {
	 this.visualiseTransactions = function(transactions)  {
      // Put our array of transactions into a tree, where the root node has the same 'in' property as its children
      var treeData = {
        'in' : transactions,
        hash: 'This block'
      };

      // For now, I'm limiting the number of children displayed. Otherwise the tree gets too busy
      treeData['in'] = treeData['in'].slice(0, 50);

      var svgSize = 960;
      var treeSize = svgSize * 0.8;
      var transitionDuration = 750;

      var tree = d3.layout.tree()
                  .sort(null)
                  .size([treeSize, treeSize])
                  .children(function(d) {
                    return (!d['in'] || d['in'].length === 0) ? null : d['in'];
                  });

      var nodes = tree.nodes(treeData);
      nodes.forEach(function(node)  {
        node.highlight = false;
      });

      var links = tree.links(nodes);
      links.forEach(function(link)  {
        link.highlight = false;
      });

      // Set zoom behaviour on the svg element. This also seems to enable dragging behaviour. Good times.
      var zoom = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .on('zoom', zoomed);

      var svg = d3.select('svg');
      svg.style('background-color', 'white')
        .style('width', svgSize)
        .style('height', svgSize);
      svg.call(zoom);
      svg.on('dblclick.zoom', null);

      // Render the tree. We start zoomed out with the tree in the middle of the view. We then zoom in on it
      var layoutRoot = svg.append('g')
        .attr('class', 'container')
        .attr('transform', 'translate(' + treeSize / 3 + ',' + treeSize / 3 + ')scale(0.2,0.2)');

      layoutRoot.transition()
          .duration(transitionDuration)
          .attr('transform', function(d)  { return 'translate(' + svgSize * 0.05 + ',' + svgSize * 0.05 + ')scale(1,1)'; });

      function zoomed() {
        layoutRoot.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
      }

      // Links between nodes
      var link = d3.svg.diagonal()
         .projection(function(d) { return [d.y, d.x]; });

      var linkGroup = layoutRoot.selectAll('path.link')
         .data(links)
         .enter()
         .append('path')
         .attr('class', 'link')
         .attr('d', link);

      // Nodes
      var nodeGroup = layoutRoot.selectAll('g.node')
        .data(nodes)
        .enter()
         .append('g')
         .attr('class', 'node')
         .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
         .on('click', click);

      nodeGroup.append('text')
          .text(function(d) {
            if (d.hasOwnProperty('hash')) {
              return d.hash; 
            }
            else  {
              return d.prev_out.hash;
            }
          })
          .attr('dx', 10)
          .attr('dy', 2)
          .style('opacity', 0.0);

      nodeGroup.append('circle')
         .attr('class', 'node-dot')
         .attr('r', 2);

      // The first node is this block. We label it as such
      var firstNode = layoutRoot.select('g.node');
        firstNode.append('text')
              .text(function(d) {
                return d.hash; 
              } )
              .attr('dy', -5)
              .attr('dx', -10);

      function refreshTree() {
        // Select all the nodes in the tree, apart from the root node
        var filteredNodeGroup = nodeGroup.filter(function(d) { return d != treeData; } );

        filteredNodeGroup.select('circle.node-dot')
          .transition()
            .duration(transitionDuration)
            .attr('r', function(d)  {
              if (d.highlight)  {
                return 6.0;
              }
              else  {
                return 2.0;
              }
            });

        filteredNodeGroup.selectAll('text')
            // Fade our text in or out
            .transition()
              .duration(transitionDuration)
              .style('opacity', function(d) {
                if (d.highlight) {
                  return 1.0;
                }
                else  {
                  return 0.0;
                }
            });

        linkGroup.transition()
          .duration(transitionDuration)
          .style('stroke', function(d) {
          if (d.target.highlight === true && d.source.highlight === true) {
            return 'rgb(255,128,0)';
          }
          else  {
            return '#ddd';
          }
        })
      }

      function highlightNodeAndChildren(d, shouldHighlight)  {
        d.highlight = shouldHighlight;
        if (typeof(d.children) != 'undefined')  {
          d.children.forEach(function(child) {
            highlightNodeAndChildren(child, shouldHighlight);
          });
        }
      }

      function click(d) {
        // If we've clicked on the root node, ignore the click
        if (d === treeData)  {
          return;
        }

        var shouldHighlight = !d.highlight;
        highlightNodeAndChildren(d, shouldHighlight);
        refreshTree();
      }
    };
});