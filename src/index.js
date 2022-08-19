const d3 = require('d3');
const plotly = require('plotly.js-dist');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

const isNull = (x) => {
  return !(x===0) && (x == null || x == "null" || x == "");
}

const isNumeric = (x) => {
  return !isNull(x) && !isNaN(x);
}

// parse the style value
const styleVal = (message, styleId) => {
  if (!!message.style[styleId].defaultValue && typeof message.style[styleId].defaultValue === "object") {
    return message.style[styleId].value.color !== undefined
      ? message.style[styleId].value.color
      : message.style[styleId].defaultValue.color;
  }
  return message.style[styleId].value !== undefined
    ? message.style[styleId].value
    : message.style[styleId].defaultValue;
};

// parse a style color -- defaulting to the theme color if applicable
const themeColor = (message, styleId, themeId='themeSeriesColor', idx=null) => {
  // if a user specifed value is present, keep that
  if (message.style[styleId].value.color !== undefined && !isNull(message.style[styleId].value.color)) {
    return message.style[styleId].value.color;
  }
  // otherwise use the theme color
  return isNumeric(idx)
    ? message.theme[themeId][idx].color
    : message.theme[themeId].color;
};

// parse a style value -- defaulting to the theme value if applicable
const themeValue = (message, styleId, themeId='themeFontFamily') => {
  return message.style[styleId].value !== undefined
    ? message.style[styleId].value
    : message.theme[themeId];
};

const hex_to_rgba_str = (hex_color, opacity) => {
  var hex_strip = hex_color.replace(new RegExp("^#"),"");
  hex_strip = (hex_strip.length==3)? hex_strip+hex_strip : hex_strip;
  var rgba = 'rgba(' 
    + parseInt(hex_strip.substring(0,2), 16) + ',' 
    + parseInt(hex_strip.substring(2,4), 16) + ',' 
    + parseInt(hex_strip.substring(4,6), 16) + ','
    + opacity + ')';
  return rgba
}

const isDate = (d) => {return d instanceof Date && isFinite(d)}

const toDate = (dateString) => {
  let year = dateString.substring(0,4)
  let month = dateString.substring(4,6)-1
  let day = dateString.substring(6,8)
  let hour = dateString.substring(8,10)
  let min = dateString.substring(10,12)
  let sec = dateString.substring(12,14)

  return new Date(year, month, day, hour, min, sec)
}

Date.prototype.addDays = function(days) {
    return new Date(this.valueOf()+(24*60*60*days))
}

const nullToZero = (x) => {
  return isNumeric(x)
    ? x
    : 0;
}

const cumulativeNormalize = (x) => {
  var cumulativeX = x.map((sum => value => sum += nullToZero(value))(0));
  var totalX = Math.max.apply(Math, cumulativeX);

  let i;
  for (i=0; i<x.length; i++) {
    cumulativeX[i] /= totalX;
  }
  return cumulativeX
}

const cumulativeNormalizeGroup = (x,y) => {
  var cumulativeX = x.map((sum => value => sum += nullToZero(value))(0));

  let i;
  for (i=0; i<x.length; i++) {
    cumulativeX[i] /= y;
  }
  return cumulativeX
}

const normalizeGroup = (x,y) => {
  var cumulativeX = x.map(value => nullToZero(value));

  let i;
  for (i=0; i<x.length; i++) {
    cumulativeX[i] /= y;
  }
  return cumulativeX
}

// Function that allows you to group array `xs`` by `key`, and returns the result of the 
// reducing function `red` which uses default value []
const groupBy = function(xs, key, red = (acc, curr) => ([...acc, curr]), init = []) {
  return xs.reduce(function(rv, curr) {
    let acc = rv[curr[key]] || init;
    return { ...rv, [curr[key]]: red(acc, curr)};
  }, {});
};

const getAggSortOrder = (aggFunc, sortAscend, message, groupName, sortName) => {

  // calculate aggregate metrics by group
  const reduceFun = (red, x) => {
    return {
      "count": red.count+1, 
      "sum": red.sum + x[sortName][0], 
      "avg": (red.sum + x[sortName][0]) / (red.count + 1),
      "min": Math.min(red.min, x[sortName][0]),
      "max": Math.max(red.max, x[sortName][0])
    }
  };
  const init = {'count': 0, 'sum': 0, 'min': null, 'max': null};
  const groupMetrics = groupBy(message.tables.DEFAULT, groupName, reduceFun, init);

  // sort list of groups by the specified metric:
  const sortedGroups = Object.entries(groupMetrics)
    .sort(
      sortAscend 
      ? ([,a],[,b]) => (a[aggFunc] - b[aggFunc])
      : ([,a],[,b]) => (b[aggFunc] - a[aggFunc])
    )
    .reduce((red, [k, v]) => {red.push(k); return red}, []);

  return sortedGroups
};

// const getTotalGroupYData = (data) =>{
//   const out = data.reduce((a, e) => 
//     // iterate each object entry as [key, value] and use "a" as accumulator
//     Object.entries(e).reduce((a, t) => {
//         // create an empty array on "a" for each key (if it does not exist yet)
//         // then push current value to it
//         a[t[0]] = (a[t[0]] || 0) + t[1];
//         return a;
//     }, a), {});
//   return out;
// }

const drawViz = message => {

  // set margins + canvas size
  const margin = { t: 60, b: styleVal(message, 'bottomPadding'), right: 10, left: 10 };
  const height = dscc.getHeight(); // - margin.top - margin.bottom;
  const width = dscc.getWidth(); // - margin.left - margin.right;

  // remove the div if it already exists
  if (document.querySelector("div")) {
    let oldDiv = document.querySelector("div");
    oldDiv.remove();
  }

  // create div for plotly plot
  const myDiv = document.createElement('div');
  myDiv.setAttribute("height", `${dscc.getHeight()}px`);
  myDiv.setAttribute("width", `${dscc.getWidth()}px`);

  document.body.appendChild(myDiv);

  // write your visualization code here
  // console.log("I'm the callback and I was passed this data: " + JSON.stringify(message.style, null, '  '));
  // console.log("Theme data: " + JSON.stringify(message.theme, null, '  '));

  //gather plot-level style parameters
  // -------------------------
  const chartTitle = styleVal(message, 'chartTitle');
  const xAxisDate = styleVal(message, 'xAxisDate');
  const xLabel = styleVal(message, 'xLabel');
  const yAxisMin = styleVal(message, 'yMin');
  const yAxisMax = styleVal(message, 'yMax');
  const yLabel = styleVal(message, 'yLabel');
  const metricFmt = styleVal(message, 'metricFormatString');

  // Check if cumulative distribution should be plotted:
  const showCumulative = styleVal(message, 'cumulative');

  // Check if breakdown dimension is present
  // -------------------------
  const hasBreakdown = message.tables.DEFAULT[0].breakdown.length > 0;
  const plotTotal = styleVal(message, 'plotTotal');
  const totalName = styleVal(message, 'totalName');
  const totalGroup = '___TOTAL___';

  // console.log('hasBreakdown: '+hasBreakdown)

  // Get sorted list of breakdown labels
  if (hasBreakdown){
    var sortAggFunc = styleVal(message, "sortAggFunc");
    var sortAscend = styleVal(message, "sortAscend") == 'Ascending';
    var breakdown_values = message.tables.DEFAULT[0].breakdown_sort_order.length > 0
      ? getAggSortOrder(sortAggFunc, sortAscend, message, "breakdown", "breakdown_sort_order")
      : getAggSortOrder('count', sortAscend, message, "breakdown", "breakdown");
    // const breakdown_values = [...new Set(message.tables.DEFAULT.map(d => d.breakdown[0]))];
    console.log('Sorted groups: ' + breakdown_values)
    var n_groups = breakdown_values.length
    if (n_groups > 10){
      console.log(`More than 10 breakdown categories provided (n=${n_groups}). Truncating to first 10.`)
      n_groups = 10
    }

    // if the user selected the option to also plot the total distribution,
    // append as the last group
    if (plotTotal){
      breakdown_values.push(totalGroup);
      n_groups = n_groups + 1;
    }
  }

  // Gather data for x-axis
  // -------------------------
  var xData = xAxisDate && isDate(toDate(message.tables.DEFAULT[0].dimension[0]))
    ? message.tables.DEFAULT.map(d => toDate(d.dimension[0])) 
    : message.tables.DEFAULT.map(d => d.dimension[0]);

  // Loop through metric groups to get normalization constant for each metric group
  // Only applies if there is no breakdown dimension; 
  // otherwise each breakdown category is normalized individually
  // -------------------------
  let j;
  var metricGroupNormalizationValues = {};
  if (hasBreakdown){
    for (j=0; j<n_groups; j++){
      const m = breakdown_values[j]
      const value = message.tables.DEFAULT.filter(d => d.breakdown[0]===m).map(d => Number(d.metric[0])).reduce((partialSum, a) => partialSum + nullToZero(a), 0);

      // console.log("j: "+'metricGroup'+(j+1)+'; '+value)
      metricGroupNormalizationValues[m] = value;
    }
    if (plotTotal){
       const value = Object.values(metricGroupNormalizationValues).reduce(function(sum, current) {return sum + current;}, 0);
       metricGroupNormalizationValues[totalGroup] = value
       // console.log("j: "+'totalGroup; '+value);
    }
  }
  else{
    for (j=0; j<message.tables.DEFAULT[0].metric.length; j++){
      const m = styleVal(message, 'metricGroup'+(j+1));
      const value = message.tables.DEFAULT.map(d => Number(d.metric[j])).reduce((partialSum, a) => partialSum + nullToZero(a), 0);

      // console.log("j: "+'metricGroup'+(j+1)+'; '+value)
      metricGroupNormalizationValues[m] = metricGroupNormalizationValues.hasOwnProperty(m)
        ? Math.max(metricGroupNormalizationValues[m], value)
        : value;
    }
  }

  // console.log("j: "+JSON.stringify(metricGroupNormalizationValues, null, '  '));

  // loop through metrics and add traces
  // -------------------------
  let data = []
  let i;
  let yData;
  let totalData;
  let name;
  if (hasBreakdown){
    for (i=0; i<n_groups; i++){
      // console.log('i: '+i)
      // console.log("xData: " + JSON.stringify(message.tables.DEFAULT.filter(d => d.breakdown[0]===breakdown_values[i]).map(d => d.dimension[0]), null, '  '));
      // console.log("Input: " + JSON.stringify(message.tables.DEFAULT.filter(d => d.breakdown[0]===breakdown_values[i]).map(d => d.metric[0]), null, '  '));
      // console.log("Trace: " + JSON.stringify(cumulativeNormalizeGroup(message.tables.DEFAULT.filter(d => d.breakdown[0]===breakdown_values[i]).map(d => Number(d.metric[0])),
      //                               metricGroupNormalizationValues[breakdown_values[i]]), null, '  '));
      // console.log("Trace2: " + JSON.stringify(normalizeGroup(message.tables.DEFAULT.filter(d => d.breakdown[0]===breakdown_values[i]).map(d => Number(d.metric[0])),
      //                               metricGroupNormalizationValues[breakdown_values[i]]), null, '  '));
      // console.log("ShowCumulative:" + showCumulative)

      // Gather all style parameters
      // series properties
      const metricLineWeight =  styleVal(message, 'metricLineWeight'+(i+1));
      const metricLineColor =  themeColor(message, 'metricColor'+(i+1), 'themeSeriesColor', i);
      const metricShowPoints =  styleVal(message, 'metricShowPoints'+(i+1));

      // Design hovertemplate
      let hovertemplate = `<b>%{y:${metricFmt}}</b>`;
      let customdata = message.tables.DEFAULT.map(d => [null, null])

      if (plotTotal & (i==n_groups-1)){
        totalData = groupBy(message.tables.DEFAULT, 'dimension', (red, x) => {return red + nullToZero(Number(x.metric[0]))}, 0);
        xData = Object.keys(totalData);
        yData = Object.values(totalData);
        name = totalName;
      }
      else{
        xData = xAxisDate && isDate(toDate(message.tables.DEFAULT[0].dimension[0]))
          ? message.tables.DEFAULT.filter(d => d.breakdown[0]===breakdown_values[i]).map(d => toDate(d.dimension[0])) 
          : message.tables.DEFAULT.filter(d => d.breakdown[0]===breakdown_values[i]).map(d => d.dimension[0]);

        yData = message.tables.DEFAULT.filter(d => d.breakdown[0]===breakdown_values[i]).map(d => Number(d.metric[0]));
        name = breakdown_values[i];
      }

      // trace for metric trend line
      const trace_metric = {
        x: xData,
        y: showCumulative
          ? cumulativeNormalizeGroup(yData, metricGroupNormalizationValues[breakdown_values[i]])
          : normalizeGroup(yData, metricGroupNormalizationValues[breakdown_values[i]]),
        customdata:customdata,
        line: {
          color: metricLineColor,
          width: metricLineWeight
        }, 
        mode: (metricShowPoints)? 'lines+markers' : 'lines', 
        name: name, 
        type: "lines",
        legendgroup: 'metric'+i, 
        hovertemplate
      };

      data.push(trace_metric);

    }

  }
  else{
    for (i=0; i<message.tables.DEFAULT[0].metric.length; i++){
      // console.log('i: '+i)
      // console.log("Input: " + JSON.stringify(message.tables.DEFAULT.map(d => d.metric[i]), null, '  '));
      // console.log("Trace: " + JSON.stringify(cumulativeNormalizeGroup(message.tables.DEFAULT.map(d => Number(d.metric[i])),
                                    // metricGroupNormalizationValues[styleVal(message, 'metricGroup'+(i+1))]), null, '  '));

      // Gather all style parameters
      // series properties
      const metricLineWeight =  styleVal(message, 'metricLineWeight'+(i+1));
      const metricLineColor =  themeColor(message, 'metricColor'+(i+1), 'themeSeriesColor', i);
      const metricShowPoints =  styleVal(message, 'metricShowPoints'+(i+1));

      // Design hovertemplate
      let hovertemplate = `<b>%{y:${metricFmt}}</b>`;
      let customdata = message.tables.DEFAULT.map(d => [null, null])

      // trace for metric trend line
      const trace_metric = {
        x: xData,
        y: showCumulative
              ? cumulativeNormalizeGroup(
                    message.tables.DEFAULT.map(d => Number(d.metric[i])),
                    metricGroupNormalizationValues[styleVal(message, 'metricGroup'+(i+1))])
              : normalizeGroup(
                    message.tables.DEFAULT.map(d => Number(d.metric[i])),
                    metricGroupNormalizationValues[styleVal(message, 'metricGroup'+(i+1))]),
        customdata:customdata,
        line: {
          color: metricLineColor,
          width: metricLineWeight
        }, 
        mode: (metricShowPoints)? 'lines+markers' : 'lines', 
        name: message.fields.metric[i].name, 
        type: "lines",
        legendgroup: 'metric'+i, 
        hovertemplate
      };

      data.push(trace_metric);

    }
  }

  // Chart Titles
  // -------------------------
  const chartTitleLayout = isNull(chartTitle) ? {} : {text: chartTitle};
  const xAxisLayout = isNull(xLabel) ? {} : {title: {text: xLabel}};
  const yAxisLayout = isNull(yLabel) ? {tickformat: metricFmt} : {tickformat: metricFmt, title: {text: yLabel}};

  // format y-axis range
  // -------------------------
  if (!isNumeric(yAxisMin) && !isNumeric(yAxisMax)){
    yAxisLayout.range = 'auto'
  }
  else if (!isNumeric(yAxisMin)){
    const minValue = Math.min.apply(Math, message.tables.DEFAULT.map(function(d) {return Math.min(...d.metric)}));
    yAxisLayout.range = [0.9*minValue, yAxisMax];
  }
  else if (!isNumeric(yAxisMax)){
    const maxValue = Math.max.apply(Math, message.tables.DEFAULT.map(function(d) {return Math.max(...d.metric)}));
    yAxisLayout.range = [yAxisMin, 1.1*maxValue];
  }
  else{
    yAxisLayout.range = [yAxisMin, yAxisMax];
  }

  const layout = {
    height: height*0.98,
    showlegend: true,
    yaxis: yAxisLayout,
    xaxis: xAxisLayout,
    title: chartTitleLayout,
    margin: margin,
    hovermode: 'x'
  };

  plotly.newPlot(myDiv, data, layout);
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}