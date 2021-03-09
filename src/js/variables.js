const liveProjectsUri = 'https://www-qa.manning.com/liveproject/';
const width = 1160;
const height = 700;
const svgPadding = { top: 35, right: 300, bottom: 0, left: 20};
const coursesCircleRadius = 10;
const nodesWidth = 20;
const nodesPadding = 20;

let nodesXPositions = [];
let isActiveElement = false;

let data = [];
let graphData;
const nodeByKey = new Map();
const indexByKey = new Map();
const keys = [
  { id: "topics", label: "Topics" },
  { id: "concepts", label: "Concepts" },
  // { id: "skills", label: "Skills" },
  { id: "languages_and_libraries", label: "Languages and Libraries" },
  { id: "title", label: "liveProjects" }
];

const blue = '#4788D9';
const bluePale = '#DAE8F7';
const beginner = '#70C1B3';
const intermediate = '#FFE066';
const advanced = '#F25F5C';
