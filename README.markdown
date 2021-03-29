# FIREWORKS(Library)

A Pen created on CodePen.io. Original URL: [https://codepen.io/nuton0413/pen/bGpaoKo](https://codepen.io/nuton0413/pen/bGpaoKo).

<h4>This is a small library that displays a fireworks animation on the dom element you select.</h4>
<h5>This library requires PixiJS.</h5>

<p>github: https://github.com/K-Nuton/FIREWORKS</p>
<p>jsdelivr: https://cdn.jsdelivr.net/gh/K-Nuton/FIREWORKS@latest/dist/fireworks.min.js</p>
<p>example: https://codepen.io/nuton0413/pen/QWNgzKO</p>
<pre>
// initialize
const firewroks = new FIREWORKS({
    full_screen: boolean, 
    target_node: DOMElement,
    amount: number,
});

"full_screen":   Let canvas cover the entire window.
If this option is enabled, the "target_node" will be ignored.

"target_node":  A DOM element that displays fireworks.
"amount":  Maximum number of fireworks to be displayed at the same time.

// start animation
fireworks.start_burst();

// Methods
start_burst() -> Start the fireworks animation
stop() -> Pause the fireworks animation
restart() -> Resume the fireworks animation
</pre>


