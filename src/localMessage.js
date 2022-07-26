export const message = {
  "tables": {
    "DEFAULT": [
      {
        "dimension": [
          1
        ],
        "breakdown": [
          'A'
        ],
        "metric": [
          1.5, 4.5, 3
        ],
        "breakdown_sort_order": [
          1
        ]
      },
      {
        "dimension": [
          2
        ],
        "breakdown": [
          'A'
        ],
        "metric": [
          1.7, 2.5, 3.4
        ],
        "breakdown_sort_order": [
          1
        ]
      },
      {
        "dimension": [
          3
        ],
        "breakdown": [
          'A'
        ],
        "metric": [
          1.5, 3, 3
        ],
        "metric_lower": [
          0.8, 2.9, 1.6
        ],
        "metric_upper": [
          2.5, 4.1, 5
        ],
        "breakdown_sort_order": [
          1
        ]
      },
      {
        "dimension": [
          4
        ],
        "breakdown": [
          'A'
        ],
        "metric": [
          1.6
        ],
        "breakdown_sort_order": [
          1
        ]
      },
      {
        "dimension": [
          5
        ],
        "breakdown": [
          'A'
        ],
        "metric": [
          1.4
        ],
        "breakdown_sort_order": [
          1
        ]
      },


      {
        "dimension": [
          1
        ],
        "breakdown": [
          'B'
        ],
        "metric": [
          4.5, 3
        ],
        "breakdown_sort_order": [
          2
        ]
      },
      {
        "dimension": [
          2
        ],
        "breakdown": [
          'B'
        ],
        "metric": [
          2.5, 3.4
        ],
        "breakdown_sort_order": [
          2
        ]
      },
      {
        "dimension": [
          3
        ],
        "breakdown": [
          'B'
        ],
        "metric": [
          3, 3
        ],
        "metric_lower": [
          0.8, 2.9, 1.6
        ],
        "metric_upper": [
          2.5, 4.1, 5
        ],
        "breakdown_sort_order": [
          2
        ]
      },
      {
        "dimension": [
          4
        ],
        "breakdown": [
          'B'
        ],
        "metric": [
          1.6
        ],
        "breakdown_sort_order": [
          2
        ]
      },
      {
        "dimension": [
          5
        ],
        "breakdown": [
          'B'
        ],
        "metric": [
          1.4
        ],
        "breakdown_sort_order": [
          2
        ]
      },
    ]
  },
  "fields": {
    "dimension": [
      {
        "id": "qt_a62c3nqogc",
        "name": "Index",
        "type": "NUMBER",
        "concept": "DIMENSION"
      }
    ],
    "breakdown": [
      {
        "id": "qt_a62c3nvvvvvc",
        "name": "Group By",
        "type": "TEXT",
        "concept": "DIMENSION"
      }
    ],
    "metric": [
      {
        "id": "qt_b5537nqogc",
        "name": "est",
        "type": "NUMBER",
        "concept": "METRIC"
      },
      {
        "id": "qt_zvecch1jgc",
        "name": "Metric 2",
        "type": "NUMBER",
        "concept": "METRIC"
      },
      {
        "id": "qt_z45cch1jgc",
        "name": "Metric 3",
        "type": "NUMBER",
        "concept": "METRIC"
      }
    ],
    "breakdown_sort_order": [
      {
        "id": "djlkjsjfjjf",
        "name": "Sort Order",
        "type": "NUMBER",
        "concept": "METRIC"
      }
    ]
  },
  "style": {
    "chartTitle": {
      "value": "This is the title<br>Try multiline",
      "defaultValue": ""
    },
    "bottomPadding": {
      "value": "100",
      "defaultValue": "50"
    },
    "xAxisDate": {
      "value": false,
      "defaultValue": false
    },
    "xLabel": {
      "value": "X axis",
      "defaultValue": null
    },
    "yMin": {
      "value": null,
      "defaultValue": null
    },
    "yMax": {
      "value": null,
      "defaultValue": null
    },
    "yLabel": {
      "value": "Test Label",
      "defaultValue": null
    },
    "cumulative": {
      "value": true,
      "defaultValue": true
    },
    "plotTotal": {
      "value": true,
      "defaultValue": false
    },
    "totalName": {
      "value": "Test Value",
      "defaultValue": "Total"
    },
    "sortAggFunc": {
      "value": "max",
      "defaultValue": "avg"
    },
    "sortAscend": {
      "value": "Ascending",
      "defaultValue": "Descending"
    },
    "metricFormatString": {
      "value": ".3%",
      "defaultValue": ",.0f"
    },
    "metricGroup1": {
      "value": "Group1",
      "defaultValue": "Group1"
    },
    "metricGroup2": {
      "value": "Group1",
      "defaultValue": "Group2"
    },
    "metricGroup3": {
      "value": "Group3",
      "defaultValue": "Group3"
    },
    "metricLineWeight1": {
      "value": 2,
      "defaultValue": 2
    },
    "metricColor1": {
      "value": {
        "color": null
      },
      "defaultValue": {
        "color": "#0072f0"
      }
    },
    "metricShowPoints1": {
      "value": true,
      "defaultValue": true
    },
    "metricLineWeight2": {
      "value": 2,
      "defaultValue": 2
    },
    "metricColor2": {
      "value": {
        "color": "#00b6cb"
      },
      "defaultValue": {
        "color": "#00b6cb"
      }
    },
    "metricShowPoints2": {
      "value": true,
      "defaultValue": true
    },
    "metricLineWeight3": {
      "value": 2,
      "defaultValue": 2
    },
    "metricColor3": {
      "value": {
        "color": null
      },
      "defaultValue": {
        "color": "#f10096"
      }
    },
    "metricShowPoints3": {
      "value": true,
      "defaultValue": true
    }
  },
  "theme": {
    "themeFillColor": {
      "color": "#ffffff",
      "themeRef": {
        "index": 0
      }
    },
    "themeFontColor": {
      "color": "#000000",
      "themeRef": {
        "index": 1
      }
    },
    "themeFontFamily": "Roboto",
    "themeAccentFillColor": {
      "color": "#e0e0e0",
      "themeRef": {
        "index": 2
      }
    },
    "themeAccentFontColor": {
      "color": "#000000",
      "themeRef": {
        "index": 3
      }
    },
    "themeAccentFontFamily": "Roboto",
    "themeSeriesColor": [
      {
        "color": "#0072f0",
        "seriesRef": {
          "index": 0
        },
        "themeRef": {
          "index": 4
        }
      },
      {
        "color": "#00b6cb",
        "seriesRef": {
          "index": 1
        },
        "themeRef": {
          "index": 5
        }
      },
      {
        "color": "#f10096",
        "seriesRef": {
          "index": 2
        },
        "themeRef": {
          "index": 6
        }
      },
      {
        "color": "#f66d00",
        "seriesRef": {
          "index": 3
        },
        "themeRef": {
          "index": 7
        }
      },
      {
        "color": "#ffa800",
        "seriesRef": {
          "index": 4
        },
        "themeRef": {
          "index": 8
        }
      },
      {
        "color": "#7cb342",
        "seriesRef": {
          "index": 5
        },
        "themeRef": {
          "index": 9
        }
      },
      {
        "color": "#5e35b1",
        "seriesRef": {
          "index": 6
        }
      },
      {
        "color": "#03a9f4",
        "seriesRef": {
          "index": 7
        }
      },
      {
        "color": "#ec407a",
        "seriesRef": {
          "index": 8
        }
      },
      {
        "color": "#ff7043",
        "seriesRef": {
          "index": 9
        }
      },
      {
        "color": "#737373",
        "seriesRef": {
          "index": 10
        }
      },
      {
        "color": "#f15a60",
        "seriesRef": {
          "index": 11
        }
      },
      {
        "color": "#7ac36a",
        "seriesRef": {
          "index": 12
        }
      },
      {
        "color": "#5a9bd4",
        "seriesRef": {
          "index": 13
        }
      },
      {
        "color": "#faa75a",
        "seriesRef": {
          "index": 14
        }
      },
      {
        "color": "#9e67ab",
        "seriesRef": {
          "index": 15
        }
      },
      {
        "color": "#ce7058",
        "seriesRef": {
          "index": 16
        }
      },
      {
        "color": "#d77fb3",
        "seriesRef": {
          "index": 17
        }
      },
      {
        "color": "#81d4fa",
        "seriesRef": {
          "index": 18
        }
      },
      {
        "color": "#f48fb1",
        "seriesRef": {
          "index": 19
        }
      }
    ],
    "themeIncreaseColor": {
      "color": "#388e3c"
    },
    "themeDecreaseColor": {
      "color": "#f44336"
    },
    "themeGridColor": {
      "color": "#d1d1d1"
    }
  },
  "interactions": {}
};