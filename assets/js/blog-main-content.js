var item = document.getElementById("item-container");
var itemStyle = item.style;

document.addEventListener('mousemove', function(event) {
    window.requestAnimationFrame(() => {
        itemStyle.top = `${ event.clientY - item.offsetHeight/2 }px`
        circleStyle.left = `${ event.clientX - item.offsetWidth/2 }px`;
    })
})