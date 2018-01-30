var idleTimerLength = 60000; // idle timer: 60 seconds

/* ------------- basic analytics stuff -------------------- */
// set up standard Google analytics.js
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-xxxxxxxx-x', 'auto'); // replace with appropriate Google property ID

function trackEvent(cat, act, label) { // send custom events to GA
    ga('send', 'event', {
        eventCategory: cat,
        eventAction: act,
        eventLabel: label
    });
}

function startSession() {
    ga('send','pageview', {
        'sessionControl': 'start'
    });
}

function endSession() {
    ga('send','pageview', {
        'sessionControl': 'end'
    });
}

/* -------------- idle timer ------------------ */

var idleTimer; // timer for session end and screen reset

// store whether timer is running, whether app is currently idle
var idleTimerRunState = false,
    idle = true;

/*
interactions trigger hiding of any idle items and start of new session, if application is idle
*/
function hideIdleState(containerElem) {
    clearTimeout(idleTimer);

    idleTimerRunState = false;

    if (idle) {
        idle = false;
        startSession();
    }

    // remove class that shows idle content (e.g., interaction prompts or similar content to attract users)
    containerElem.classList.remove('idle-state');
}
/*
 wait delay idle time then reset zoom, idleTimerRunState, end analytics session
  */
function showIdleState(containerElem, resetFunction) {
    idleTimer = setTimeout(function(){
        containerElem.classList.add('idle-state'); // add class that shows idle content
        endSession();
        idleTimerRunState = false;
        idle = true;

        if (resetFunction) { // if passed a particular function name to reset view or other behaviors, call that function after timer
            resetFunction();
        }
    }, idleTimerLength);
}

window.onunload = endSession();

var containerElem = document.getElementById('container');

/*
Example interactions that trigger analytics events
For one of our particular digital intrepretive web applications, we used the
interactjs library (https://github.com/taye/interact.js) to help with multi-touch control.
These trigger functions are just provided as examples
 */

function dragMoveListener (event) {
    /*
    do whatever should be done when dragging something
     */

    hideIdleState(containerElem);
    // this function is triggered numerous times during drag,
    // so we don't transmit analytics events or reset timer for this: only on drag start or end
}

function tapListener (event) {
    /*
    do whatever should be done when tapping something
     */
    hideIdleState(containerElem);
    trackEvent(eventCategory, 'tap event', 'tap some particular thing'); // transmit a tap event to GA. particulars (e.g. tapped element ID) may be derived from event data
    showIdleState(containerElem); // call to start timer again after each tap to go into idle state
}

/* attach InteractJS handlers */
interact('#drag-item').draggable({
    onstart: function() {
        trackEvent(eventCategory, 'drag event', 'drag some particular thing');
    },

    onmove: dragMoveListener,

    onend: function (event) {
        showIdleState(containerElem); // start up idle timer each time drag event ends
    }
});

interact('#drag-container__inner')
    .on('tap',function(event){
        tapListener(event);
    });