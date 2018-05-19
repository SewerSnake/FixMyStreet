var url = 'https://www.fixmystreet.com/open311/v2/requests.json?jurisdiction_id=fixmystreet.com&agency_responsible=2514&start_date=2018-04-01&end_date=2018-04-30'

var NAME = "service_name";

addEventListener('load', function() {
  getJSON();
});

function getJSON() {
  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(result) {
      var reports = result.requests[0].request;

      var reportsPerCategory = objectCreation(reports);

      createTable(reportsPerCategory);

      createStapleDiagram(reportsPerCategory);
    });
}

function objectCreation(reports) {
  var reportsPerCategory = {};

  for (var i = 0; i < reports.length; i++) {
    var report = reports[i];

    if (reportsPerCategory[report[NAME]] == undefined) {
      reportsPerCategory[report[NAME]] = 1;
    } else {
      var currentAmount = parseInt(reportsPerCategory[report[NAME]]);
      currentAmount = currentAmount + 1;
      reportsPerCategory[report[NAME]] = currentAmount;
    }
  }

  return Object.entries(reportsPerCategory);
}

function createTable(reportsPerCategory) {

  var table = document.createElement('table');

  var tr = document.createElement('tr');

  var th1 = document.createElement('th');
  th1.appendChild(document.createTextNode('Category'));

  var th2 = document.createElement('th');
  th2.appendChild(document.createTextNode('Amount'));

  tr.appendChild(th1);
  tr.appendChild(th2);

  table.appendChild(tr);

  var tr;
  var td1;
  var td2;
  var report;
  var text;

  for (var i = 0; i < reportsPerCategory.length; i++) {
    report = reportsPerCategory[i];

    tr = document.createElement('tr');
    changeRowColor(tr);

    td1 = document.createElement('td');
    text = report[0];
    td1.appendChild(document.createTextNode(text));

    td2 = document.createElement('td');
    text = report[1];
    td2.appendChild(document.createTextNode(text));

    tr.appendChild(td1);
    tr.appendChild(td2);
    table.appendChild(tr);
  }

  document.body.appendChild(table);
}

function changeRowColor(tr) {
  tr.addEventListener('mouseover', function(event) {
    event.target.parentElement.style.backgroundColor = 'green';
  });

  tr.addEventListener('mouseout', function(event) {
    event.target.parentElement.style.backgroundColor = 'white';
  });
}

function createStapleDiagram(reportsPerCategory) {
  var width = 600;
  var height = 200;

  var xScale = d3.scaleLinear();
  xScale.domain([0, reportsPerCategory.length]);
  xScale.range([30, width]);

  var mappedProblems = reportsPerCategory.map(function(value) {
    return value[0];
  });

  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(mappedProblems.length)
    .tickFormat(function(value, index) {
      return mappedProblems[index];
    });

  var mappedValues = reportsPerCategory.map(function(value) {
    return value[1];
  });

  var yScale = d3.scaleLinear();
  yScale.domain([0, d3.max(mappedValues)]);
  yScale.range([height - 40, 0]);

  var svg = d3.select('#table')
    .append('svg')
    .attr('height', height)
    .attr('width', width);

  svg.selectAll('g')
    .data(mappedValues)
    .enter()
    .append('g')
    .call(function(g) {
      g.append('rect')
        .attr('fill', 'red')
        .attr('width', width / mappedValues.length - 5)
        .attr('height', function(value, index) {
          return height - 20 - yScale(value);
        })
        .attr('x', function(value, index) {
          return xScale(index);
        })
        .attr('y', function(value, index) {
          return yScale(value) - 20;
        });
      .append('g')
        .attr('transform', 'translate(0, 385)')
        .call(xAxis)
        .selectAll('text')
        .attr("transform", "rotate(-45)")
        .attr('text-anchor', 'end');
      return g;
    });
  svg.selectAll('g')
    .data(mappedProblems)
    .enter()
    .append('g')
    .call(function(g) {
      g.append('text')
        .attr('x', function(value, index) {
          return xScale(index);
        })
        .attr('y', function(value, index) {
          return height - 10;
        })
        .attr('font-family', 'helvetica')
        .attr('font-size', '7')
        .text(function(value) {
          return value;
        })
        .attr('text-anchor', 'middle')
        .attr('transform', function(d) {
          return 'rotate(-90)';
        });
    });

  var yAxis = d3.axisLeft().scale(yScale);

  d3.select('svg').append('g').attr('transform', 'translate(25, 0)').call(yAxis);
}