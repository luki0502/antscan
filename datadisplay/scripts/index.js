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
var keys, elStart, azStart, elRes, azRes;

function parseFile() {
    csv_data = {};
    m_data = {};
    r_data = {};
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
    elStart = parseFloat(keys[0]);
    var elStop = parseFloat(keys[keys.length - 1]);
    elRes = Math.abs(parseFloat(keys[0]) - parseFloat(keys[1]));

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
    azStart = parseFloat(pan[0]);
    var azStop = parseFloat(pan[pan.length - 2]);
    azRes = Math.abs(parseFloat(pan[0]) - parseFloat(pan[1]));

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

    document.getElementById("button_data").classList.remove("disabled");
    if(document.getElementById('elevationDropdown').childElementCount > 1) {
        document.getElementById('button_data3d').classList.remove('disabled');
    } else {
        document.getElementById('button_data3d').classList.add('disabled');
    }
}

function draw_plot() {
    document.getElementById('dataField').innerHTML = "";
    document.getElementById('dataField2').innerHTML = "";
    document.getElementById('button_azimut').classList.add('disabled');
    var data1 = built_data1();
    var layout1 = built_layout1();
    Plotly.newPlot('dataField', data1, layout1);

    if(document.getElementById('elevationDropdown').childElementCount > 1) {
        document.getElementById('button_azimut').classList.remove('disabled');
        var data2 = built_data2();
        var layout2 = built_layout2();
        Plotly.newPlot('dataField2', data2, layout2);
    }
}

function draw_plot3d() {
    var data3d = built_data3d();
    var layout3d = {title: `${frequency}MHz`};

    Plotly.react('dataField3', {data: data3d, layout: layout3d});
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

function deg2rad(degree) {
    var rad = degree * (Math.PI / 180);
    return rad;
}

function built_data3d() {
    r_data = {
        x: [],
        y: [],
        z: []
    };
    var radius = 30;
    var az = azStart; 
    var el = elStart;
    var counter = 0;
    var gain2;

    for(i = 0; i < keys.length; i++) {
        az = azStart;
        for(j = 0; j < pan.length - 1; j ++) {
            gain2 = radius + parseFloat(m_data.gain[counter]);

            var xn = gain2 * Math.cos(deg2rad(el - 2 * elStart));
            var yn = 0;
            var zn = gain2 * Math.sin(deg2rad(el - 2 * elStart));
        
            var x = xn;
            var y = Math.cos(deg2rad(az)) * yn - Math.sin(deg2rad(az)) * zn;
            var z = Math.sin(deg2rad(az)) * yn + Math.cos(deg2rad(az)) * zn;
        
            r_data.x.push(x);
            r_data.y.push(y);
            r_data.z.push(z);
        
            az += azRes;
            counter += 1;
        }
        el += elRes;
    }

    var data = [
        {
            alphahull: 1.7,
            opacity: 1,
            type: 'mesh3d',
            x: r_data.x,
            y: r_data.y,
            z: r_data.z,
            intensity: m_data.gain,
            colorscale: 'Portland',
            hovertemplate: "Gain: %{intensity:.1f}<extra></extra>",
        }
    ];

    return data;
}

function displayData(results){
    var data = results.data;
    pan = [];
    azimut = [];
    elevation = [];
    gain = [];
    dataStatusEl = 0;
    dataStatusAz = 0;
    design = 'lines';
    frequency = 0;
    keys = [];

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
        for(m = 0; m < pan.length - 1; m++) {
            gain.push(csv_data[`${keys[i]}`][m + 1]);
        }
    }

    m_data["gain"] = gain;
    m_data["azimut"] = azimut;
    m_data["elevation"] = elevation;

    frequency = data[0][2];

    init_dropdown(keys);
    draw_plot();
    if(document.getElementById('elevationDropdown').childElementCount > 1) {
        draw_plot3d();
    }

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