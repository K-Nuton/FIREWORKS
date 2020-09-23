# FIREWORKS(Library)

A Pen created on CodePen.io. Original URL: [https://codepen.io/nuton0413/pen/bGpaoKo](https://codepen.io/nuton0413/pen/bGpaoKo).

This is a small library that displays a fireworks animation on the dom element you select.<br>
This library requires PixiJS.<br>

minify:  https://codepen.io/nuton0413/pen/ExKEZrj.js<br>
example: https://codepen.io/nuton0413/pen/QWNgzKO

// initialize<br>
const firewroks = new FIREWORKS({<br>
    full_screen(boolean), <br>
    target_node(dom element),<br>
    amount(number),<br>
});<br>

"full_screen":   Let canvas cover the entire window.<br>
If this option is enabled, the "target_node" will be ignored.<br>

"target_node":  A DOM element that displays fireworks.<br>
"amount":  Maximum number of fireworks to be displayed at the same time.<br>

// start animation<br>
fireworks.start_burst();

// Methods<br>
start_burst() -> Start the fireworks animation<br>
stop() -> Pause the fireworks animation<br>
restart() -> Resume the fireworks animation<br>

