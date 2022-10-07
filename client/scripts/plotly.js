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
    data = [
        {
            r: m_data[`${frequency}`].gain,
            theta: m_data[`${frequency}`].azimut,
            mode: 'lines',
            line: {color: 'darkviolet',
                   shape: 'spline',
                   smoothing: 1.3},
            type: 'scatterpolar',
            hovertemplate: 'Gain: %{r:.1f}<br>Azimut: %{theta}'
        }
    ]
    var layout = {
        title: 'Measurement data ' + `${frequency}` + 'MHz',
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

    Plotly.react('dataField', data, layout);
}
