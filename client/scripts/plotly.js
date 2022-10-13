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

    var layout = {
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

    Plotly.newPlot('dataField', data, layout);
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
    var prelayout = {
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

    Plotly.react('dataField', predata, prelayout);

    var data = built_data();
    var layout = built_layout();

    Plotly.react('dataField', data, layout);
}

function built_data() {
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

function built_layout() {
    var frequency = Object.keys(m_data)[liveDataStatus];
    var layout = {
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
