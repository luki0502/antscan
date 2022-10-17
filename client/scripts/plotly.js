let m_data = {};

function init_plot(testFrequency, len){
    m_data = {};
    for(let i = 0; i < len; i++) {
        m_data[`${testFrequency[i]}`] = {
            azimut: [],
            elevation: [],
            gain: []
        }
    }
    var data = [
        {
            r: [],
            theta: [],
            mode: 'lines',
            line: {color: 'darkviolet'},
            type: 'scatterpolar'
        }
    ]

    var layout1 = {
        autosize: false,
        width: 500,
        height: 500,
        title: 'Measurement',
        font: {
        family: 'Arial, sans-serif;',
        size: 12,
        color: '#000'
        },
        showlegend: false,
        polar: {
            angularaxis: {
                direction : "clockwise",
                dtick: 30
            }
        }
    };

    var layout2 = {
        autosize: false,
        width: 500,
        height: 500,
        title: 'Measurement',
        font: {
        family: 'Arial, sans-serif;',
        size: 12,
        color: '#000'
        },
        showlegend: false,
        polar: {
            sector: [0,180],
            angularaxis: {
                direction : "clockwise",
                dtick: 30
            }
        }
    };

    Plotly.newPlot('dataField', data, layout1);
    Plotly.newPlot('dataField2', data, layout2);
}

function append(azimut, elevation, frequency, gain) {
    m_data[`${frequency}`].azimut.push(azimut);
    m_data[`${frequency}`].elevation.push(elevation);
    m_data[`${frequency}`].gain.push(gain);
    
    draw_plot();
}

function draw_plot() {
    var frequency = Object.keys(m_data)[liveDataStatus];
    var predata = [
        {
            r: [],
            theta: [],
            mode: 'lines',
            line: {color: 'darkviolet',
                   shape: 'spline',
                   smoothing: 1.3},
            type: 'scatterpolar',
            hovertemplate: 'Gain: %{r:.1f}<br>Azimut: %{theta}'
        }
    ]
    var prelayout1 = {
        autosize: false,
        width: 500,
        height: 500,
        title: `Measurement data ${frequency}MHz`,
        font: {
          family: 'Arial, sans-serif;',
          size: 12,
          color: '#000'
        },
        showlegend: false,
        polar: {
            angularaxis: {
                direction : "clockwise",
                dtick: 30
            }
        }
    };

    var prelayout2 = {
        autosize: false,
        width: 500,
        height: 500,
        title: `Measurement data ${frequency}MHz`,
        font: {
          family: 'Arial, sans-serif;',
          size: 12,
          color: '#000'
        },
        showlegend: false,
        polar: {
            sector: [0,180],
            angularaxis: {
                direction : "clockwise",
                dtick: 30
            }
        }
    };

    Plotly.react('dataField', predata, prelayout1);
    Plotly.react('dataField2', predata, prelayout2);

    var data1 = built_data1();
    var layout1 = built_layout1();
    var data2 = built_data2();
    var layout2 = built_layout2();

    Plotly.react('dataField', data1, layout1);
    Plotly.react('dataField2', data2, layout2);
}

function built_data1() {
    var frequency = Object.keys(m_data)[liveDataStatus];
    var radius = [];
    var theta2 = [];

    for(let i = 0; i < m_data[frequency].gain.length; i++) {
        if(m_data[frequency].elevation[i] == liveDataStatusEl) {
            radius.push(m_data[frequency].gain[i]);
            theta2.push(m_data[frequency].azimut[i]);
        }
    }

    var data = [
        {
            r: radius,
            theta: theta2,
            mode: 'lines',
            line: {color: 'darkviolet',
                   shape: 'spline',
                   smoothing: 1.3},
            type: 'scatterpolar',
            hovertemplate: 'Gain: %{r:.1f}<br>Azimut: %{theta}'
        }
    ]

    return data;
}

function built_data2() {
    var frequency = Object.keys(m_data)[liveDataStatus];
    var radius = [];
    var theta2 = [];

    for(let i = 0; i < m_data[frequency].gain.length; i++) {
        if(m_data[frequency].azimut[i] == liveDataStatusAz) {
            radius.push(m_data[frequency].gain[i]);
            theta2.push(m_data[frequency].elevation[i]);
        }
    }

    var data = [
        {
            r: radius,
            theta: theta2,
            mode: 'lines',
            line: {color: 'darkviolet',
                   shape: 'spline',
                   smoothing: 1.3},
            type: 'scatterpolar',
            hovertemplate: 'Gain: %{r:.1f}<br>Elevation: %{theta}'
        }
    ]

    return data;
}

function built_layout1() {
    var frequency = Object.keys(m_data)[liveDataStatus];
    var layout = {
        autosize: false,
        width: 500,
        height: 500,
        title: `Measurement data ${frequency}MHz, ${liveDataStatusEl}° elevation`,
        font: {
          family: 'Arial, sans-serif;',
          size: 12,
          color: '#000'
        },
        showlegend: false,
        polar: {
            angularaxis: {
                direction : "clockwise",
                dtick: 30
            }
        }
    };

    return layout;
}

function built_layout2() {
    var frequency = Object.keys(m_data)[liveDataStatus];
    var layout = {
        autosize: false,
        width: 500,
        height: 500,
        title: `Measurement data ${frequency}MHz, ${liveDataStatusAz}° azimut`,
        font: {
          family: 'Arial, sans-serif;',
          size: 12,
          color: '#000'
        },
        showlegend: false,
        polar: {
            sector: [0,180],
            angularaxis: {
                direction : "clockwise",
                dtick: 30
            }
        }
    };

    return layout;
}
