/*! project-name v0.0.1 | (c) 2021 YOUR NAME | MIT License | http://link-to-your-git-repo.com */
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
  // Extract liveProjects from nodes and add id for easier retrieval
  const liveProjects = [];
  nodes.forEach(node => {
    nodeByKey.forEach((key, value) => {
      if (key.name === node.name) {
        const value1 = value.slice(value.indexOf('[') + 2);
        const value2 = value1.slice(0, value.indexOf(',') - 3);
        if (value2 === 'title') {
          const nodeInfo = node;
          nodeInfo.id = data.find(datum => datum.title[0] === node.name).id;
          liveProjects.push(nodeInfo);
        }
      }
    });
  });
  
  console.log('nodes', nodes);
  console.log('links', links);
  console.log('liveProjects', liveProjects);


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
  // If node is a course title, append course placeholder.
  // This placeholder will be overlapped by HTML elements to allow creating accordions.
  const nodesCoursesLink = nodeShapes
    .data(liveProjects)
    .join('g')
      .attr('class', d => `node node-title node-${data.find(datum => datum.title[0] === d.name).difficulty} node-${d.index}`)
    .append('circle')
      .attr('cx', d => {
        getNodesHorizontalPosition(d.x0);
        return d.x0;
      })
      .attr('cy', d => d.y0 + (d.y1 - d.y0)/2)
      .attr('r', coursesCircleRadius);

      
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


  // Append liveProjects details section
  // This section is appended in HTML to allow the accordion content to flow
  const liveProjectsContainer = d3.select('.live-projects')
    .selectAll('.live-project')
    .data(liveProjects)
    .join('div')
      .attr('class', d => `live-project live-project-${d.index}`)
      .style('width', `${svgPadding.right}px`)
      .style('max-width', `${svgPadding.right}px`)
      .style('transform', d => `translateY(${d.y1 + 11}px)`);
  // Append liveProject title and toggle
  const liveProjectsToggle = liveProjectsContainer
    .append('div')
      .attr('class', d => `live-project-toggle-wrapper live-project-toggle-wrapper-${d.index}`);
  liveProjectsToggle
    .append('h3')
      .attr('id', d => `live-project-title-${d.index}`)
      .text(d => d.name);
  liveProjectsToggle
    .append('div')
      .attr('class', 'toggle');

  // Append accordion content
  const liveProjectsContent = d3.select('.live-projects-content')
    .selectAll('.live-project-content')
    .data(liveProjects)
    .join('div')
      .attr('class', d => `live-project-content live-project-content-${d.index}`)
      .style('width', `${svgPadding.right}px`)
      .style('max-width', `${svgPadding.right}px`)
      .style('transform', d => `translateY(${d.y1 + 11}px)`);
  // Skills learned
  const skillsLearned = liveProjectsContent.append('div').attr('class', 'info-section skills-learned-wrapper');
  skillsLearned.append('div').attr('class', 'label').text('Skills learned');
  skillsLearned.append('ul').attr('class', 'skills-learned');
  // Prerequesites
  const prerequesites = liveProjectsContent.append('div').attr('class', 'info-section prerequesites-wrapper');
  prerequesites.append('div').attr('class', 'label').text('Prerequesites');
  prerequesites.append('ul').attr('class', 'prerequesites');
  // Level
  const level = liveProjectsContent.append('div').attr('class', 'info-section level-wrapper');
  level.append('div').attr('class', 'label').text('Level');
  // Populate accordion content
  data.forEach(datum => {
    const index = liveProjects.find(project => project.id === datum.id).index;
    const projectContent = d3.select(`.live-project-content-${index}`);
    datum.skills_learned.split(', ').forEach(sl => {
      projectContent.select('.skills-learned').append('li').text(sl);
    });
    datum.skills_needed.split(', ').forEach(sl => {
      projectContent.select('.prerequesites').append('li').text(sl);
    });
    projectContent.select('.level-wrapper').append('div').attr('class', 'level').text(datum.difficulty.toLowerCase());
  });
  // Read more link
  liveProjectsContent.append('a').attr('href', d => `${liveProjectsUri}${data.find(datum => datum.title[0] === d.name).slug}`).attr('class', 'read-more').text('Buy this liveProject');
  

  // Rollover effects
  function handleMouseOver(d) {
    let nodeClasses = d3.select(this).attr('class');
    if (nodeClasses.includes('faded')) nodeClasses = nodeClasses.replace(' faded', '');
    if (nodeClasses.includes('faded-hold')) nodeClasses = nodeClasses.replace(' faded-hold', '');
    if (nodeClasses.includes('active')) nodeClasses = nodeClasses.replace(' active', '');
    if (nodeClasses.includes('active-hold')) nodeClasses = nodeClasses.replace(' active-hold', '');
    if (nodeClasses.includes('-hold')) nodeClasses = nodeClasses.replace('-hold', '');
    const node = nodes.find(node => node.index === parseInt(nodeClasses.slice(nodeClasses.lastIndexOf('-') + 1), 10));
    if (node) {
      if (!isActiveElement) handleHighlight(node, nodes, 'active', true);
    }
  }

  function handleMouseOut(d) {
    let nodeClasses = d3.select(this).attr('class');
    if (nodeClasses.includes('faded')) nodeClasses = nodeClasses.replace(' faded', '');
    if (nodeClasses.includes('faded-hold')) nodeClasses = nodeClasses.replace(' faded-hold', '');
    if (nodeClasses.includes('active')) nodeClasses = nodeClasses.replace(' active', '');
    if (nodeClasses.includes('active-hold')) nodeClasses = nodeClasses.replace(' active-hold', '');
    if (nodeClasses.includes('-hold')) nodeClasses = nodeClasses.replace('-hold', '');
    const node = nodes.find(node => node.index === parseInt(nodeClasses.slice(nodeClasses.lastIndexOf('-') + 1), 10));
    if (node) {
      if (!isActiveElement) handleHighlight(node, nodes, 'active', false);
    }
  }

  function handleNodeClick(d) {
    isActiveElement = true;
    const nodeClasses = d3.select(this).attr('class');
    const node = nodes.find(node => node.index === parseInt(nodeClasses.slice(nodeClasses.lastIndexOf('-') + 1), 10));
    d3.selectAll('.node').classed('faded-hold', true);
    if (node) handleHighlight(node, nodes, 'active-hold', true);
  }

  // Handle nodes mouse events
  d3.selectAll('.node')
    .on('mouseenter', handleMouseOver)
    .on('mouseleave', handleMouseOut)
    .on('click', handleNodeClick);

  // Handle liveProjects mouse events
  d3.selectAll('.live-project-toggle-wrapper')
    .on('mouseenter', handleMouseOver)
    .on('mouseleave', handleMouseOut);
};
