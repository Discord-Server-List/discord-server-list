

fetch('http://localhost:5000/json/acknowledgements.json')
.then(function(res) {
    return res.json();
})
.then(function(data) {
    appendData(data)
})
.catch((err) => {
    console.log(err);
})

function appendData(data) {
    var mainContainer = document.getElementById("acknowledgements")
    for (var i = 0; i < data.length; i++) {
        var div = document.createElement("div");
        div.innerHTML = 'Package: ' + ' ' + data[i].package_name;
        mainContainer.appendChild(div);
    }
}