let gain = [];
let angle = [];

function init_plot(){
    gain = [];
    angle = [];
    var data = [
        {
            r: gain,
            theta: angle,
            mode: 'lines',
            line: {color: 'darkviolet'},
            type: 'scatterpolar'
        }
    ]

    var layout = {
        title: 'Measurement data',
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

function append(gain_val, angle_val) {
    gain = gain.concat(gain_val);
    angle = angle.concat(angle_val);
    data = [
        {
            r: gain,
            theta: angle,
            mode: 'lines',
            line: {color: 'darkviolet'},
            type: 'scatterpolar'
        }
    ]
    var layout = {
        title: 'Measurement data',
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
