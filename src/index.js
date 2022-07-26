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

const drawViz = message => {

  // set margins + canvas size
  const margin = { top: 10, bottom: 50, right: 10, left: 10 };
  const height = dscc.getHeight() - margin.top - margin.bottom;
  const width = dscc.getWidth() - margin.left - margin.right;

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

  // Gather data for x-axis
  // -------------------------
  const xData = xAxisDate && isDate(toDate(message.tables.DEFAULT[0].dimension[0]))
    ? message.tables.DEFAULT.map(d => toDate(d.dimension[0])) 
    : message.tables.DEFAULT.map(d => d.dimension[0]);

  // Loop through metric groups to get normalization constant for each metric group
  let j;
  var metricGroupNormalizationValues = {};
  for (j=0; j<message.tables.DEFAULT[0].metric.length; j++){
    const m =  styleVal(message, 'metricGroup'+(j+1));
    const value = message.tables.DEFAULT.map(d => Number(d.metric[j])).reduce((partialSum, a) => partialSum + nullToZero(a), 0);

    // console.log("j: "+'metricGroup'+(j+1)+'; '+value)
    metricGroupNormalizationValues[m] = metricGroupNormalizationValues.hasOwnProperty(m)
      ? Math.max(metricGroupNormalizationValues[m], value)
      : value;
  }

  // console.log("j: "+JSON.stringify(metricGroupNormalizationValues, null, '  '));

  // loop through metrics and add traces
  // -------------------------
  let data = []
  let i;
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
      y: cumulativeNormalizeGroup(message.tables.DEFAULT.map(d => Number(d.metric[i])),
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
    height: height+60,
    showlegend: true,
    yaxis: yAxisLayout,
    xaxis: xAxisLayout,
    title: chartTitleLayout,
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