/*! project-name v0.0.1 | (c) 2021 YOUR NAME | MIT License | http://link-to-your-git-repo.com */
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
  // d3.selectAll('.node-label').classed('faded', isHighlighted);
  d3.select(`.node-${node.index}`).classed(state, isHighlighted).classed('faded', false);
  // d3.select(`.node-label-${node.index}`).classed(state, isHighlighted).classed('faded', false);
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
              // d3.select(`.node-label-${index}`).classed(state, isHighlighted).classed('faded', false);
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

  // Highlight related liveProjects
  d3.selectAll('.live-project-toggle-wrapper').classed('faded', d => {
    if (isHighlighted && d3.select(`.node-title.node-${d.index}`).classed('faded')) {
      return true;
    } else {
      return false;
    }
  });
}

// If user clicks somewhere else on the page
document.addEventListener('click', (e) => {
  // Unhighlight elements in sankey diagramme
  const closestGroup = e.target.closest('g');
  if (isActiveElement 
      && (closestGroup === null || !closestGroup.classList.contains('nodes-group') || (e.target.classList.contains('node') && !e.target.classList.contains('active-hold')))
      && !e.target.parentElement.classList.contains('live-project-toggle-wrapper')) {
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

    d3.selectAll('.live-project-toggle-wrapper').classed('faded', false);
  }

  // Close any open course accordion
  if (!e.target.parentElement.classList.contains('live-project-toggle-wrapper')) {
    d3.selectAll('.live-project-toggle-wrapper.open').classed('open', false);
    d3.selectAll('.live-project-content.open').classed('open', false);
  } else {
    // Close any other open accordion
    const className = e.target.parentElement.classList[1];
    const index = className.slice(className.lastIndexOf('-') + 1);
    d3.selectAll('.live-project-toggle-wrapper.open').classed('open', d => d.index.toString() === index ? true : false);
    d3.selectAll('.live-project-content.open').classed('open', d => d.index.toString() === index ? true : false);

    const projectInfo = d3.select(`.live-project-toggle-wrapper-${index}`);
    const projectToggle = d3.select(`.live-project-content-${index}`);
    if (!e.target.parentElement.classList.contains('faded')) {
      projectInfo.classed('open', !projectInfo.classed('open'));
      projectToggle.classed('open', !projectToggle.classed('open'));
    }
  }
});


// Get nodes horizontal position
function getNodesHorizontalPosition(x0) {
  const nodeXPosition = x0 + nodesPadding / 2;
  if (!nodesXPositions.includes(nodeXPosition)) {
    nodesXPositions.push(nodeXPosition);
  }
}
