var mouseDown;
document.body.addEventListener("mousedown", function(e) {
    mouseDown = true;
});
document.body.addEventListener("mouseup", function(e) {
    mouseDown = false;
});

function getSafeRanges(dangerous) {
    var a = dangerous.commonAncestorContainer;
    // Starts -- Work inward from the start, selecting the largest safe range
    var s = new Array(0), rs = new Array(0);
    if (dangerous.startContainer != a)
        for(var i = dangerous.startContainer; i != a; i = i.parentNode)
            s.push(i)
    ;
    if (0 < s.length) for(var i = 0; i < s.length; i++) {
        var xs = document.createRange();
        if (i) {
            xs.setStartAfter(s[i-1]);
            xs.setEndAfter(s[i].lastChild);
        }
        else {
            xs.setStart(s[i], dangerous.startOffset);
            xs.setEndAfter(
                (s[i].nodeType == Node.TEXT_NODE)
                ? s[i] : s[i].lastChild
            );
        }
        rs.push(xs);
    }

    // Ends -- basically the same code reversed
    var e = new Array(0), re = new Array(0);
    if (dangerous.endContainer != a)
        for(var i = dangerous.endContainer; i != a; i = i.parentNode)
            e.push(i)
    ;
    if (0 < e.length) for(var i = 0; i < e.length; i++) {
        var xe = document.createRange();
        if (i) {
            xe.setStartBefore(e[i].firstChild);
            xe.setEndBefore(e[i-1]);
        }
        else {
            xe.setStartBefore(
                (e[i].nodeType == Node.TEXT_NODE)
                ? e[i] : e[i].firstChild
            );
            xe.setEnd(e[i], dangerous.endOffset);
        }
        re.unshift(xe);
    }

    // Middle -- the uncaptured middle
    if ((0 < s.length) && (0 < e.length)) {
        var xm = document.createRange();
        xm.setStartAfter(s[s.length - 1]);
        xm.setEndBefore(e[e.length - 1]);
    }
    else {
        return [dangerous];
    }

    // Concat
    rs.push(xm);
    response = rs.concat(re);    

    // Send to Console
    return response;
}

function highlightRange(range) {
    var newNode = document.createElement("div");
    newNode.setAttribute(
       "style",
       "background-color: rgb(255, 191, 211); display: inline;"
    );
    range.surroundContents(newNode);
}

function highlightSelection() {
    var userSelection = window.getSelection()
    if (window.getSelection && !mouseDown) 
    {
        if (userSelection.rangeCount > 0) 
        {
            var userSelection = window.getSelection().getRangeAt(0);
            var safeRanges = getSafeRanges(userSelection);
            for (var i = 0; i < safeRanges.length; i++) {
                highlightRange(safeRanges[i]);
            }

            var text = window.getSelection().toString();
            if (text.length != 0)
            {
                var newContext = document.createElement("div");
                newContext.setAttribute(
                    "style",
                    "background-color: rgb(255, 191, 211); padding: 10px;"
                );
                var newContextText = document.createTextNode(text);
                newContext.appendChild(newContextText);

                var spacing = document.createElement("div");
                spacing.setAttribute(
                    "style",
                    "height: 10px;"
                );

                var contextContainer = document.getElementById("output");
                contextContainer.appendChild(spacing);
                contextContainer.appendChild(newContext);
                contextContainer.appendChild(spacing);

                if (window.getSelection().empty) 
                {  // Chrome
                    window.getSelection().empty();
                }
                else if (window.getSelection().removeAllRanges) 
                {  // Firefox
                    window.getSelection().removeAllRanges();
                }
            }
        }
    }
} 


interval = setInterval(highlightSelection, 1000.0/60.0);