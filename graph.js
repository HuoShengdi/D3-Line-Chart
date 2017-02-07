
function loadFile(path, callback){
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = ()=>{
    if(xhr.readyState == 4 && xhr.status == 200){
      callback(xhr.responseText);
    }
  }
  xhr.open('GET', path);
  xhr.send();
}

function parseData(text){
  const data = d3.csvParseRows(text, (d, i)=>{
    const row = {};
    d.forEach((val, idx)=>{
      if (idx === 0){
        row[x] = Number(d[0])
      }else{
        let id = "y" + idx.toString();
        row[id] = +d[idx];
      }
    })
    return row;
  })

  return data;
}

window.loadFile = loadFile;
window.parseData = parseData;


const margin = {top: 10, right: 10, bottom: 100, left: 40},
  margin2 = {top: 430, right: 10, bottom: 20, left: 40},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  height2 = 500 - margin2.top - margin2.bottom;

const svg = d3.select(".graph").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

const focus = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const context = svg.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

const x = d3.scaleLinear().range([0, width]),
      x2 = d3.scaleLinear().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      y2 = d3.scaleLinear().range([height2, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);


const xAxis = d3.axisBottom(x)
  .ticks(20, "s")
const xAxis2 = d3.axisBottom(x2)
  .ticks(20, "s")

const yAxis = d3.axisLeft(y)
  .ticks(10, "s")


function initGraph(data){

  const columns = Object.keys(data).filter((key)=>{return key != "x"}).map((id)=>{
    return {
      id: id,
      values: data.map(function(d) {
      return {x: d.x, y: +d[id]};
    })
    }
  });

  const x0 = d3.extent(data, (d)=>{return d.x});
  const y0 = [d3.min(columns, function(c) { return d3.min(c.values, function(v) { return v.y*1.1; }); }),
              d3.max(columns, function(c) { return d3.max(c.values, function(v) { return v.y*1.1; }); }) ]

  x.domain(x0);
  y.domain(y0);
  x2.domain(x.domain());
  y2.domain(y.domain());
  z.domain(columns.map((c)=>{return c.id}));

  const brush = d3.brushX(x2)
      .on("brush", brushed);

  const line = d3.line()
    .defined(function(d) { return !isNaN(d.y); })
    .x((d)=>{ return x(d.x);})
    .y((d)=>{ return y(d.y);});

  const line2 = d3.line()
    .defined(function(d) { return !isNaN(d.y); })
    .x((d)=>{ return x2(d.x);})
    .y((d)=>{ return y2(d.y);});

  const focusLineGroups = focus.selectAll("g")
      .data(columns)
    .enter().append("g");

  const focusLines = focusLineGroups.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) {return z(d.id);});


  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  const contextLineGroups = context.selectAll("g")
      .data(columns)
    .enter().append("g");

  const contextLines = contextLineGroups.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line2(d.values); })
      .style("stroke", function(d) {return z(d.id);});

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);


  function brushed() {
    const s = d3.event.selection;
    if (!s) {
      x.domain(x2.domain());
    }else {
      x.domain(s.map(x2.invert, x2));
    }

    focus.select(".x.axis").call(xAxis);
    focus.select(".y.axis").call(yAxis);
    focus.selectAll("path.line")
      .attr("d", function(d) { return line(d.values); });

  }

}

// loadFile('/data/freq_domain.txt', (text)=>{initGraph(parseData(text))});

  // function zoomed() {
  //   container.attr("transform", d3.event.transform);
  //
  //   gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  //   gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
  //
  //   container.selectAll('.curve').attr("d", function(d) {return line(d.values)})
  // }
