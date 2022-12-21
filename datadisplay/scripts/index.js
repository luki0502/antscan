var csv_data = {};
var m_data = {};
var r_data = {};
var pan = [];
var azimut = [];
var elevation = [];
var gain = [];
var dataStatusEl = 0;
var dataStatusAz = 0;
var design = 'lines';
var frequency = 0;
var keys;

function parseFile() {
    var file = document.querySelector('input').files[0];
    Papa.parse(file, {
        complete: function(csvdata) {
            console.log(csvdata);
            displayData(csvdata);
        }
    });
}

function init_dropdown(keys) {
    var completeList = document.getElementById("elevationDropdown");
    while(completeList.childElementCount != 0) {
        completeList.firstChild.remove();
    }
    var elStart = parseFloat(keys[0]);
    var elStop = parseFloat(keys[keys.length - 1]);
    var elRes = Math.abs(parseFloat(keys[0]) - parseFloat(keys[1]));

    for(let i = elStart; i <= elStop; i+=elRes) {
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.classList.add("dropdown-item");
        button.setAttribute("type", "button");
        button.setAttribute("value", `${i}`);
        button.setAttribute("id", `${i}el`);
        button.innerText = `${i}°`;
        li.appendChild(button);
        completeList.appendChild(li);
        document.getElementById(`${i}el`).addEventListener('click', () => {
            dataStatusEl = i;
            draw_plot();
        })
    }
    dataStatusEl = keys[0];

    completeList = document.getElementById("azimutDropdown");
    while(completeList.childElementCount != 0) {
        completeList.firstChild.remove();
    }
    var azStart = parseFloat(pan[0]);
    var azStop = parseFloat(pan[pan.length - 2]);
    var azRes = Math.abs(parseFloat(pan[0]) - parseFloat(pan[1]));

    for(let i = azStart; i <= azStop; i+=azRes) {
        var li = document.createElement("li");
        var button = document.createElement("button");
        button.classList.add("dropdown-item");
        button.setAttribute("type", "button");
        button.setAttribute("value", `${i}`);
        button.setAttribute("id", `${i}az`);
        button.innerText = `${i}°`;
        li.appendChild(button);
        completeList.appendChild(li);
        document.getElementById(`${i}az`).addEventListener('click', () => {
            dataStatusAz = i;
            draw_plot();
        })
    }
}

function draw_plot() {
    var data1 = built_data1();
    var layout1 = built_layout1();
    var data2 = built_data2();
    var layout2 = built_layout2();

    Plotly.newPlot('dataField', data1, layout1);
    Plotly.newPlot('dataField2', data2, layout2);
}

function built_data1() {
    var radius = [];
    var theta2 = [];

    for (i = 0; i < m_data.gain.length; i++) {
        if (m_data.elevation[i] == dataStatusEl) {
            radius.push(m_data.gain[i]);
            theta2.push(m_data.azimut[i]);
        }
    }

    var data = [
        {
            r: radius,
            theta: theta2,
            mode: design,
            line: {
                color: 'darkviolet',
                shape: 'spline',
                smoothing: 1.3
            },
            marker: {
                color: radius,
                colorscale: 'Portland',
                showscale: true,
                colorbar: {
                    title: "Gain"
                }
            },
            type: 'scatterpolar',
            hovertemplate: 'Gain: %{r:.1f}<br>Azimut: %{theta}<extra></extra>'
        }
    ]

    return data;
}

function built_data2() {
    var radius = [];
    var theta2 = [];

    for (let i = 0; i < m_data.gain.length; i++) {
        if (m_data.azimut[i] == dataStatusAz) {
            radius.push(m_data.gain[i]);
            theta2.push(m_data.elevation[i]);
        }
    }

    var data = [
        {
            r: radius,
            theta: theta2,
            mode: design,
            line: {
                color: 'darkviolet',
                shape: 'spline',
                smoothing: 1.3
            },
            marker: {
                color: radius,
                colorscale: 'Portland',
                showscale: true,
                colorbar: {
                    title: "Gain"
                }
            },
            type: 'scatterpolar',
            hovertemplate: 'Gain: %{r:.1f}<br>Elevation: %{theta}<extra></extra>'
        }
    ]

    return data;
}

function built_layout1() {
    var layout = {
        autosize: false,
        width: 500,
        height: 500,
        title: `${frequency}MHz, ${dataStatusEl}° elevation`,
        font: {
            family: 'Arial, sans-serif;',
            size: 12,
            color: '#000'
        },
        showlegend: false,
        polar: {
            angularaxis: {
                direction: "clockwise",
                dtick: 30
            }
        }
    };

    return layout;
}

function built_layout2() {
    var layout = {
        autosize: false,
        width: 500,
        height: 500,
        title: `${frequency}MHz, ${dataStatusAz}° azimut`,
        font: {
            family: 'Arial, sans-serif;',
            size: 12,
            color: '#000'
        },
        showlegend: false,
        polar: {
            sector: [0, 180],
            angularaxis: {
                direction: "clockwise",
                dtick: 30
            }
        }
    };

    return layout;
}

function displayData(results){
    var data = results.data;

    document.getElementById("button_data").classList.remove("disabled");
    document.getElementById("button_data3d").classList.remove("disabled");
    document.getElementById("information").innerText = "Calculating ...";

    for(i = 2; i < data.length - 1; i++) {
        csv_data[`${data[i][0]}`] = data[i];
    }
    
    for(i = 1; i < data[1].length; i++) {
        pan.push(data[1][i]);
    }

    keys = Object.keys(csv_data);
    keys.sort(function(a, b){return a - b});

    for(i = 0; i < keys.length; i++) { //Number of elevation angle
        for(j = 1; j < csv_data[`${keys[i]}`].length; j++) { //Number of azimut angle
            for(k = 0; k < pan.length - 1; k++) { //Walk through array of azimut angle
                azimut.push(pan[k]);
            }
        }
        for(l = 0; l < pan.length - 1; l++) { //Walk through array of azimut angle to get the same length for azimut and elevation array
                elevation.push(parseFloat(keys[i]));
        } 
        for(m = 0; m < pan.length - 1; m++){
            gain.push(csv_data[`${keys[i]}`][m + 1]);
        }
    }

    m_data["gain"] = gain;
    m_data["azimut"] = azimut;
    m_data["elevation"] = elevation;

    frequency = data[0][2];

    init_dropdown(keys);
    draw_plot();

    document.getElementById("information").innerText = "Done!";
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('button_line').addEventListener('click', () => {
        design = "lines";
        draw_plot();
      });
      document.getElementById('button_marker').addEventListener('click', () => {
        design = "markers";
        draw_plot();
      });
});