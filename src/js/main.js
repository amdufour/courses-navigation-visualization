// Append SVG to page
const svg = d3.select('#sankey').append('svg')
  .attr('viewbox', [0, 0, width, height])
  .attr('width', width)
  .attr('height', height);


// Configuration of Sankey diagram
const sankey = d3.sankey()
  .nodeSort(null)
  .linkSort(null)
  .nodeWidth(nodesWidth)
  .nodePadding(nodesPadding)
  .extent([[0, 5], [width - svgPadding.left - svgPadding.right, height - svgPadding.top - svgPadding.bottom - 5]]);


const createSankey = () => {
  const {nodes, links} = sankey({
    nodes: graphData.nodes.map(d => Object.assign({}, d)),
    links: graphData.links.map(d => Object.assign({}, d))
  });
  console.log('nodes', nodes);
  console.log('links', links);


  // Append links
  svg.append('g')
      .attr('class', 'links-group')
      .attr('fill', 'none')
      .attr('width', width - svgPadding.left - svgPadding.right)
      .attr('height', height - svgPadding.top - svgPadding.bottom)
      .style('transform', `translate(${svgPadding.left}px, ${svgPadding.top}px)`)
    .selectAll('.link-group')
    .data(links)
    .join('g')
      .attr('class', d => {
        if (data.find(datum => datum.title[0] === d.target.name)) {
          return `link-group link-to-title link-to-title-${data.find(datum => datum.title[0] === d.target.name).difficulty}`;
        } else {
          return 'link-group';
        }
      })
    .append('path')
      .attr('class', d => `link link-${d.index} link-${d.source.index}-to-${d.target.index}`)
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke', bluePale)
      .attr('stroke-width', d => d.width)
    .append('title')
      .text(d => `${d.names.join(' → ')}\n${d.value.toLocaleString()}`);


  // Append nodes
  const nodeShapes = svg.append('g')
      .attr('class', 'nodes-group')
      .attr('width', width - svgPadding.left - svgPadding.right)
      .attr('height', height - svgPadding.top - svgPadding.bottom)
      .style('transform', `translate(${svgPadding.left}px, ${svgPadding.top}px)`)
    .selectAll('.node');
  // If node is not in a course title, append rectangle
  nodeShapes.data(nodes.filter(d => { 
      let column = '';
      nodeByKey.forEach((key, value) => {
        if (key.name === d.name) {
          const value1 = value.slice(value.indexOf('[') + 2);
          column = value1.slice(0, value.indexOf(',') - 3);
        }
      });
      return column !== 'title';
    }))
    .join('rect')
      .attr('class', d => `node node-${d.index}`)
      .attr('x', d => {
        getNodesHorizontalPosition(d.x0);
        return d.x0;
      })
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0);
  // If node is a course title, append link to course and circle
  const nodesCoursesLink = nodeShapes.data(nodes.filter(d => { 
      let column = '';
      nodeByKey.forEach((key, value) => {
        if (key.name === d.name) {
          const value1 = value.slice(value.indexOf('[') + 2);
          column = value1.slice(0, value.indexOf(',') - 3);
        }
      });
      return column === 'title';
    }))
    .join('a')
      .attr('class', d => `node node-title node-${data.find(datum => datum.title[0] === d.name).difficulty} node-${d.index}`)
      .attr('href', d => `${liveProjectsUri}${data.find(datum => datum.title[0] === d.name).slug}`)
  nodesCoursesLink.append('circle')
      .attr('cx', d => {
        getNodesHorizontalPosition(d.x0);
        return d.x0;
      })
      .attr('cy', d => d.y0 + (d.y1 - d.y0)/2)
      .attr('r', coursesCircleRadius);
  nodesCoursesLink.append('text')
    .attr('class', d => `node-label node-label-${d.index} node-label-${keys[nodesXPositions.indexOf(d.x0 + nodesPadding / 2)].id}`)
      .attr('x', d => {
        if (keys[nodesXPositions.indexOf(d.x0 + nodesPadding / 2)].id === 'title') {
          return d.x1 - 2;
        } else {
          return d.x1 + 6;
        }
      })
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => 'start')
      .text(d => d.name)
      .call(wrapText, 300);

      
  // Append nodes labels
  const nodeLabels = svg.append('g')
      .attr('class', 'nodes-titles-group')
      .attr('width', width - svgPadding.left - svgPadding.right)
      .attr('height', height - svgPadding.top - svgPadding.bottom)
      .style('transform', `translate(${svgPadding.left}px, ${svgPadding.top}px)`)
    .selectAll('.node-label');
  // If node is not a course title, append text only
  nodeLabels.data(nodes.filter(d => { 
      let column = '';
      nodeByKey.forEach((key, value) => {
        if (key.name === d.name) {
          const value1 = value.slice(value.indexOf('[') + 2);
          column = value1.slice(0, value.indexOf(',') - 3);
        }
      });
      return column !== 'title';
    }))
    .join('text')
     .attr('class', d => `node-label node-label-${d.index} node-label-${keys[nodesXPositions.indexOf(d.x0 + nodesPadding / 2)].id}`)
      .attr('x', d => {
        if (keys[nodesXPositions.indexOf(d.x0 + nodesPadding / 2)].id === 'title') {
          return d.x1 - 2;
        } else {
          return d.x1 + 6;
        }
      })
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => 'start')
      .text(d => d.name);


  // Append defs to links going to a title to create a color gradient
  const gradient = d3.selectAll('.link-to-title')
    .append('linearGradient')
      .attr('id', d => `def-${d.source.index}-to-${d.target.index}`)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', d => d.source.x1)
      .attr('x2', d => d.target.x0);
  gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', bluePale);
  d3.selectAll('.link-to-title-BEGINNER linearGradient')
    .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', beginner);
  d3.selectAll('.link-to-title-INTERMEDIATE linearGradient')
    .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', intermediate);
  d3.selectAll('.link-to-title-ADVANCED linearGradient')
    .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', advanced);
  d3.selectAll('.link-to-title path')
      .attr('stroke', d => `url(#def-${d.source.index}-to-${d.target.index})`);


  // Append columns labels
  svg.append('g')
      .attr('class', 'columns-labels')
    .selectAll('.column-label')
    .data(keys)
    .join('text')
      .attr('class', 'column-label')
      .attr('x', d => nodesXPositions[keys.indexOf(d)] + svgPadding.left)
      .attr('text-anchor', 'middle')
      .attr('y', 20)
      .text(d => d.label);
  

  // Rollover effects
  function handleMouseOver(d) {
    const nodeClasses = d3.select(this).attr('class');
    const node = nodes.find(node => node.index === parseInt(nodeClasses.slice(nodeClasses.lastIndexOf('-') + 1), 10));
    if (node) {
      if (!isActiveElement) handleHighlight(node, nodes, 'active', true);
      if (nodeClasses.includes('node-title')) showTooltip(d, node);
    }
  }

  function handleMouseOut(d) {
    const nodeClasses = d3.select(this).attr('class');
    const node = nodes.find(node => node.index === parseInt(nodeClasses.slice(nodeClasses.lastIndexOf('-') + 1), 10));
    if (node) {
      if (!isActiveElement) handleHighlight(node, nodes, 'active', false);
      if (nodeClasses.includes('node-title')) hideTooltip();
    }
  }

  function handleNodeClick(d) {
    isActiveElement = true;
    const nodeClasses = d3.select(this).attr('class');
    const node = nodes.find(node => node.index === parseInt(nodeClasses.slice(nodeClasses.lastIndexOf('-') + 1), 10));
    d3.selectAll('.node').classed('faded-hold', true);
    if (node) handleHighlight(node, nodes, 'active-hold', true);
  }

  function showTooltip(d, node) {
    // Populate tooltip with data
    const courseData = data.find(datum => datum.title[0] === node.name);
    d3.select('#sankey-tooltip h3').text(courseData.title[0]);
    const skillsLearnedList = d3.select('#sankey-tooltip .skills-learned');
    const prerequesitesList = d3.select('#sankey-tooltip .prerequesites');
    skillsLearnedList.selectAll('li').remove();
    prerequesitesList.selectAll('li').remove();
    courseData.skills_learned.split(', ').forEach(sl => {
      skillsLearnedList.append('li').text(sl);
    });
    courseData.skills_needed.split(', ').forEach(sn => {
      prerequesitesList.append('li').text(sn);
    });
    d3.select('#sankey-tooltip .level').text(courseData.difficulty.toLowerCase());

    // Make the tooltip appear at the right location
    const xpos = node.x0;
    const ypos = node.y1 + d3.select('#sankey-tooltip .tooltip-container').node().getBoundingClientRect().height + 50;

    d3.select('#sankey-tooltip')
      .style('transform', `translate(${xpos}px, ${ypos}px)`)
      .style('z-index', 100)
      .transition()
      .duration(0)
      .style('opacity', 1);
  }

  function hideTooltip() {
    d3.select('#sankey-tooltip')
      .style('transform', `translate(0px, 0px)`)
      .style('z-index', -1)
      .style('opacity', 0);
  }

  d3.selectAll('.node')
    .on('mouseenter', handleMouseOver)
    .on('mouseleave', handleMouseOut)
    .on('click', handleNodeClick);
};
