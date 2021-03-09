// Load original data
d3.csv('../data/data.csv').then(d => {
  data = d;
  prepData();
});

// Format data
function prepData() {
  let index = -1;
  const nodes = [];
  const links = [];

  // Format arrays of concepts, topics and libraries
  data.forEach(project => {
    project.topics = project.topics.split(', ');
    project.concepts = project.concepts.split(', ');
    project.skills = project.skills.split(', ');
    project.languages_and_libraries = project.languages_and_libraries.split(', ');
    project.title = [project.title]; // Structuring the titles as an array will simplify the creation og the links
    project.value = 1;
  });
  console.log(data);

  // Create nodes array
  let key;
  const updateNodes = (item) => {
    const node = {name: item};
    nodes.push(node);
    nodeByKey.set(key, node);
    indexByKey.set(key, ++index);
  };

  for (const k of keys) {
    for (const d of data) {
      let item = '';
      if (typeof d[k.id] === 'object') {
        for (const i of d[k.id]) {
          item = i;
          key = JSON.stringify([k.id, item]);
          if (nodeByKey.has(key)) continue;
          updateNodes(item);
        }
      } else {
        item = d[k.id];
        key = JSON.stringify([k.id, item]);
        if (nodeByKey.has(key)) continue;
        updateNodes(item);
      }
    }
  }

  // Create links array
  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1].id;
    const b = keys[i].id;
    const prefix = [];
    keys.slice(0, i + 1).forEach(p => {
      prefix.push(p.id);
    });
    const linkByKey = new Map();
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      let numOfLinks = d[a].length * d[b].length;
      for (const nameA of names[i - 1]) {
        for (const nameB of names[i]) {
          const linkedNodes = [nameA, nameB];
          const key = JSON.stringify(linkedNodes);
          const value = d.value / numOfLinks;
          let link = linkByKey.get(key);
          if (link) { 
            link.value += value;  
            continue;
          }
          link = {
            source: indexByKey.get(JSON.stringify([a, nameA])),
            target: indexByKey.get(JSON.stringify([b, nameB])),
            names,
            value
          };
          links.push(link);
          linkByKey.set(key, link);
        }
      }
    }
  }
  
  graphData = {nodes, links};
  createSankey();
}