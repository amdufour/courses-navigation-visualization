// Handle nodes highlighting on hover and on click
function handleHighlight(node, nodes, state, isHighlighted) {
  // Get related key
  let column = '';
  nodeByKey.forEach((key, value) => {
    if (key.name === node.name) {
      const value1 = value.slice(value.indexOf('[') + 2);
      column = value1.slice(0, value.indexOf(',') - 3);
    }
  });
  const position = keys.findIndex(key => key.id === column);

  // Highlight related nodes
  d3.selectAll('.node').classed('faded', isHighlighted);
  d3.selectAll('.node-label').classed('faded', isHighlighted);
  d3.select(`.node-${node.index}`).classed(state, isHighlighted).classed('faded', false);
  d3.select(`.node-label-${node.index}`).classed(state, isHighlighted).classed('faded', false);
  const relatedNodes = [];
  data.forEach(datum => {
    if (datum[column].includes(node.name)) {
      keys.forEach((key, i) => {
        // Get related nodes
        if (i !== position) {
          datum[key.id].forEach(item => {
            if (!relatedNodes.includes(item)) {
              const index = nodes.find(n => n.name === item).index;
              relatedNodes.push({ column: key.id, node_name: item, index: index });
              d3.select(`.node-${index}`).classed(state, isHighlighted).classed('faded', false);
              d3.select(`.node-label-${index}`).classed(state, isHighlighted).classed('faded', false);
            }
          });
        } else {
          relatedNodes.push({ column: key.id, node_name: node.name, index: nodes.find(n => n.name === node.name).index });
        }
      });
    }
  });

  // Get related links
  d3.selectAll('.link').classed('faded', isHighlighted);
  keys.forEach((key, i) => {
    if (i < (keys.length - 1)) {
      const leftNodes = relatedNodes.filter(node => node.column === key.id);
      const rightNodes = relatedNodes.filter(node => node.column === keys[i + 1].id);
      leftNodes.forEach(ln => {
        rightNodes.forEach(rn => {
          d3.select(`.link-${ln.index}-to-${rn.index}`).classed(state, isHighlighted).classed('faded', false);
        });
      });
    }
  });
}


// Unhighlight elements is user clicks somewhere else on the page
document.addEventListener('click', (e) => {
  const closestGroup = e.target.closest('g');
  if (isActiveElement && (closestGroup === null || !closestGroup.classList.contains('nodes-group') || (e.target.classList.contains('node') && !e.target.classList.contains('active-hold')))) {
    d3.selectAll('.node')
      .classed('active', false)
      .classed('active-hold', false)
      .classed('faded', false)
      .classed('faded-hold', false);

    d3.selectAll('.node-label')
      .classed('active', false)
      .classed('active-hold', false)
      .classed('faded', false)
      .classed('faded-hold', false);

    d3.selectAll('.link')
      .classed('active', false)
      .classed('active-hold', false)
      .classed('faded', false)
      .classed('faded-hold', false);

    isActiveElement = false;
  }
});


// Get nodes horizontal position
function getNodesHorizontalPosition(x0) {
  const nodeXPosition = x0 + nodesPadding / 2;
  if (!nodesXPositions.includes(nodeXPosition)) {
    nodesXPositions.push(nodeXPosition);
  }
}


// Wraps SVG text
// Adapted from http://bl.ocks.org/mbostock/7555321
function wrapText(text, width) {
  text.each(function() {
    var text = d3.select(this);
    var words = text.text().split(/\s+/).reverse();
    var word;
    var line = [];
    var lineNumber = 0;
    var lineHeight = 1.1; // in em
    var x = text.attr('x');
    var y = text.attr('y');
    var dy = parseFloat(text.attr('dy'));
    var tspan = text.text(null)
      .append('tspan')
      .attr('x', x)
      .attr('y', y)
      .attr('dy', dy + 'em');
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        tspan.attr('y', y - 5)
        line = [word];
        tspan = text.append('tspan')
          .attr('x', x)
          .attr('y', y - 5)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}
