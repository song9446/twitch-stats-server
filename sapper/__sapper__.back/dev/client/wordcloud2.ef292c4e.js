/*!
 * wordcloud2.js
 * http://timdream.org/wordcloud2.js/
 *
 * Copyright 2011 - 2019 Tim Guan-tin Chien and contributors.
 * Released under the MIT license
 */

// setImmediate
if (!window.setImmediate) {
  window.setImmediate = (function setupSetImmediate() {
    return window.msSetImmediate ||
    window.webkitSetImmediate ||
    window.mozSetImmediate ||
    window.oSetImmediate ||
    (function setupSetZeroTimeout() {
      if (!window.postMessage || !window.addEventListener) {
        return null;
      }

      var callbacks = [undefined];
      var message = 'zero-timeout-message';

      // Like setTimeout, but only takes a function argument.  There's
      // no time argument (always zero) and no arguments (you have to
      // use a closure).
      var setZeroTimeout = function setZeroTimeout(callback) {
        var id = callbacks.length;
        callbacks.push(callback);
        window.postMessage(message + id.toString(36), '*');

        return id;
      };

      window.addEventListener('message', function setZeroTimeoutMessage(evt) {
        // Skipping checking event source, retarded IE confused this window
        // object with another in the presence of iframe
        if (typeof evt.data !== 'string' ||
            evt.data.substr(0, message.length) !== message/* ||
            evt.source !== window */) {
          return;
        }

        evt.stopImmediatePropagation();

        var id = parseInt(evt.data.substr(message.length), 36);
        if (!callbacks[id]) {
          return;
        }

        callbacks[id]();
        callbacks[id] = undefined;
      }, true);

      /* specify clearImmediate() here since we need the scope */
      window.clearImmediate = function clearZeroTimeout(id) {
        if (!callbacks[id]) {
          return;
        }

        callbacks[id] = undefined;
      };

      return setZeroTimeout;
    })() ||
    // fallback
    function setImmediateFallback(fn) {
      window.setTimeout(fn, 0);
    };
  })();
}

if (!window.clearImmediate) {
  window.clearImmediate = (function setupClearImmediate() {
    return window.msClearImmediate ||
    window.webkitClearImmediate ||
    window.mozClearImmediate ||
    window.oClearImmediate ||
    // "clearZeroTimeout" is implement on the previous block ||
    // fallback
    function clearImmediateFallback(timer) {
      window.clearTimeout(timer);
    };
  })();
}


  // Check if WordCloud can run on this browser
  var isSupported = (function isSupported() {
    var canvas = document.createElement('canvas');
    if (!canvas || !canvas.getContext) {
      return false;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
      return false;
    }
    if (!ctx.getImageData) {
      return false;
    }
    if (!ctx.fillText) {
      return false;
    }

    if (!Array.prototype.some) {
      return false;
    }
    if (!Array.prototype.push) {
      return false;
    }

    return true;
  }());

  // Find out if the browser impose minium font size by
  // drawing small texts on a canvas and measure it's width.
  var minFontSize = (function getMinFontSize() {
    if (!isSupported) {
      return;
    }

    var ctx = document.createElement('canvas').getContext('2d');

    // start from 20
    var size = 20;

    // two sizes to measure
    var hanWidth, mWidth;

    while (size) {
      ctx.font = size.toString(10) + 'px sans-serif';
      if ((ctx.measureText('\uFF37').width === hanWidth) &&
          (ctx.measureText('m').width) === mWidth) {
        return (size + 1);
      }

      hanWidth = ctx.measureText('\uFF37').width;
      mWidth = ctx.measureText('m').width;

      size--;
    }

    return 0;
  })();

  // Based on http://jsfromhell.com/array/shuffle
  var shuffleArray = function shuffleArray(arr) {
    for (var j, x, i = arr.length; i;
      j = Math.floor(Math.random() * i),
      x = arr[--i], arr[i] = arr[j],
      arr[j] = x) {}
    return arr;
  };

  var WordCloud = function WordCloud(elements, options) {
    if (!isSupported) {
      return;
    }

    if (!Array.isArray(elements)) {
      elements = [elements];
    }

    elements.forEach(function(el, i) {
      if (typeof el === 'string') {
        elements[i] = document.getElementById(el);
        if (!elements[i]) {
          throw 'The element id specified is not found.';
        }
      } else if (!el.tagName && !el.appendChild) {
        throw 'You must pass valid HTML elements, or ID of the element.';
      }
    });

    /* Default values to be overwritten by options object */
    var settings = {
      list: [],
      fontFamily: '"Trebuchet MS", "Heiti TC", "微軟正黑體", ' +
                  '"Arial Unicode MS", "Droid Fallback Sans", sans-serif',
      fontWeight: 'normal',
      color: 'random-dark',
      minSize: 0, // 0 to disable
      weightFactor: 1,
      clearCanvas: true,
      backgroundColor: '#fff',  // opaque white = rgba(255, 255, 255, 1)

      gridSize: 8,
      drawOutOfBound: false,
      shrinkToFit: false,
      origin: null,

      drawMask: false,
      maskColor: 'rgba(255,0,0,0.3)',
      maskGapWidth: 0.3,

      wait: 0,
      abortThreshold: 0, // disabled
      abort: function noop() {},

      minRotation: - Math.PI / 2,
      maxRotation: Math.PI / 2,
      rotationSteps: 0,

      shuffle: true,
      rotateRatio: 0.1,

      shape: 'circle',
      ellipticity: 0.65,

      classes: null,

      hover: null,
      click: null
    };

    if (options) {
      for (var key in options) {
        if (key in settings) {
          settings[key] = options[key];
        }
      }
    }

    /* Convert weightFactor into a function */
    if (typeof settings.weightFactor !== 'function') {
      var factor = settings.weightFactor;
      settings.weightFactor = function weightFactor(pt) {
        return pt * factor; //in px
      };
    }

    /* Convert shape into a function */
    if (typeof settings.shape !== 'function') {
      switch (settings.shape) {
        case 'circle':
        /* falls through */
        default:
          // 'circle' is the default and a shortcut in the code loop.
          settings.shape = 'circle';
          break;

        case 'cardioid':
          settings.shape = function shapeCardioid(theta) {
            return 1 - Math.sin(theta);
          };
          break;

        /*
        To work out an X-gon, one has to calculate "m",
        where 1/(cos(2*PI/X)+m*sin(2*PI/X)) = 1/(cos(0)+m*sin(0))
        http://www.wolframalpha.com/input/?i=1%2F%28cos%282*PI%2FX%29%2Bm*sin%28
        2*PI%2FX%29%29+%3D+1%2F%28cos%280%29%2Bm*sin%280%29%29
        Copy the solution into polar equation r = 1/(cos(t') + m*sin(t'))
        where t' equals to mod(t, 2PI/X);
        */

        case 'diamond':
          // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%28mod+
          // %28t%2C+PI%2F2%29%29%2Bsin%28mod+%28t%2C+PI%2F2%29%29%29%2C+t+%3D
          // +0+..+2*PI
          settings.shape = function shapeSquare(theta) {
            var thetaPrime = theta % (2 * Math.PI / 4);
            return 1 / (Math.cos(thetaPrime) + Math.sin(thetaPrime));
          };
          break;

        case 'square':
          // http://www.wolframalpha.com/input/?i=plot+r+%3D+min(1%2Fabs(cos(t
          // )),1%2Fabs(sin(t)))),+t+%3D+0+..+2*PI
          settings.shape = function shapeSquare(theta) {
            return Math.min(
              1 / Math.abs(Math.cos(theta)),
              1 / Math.abs(Math.sin(theta))
            );
          };
          break;

        case 'triangle-forward':
          // http://www.wolframalpha.com/input/?i=plot+r+%3D+1%2F%28cos%28mod+
          // %28t%2C+2*PI%2F3%29%29%2Bsqrt%283%29sin%28mod+%28t%2C+2*PI%2F3%29
          // %29%29%2C+t+%3D+0+..+2*PI
          settings.shape = function shapeTriangle(theta) {
            var thetaPrime = theta % (2 * Math.PI / 3);
            return 1 / (Math.cos(thetaPrime) +
                        Math.sqrt(3) * Math.sin(thetaPrime));
          };
          break;

        case 'triangle':
        case 'triangle-upright':
          settings.shape = function shapeTriangle(theta) {
            var thetaPrime = (theta + Math.PI * 3 / 2) % (2 * Math.PI / 3);
            return 1 / (Math.cos(thetaPrime) +
                        Math.sqrt(3) * Math.sin(thetaPrime));
          };
          break;

        case 'pentagon':
          settings.shape = function shapePentagon(theta) {
            var thetaPrime = (theta + 0.955) % (2 * Math.PI / 5);
            return 1 / (Math.cos(thetaPrime) +
                        0.726543 * Math.sin(thetaPrime));
          };
          break;

        case 'star':
          settings.shape = function shapeStar(theta) {
            var thetaPrime = (theta + 0.955) % (2 * Math.PI / 10);
            if ((theta + 0.955) % (2 * Math.PI / 5) - (2 * Math.PI / 10) >= 0) {
              return 1 / (Math.cos((2 * Math.PI / 10) - thetaPrime) +
                          3.07768 * Math.sin((2 * Math.PI / 10) - thetaPrime));
            } else {
              return 1 / (Math.cos(thetaPrime) +
                          3.07768 * Math.sin(thetaPrime));
            }
          };
          break;
      }
    }

    /* Make sure gridSize is a whole number and is not smaller than 4px */
    settings.gridSize = Math.max(Math.floor(settings.gridSize), 4);

    /* shorthand */
    var g = settings.gridSize;
    var maskRectWidth = g - settings.maskGapWidth;

    /* normalize rotation settings */
    var rotationRange = Math.abs(settings.maxRotation - settings.minRotation);
    var rotationSteps = Math.abs(Math.floor(settings.rotationSteps));
    var minRotation = Math.min(settings.maxRotation, settings.minRotation);

    /* information/object available to all functions, set when start() */
    var grid, // 2d array containing filling information
      ngx, ngy, // width and height of the grid
      center, // position of the center of the cloud
      maxRadius;

    /* timestamp for measuring each putWord() action */
    var escapeTime;

    /* function for getting the color of the text */
    var getTextColor;
    function random_hsl_color(min, max) {
      return 'hsl(' +
        (Math.random() * 360).toFixed() + ',' +
        (Math.random() * 30 + 70).toFixed() + '%,' +
        (Math.random() * (max - min) + min).toFixed() + '%)';
    }
    switch (settings.color) {
      case 'random-dark':
        getTextColor = function getRandomDarkColor() {
          return random_hsl_color(10, 50);
        };
        break;

      case 'random-light':
        getTextColor = function getRandomLightColor() {
          return random_hsl_color(50, 90);
        };
        break;

      default:
        if (typeof settings.color === 'function') {
          getTextColor = settings.color;
        }
        break;
    }

    /* function for getting the font-weight of the text */
    var getTextFontWeight;
    if (typeof settings.fontWeight === 'function') {
      getTextFontWeight = settings.fontWeight;
    }

    /* function for getting the classes of the text */
    var getTextClasses = null;
    if (typeof settings.classes === 'function') {
      getTextClasses = settings.classes;
    }

    /* Interactive */
    var interactive = false;
    var infoGrid = [];
    var hovered;

    var getInfoGridFromMouseTouchEvent =
    function getInfoGridFromMouseTouchEvent(evt) {
      var canvas = evt.currentTarget;
      var rect = canvas.getBoundingClientRect();
      var clientX;
      var clientY;
      /** Detect if touches are available */
      if (evt.touches) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
      } else {
        clientX = evt.clientX;
        clientY = evt.clientY;
      }
      var eventX = clientX - rect.left;
      var eventY = clientY - rect.top;

      var x = Math.floor(eventX * ((canvas.width / rect.width) || 1) / g);
      var y = Math.floor(eventY * ((canvas.height / rect.height) || 1) / g);

      return infoGrid[x][y];
    };

    var wordcloudhover = function wordcloudhover(evt) {
      var info = getInfoGridFromMouseTouchEvent(evt);

      if (hovered === info) {
        return;
      }

      hovered = info;
      if (!info) {
        settings.hover(undefined, undefined, evt);

        return;
      }

      settings.hover(info.item, info.dimension, evt);

    };

    var wordcloudclick = function wordcloudclick(evt) {
      var info = getInfoGridFromMouseTouchEvent(evt);
      if (!info) {
        return;
      }

      settings.click(info.item, info.dimension, evt);
      evt.preventDefault();
    };

    /* Get points on the grid for a given radius away from the center */
    var pointsAtRadius = [];
    var getPointsAtRadius = function getPointsAtRadius(radius) {
      if (pointsAtRadius[radius]) {
        return pointsAtRadius[radius];
      }

      // Look for these number of points on each radius
      var T = radius * 8;

      // Getting all the points at this radius
      var t = T;
      var points = [];

      if (radius === 0) {
        points.push([center[0], center[1], 0]);
      }

      while (t--) {
        // distort the radius to put the cloud in shape
        var rx = 1;
        if (settings.shape !== 'circle') {
          rx = settings.shape(t / T * 2 * Math.PI); // 0 to 1
        }

        // Push [x, y, t]; t is used solely for getTextColor()
        points.push([
          center[0] + radius * rx * Math.cos(-t / T * 2 * Math.PI),
          center[1] + radius * rx * Math.sin(-t / T * 2 * Math.PI) *
            settings.ellipticity,
          t / T * 2 * Math.PI]);
      }

      pointsAtRadius[radius] = points;
      return points;
    };

    /* Return true if we had spent too much time */
    var exceedTime = function exceedTime() {
      return ((settings.abortThreshold > 0) &&
        ((new Date()).getTime() - escapeTime > settings.abortThreshold));
    };

    /* Get the deg of rotation according to settings, and luck. */
    var getRotateDeg = function getRotateDeg() {
      if (settings.rotateRatio === 0) {
        return 0;
      }

      if (Math.random() > settings.rotateRatio) {
        return 0;
      }

      if (rotationRange === 0) {
        return minRotation;
      }

      if (rotationSteps > 0) {
        // Min rotation + zero or more steps * span of one step
        return minRotation +
          Math.floor(Math.random() * rotationSteps) *
          rotationRange / (rotationSteps - 1);
      }
      else {
        return minRotation + Math.random() * rotationRange;
      }
    };

    var getTextInfo = function getTextInfo(word, weight, rotateDeg) {
      var fontSize = settings.weightFactor(weight);
      if (fontSize <= settings.minSize) {
        return false;
      }

      // Scale factor here is to make sure fillText is not limited by
      // the minium font size set by browser.
      // It will always be 1 or 2n.
      var mu = 1;
      if (fontSize < minFontSize) {
        mu = (function calculateScaleFactor() {
          var mu = 2;
          while (mu * fontSize < minFontSize) {
            mu += 2;
          }
          return mu;
        })();
      }

      // Get fontWeight that will be used to set fctx.font
      var fontWeight;
      if (getTextFontWeight) {
        fontWeight = getTextFontWeight(word, weight, fontSize);
      } else {
        fontWeight = settings.fontWeight;
      }

      var fcanvas = document.createElement('canvas');
      var fctx = fcanvas.getContext('2d', { willReadFrequently: true });

      fctx.font = fontWeight + ' ' +
        (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;

      // Estimate the dimension of the text with measureText().
      var fw = fctx.measureText(word).width / mu;
      var fh = Math.max(fontSize * mu,
                        fctx.measureText('m').width,
                        fctx.measureText('\uFF37').width) / mu;

      // Create a boundary box that is larger than our estimates,
      // so text don't get cut of (it sill might)
      var boxWidth = fw + fh * 2;
      var boxHeight = fh * 3;
      var fgw = Math.ceil(boxWidth / g);
      var fgh = Math.ceil(boxHeight / g);
      boxWidth = fgw * g;
      boxHeight = fgh * g;

      // Calculate the proper offsets to make the text centered at
      // the preferred position.

      // This is simply half of the width.
      var fillTextOffsetX = - fw / 2;
      // Instead of moving the box to the exact middle of the preferred
      // position, for Y-offset we move 0.4 instead, so Latin alphabets look
      // vertical centered.
      var fillTextOffsetY = - fh * 0.4;

      // Calculate the actual dimension of the canvas, considering the rotation.
      var cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) +
                           boxHeight * Math.abs(Math.cos(rotateDeg))) / g);
      var cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) +
                           boxHeight * Math.abs(Math.sin(rotateDeg))) / g);
      var width = cgw * g;
      var height = cgh * g;

      fcanvas.setAttribute('width', width);
      fcanvas.setAttribute('height', height);

      // Scale the canvas with |mu|.
      fctx.scale(1 / mu, 1 / mu);
      fctx.translate(width * mu / 2, height * mu / 2);
      fctx.rotate(- rotateDeg);

      // Once the width/height is set, ctx info will be reset.
      // Set it again here.
      fctx.font = fontWeight + ' ' +
        (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;

      // Fill the text into the fcanvas.
      // XXX: We cannot because textBaseline = 'top' here because
      // Firefox and Chrome uses different default line-height for canvas.
      // Please read https://bugzil.la/737852#c6.
      // Here, we use textBaseline = 'middle' and draw the text at exactly
      // 0.5 * fontSize lower.
      fctx.fillStyle = '#000';
      fctx.textBaseline = 'middle';
      fctx.fillText(word, fillTextOffsetX * mu,
                    (fillTextOffsetY + fontSize * 0.5) * mu);

      // Get the pixels of the text
      var imageData = fctx.getImageData(0, 0, width, height).data;

      if (exceedTime()) {
        return false;
      }

      // Read the pixels and save the information to the occupied array
      var occupied = [];
      var gx = cgw, gy, x, y;
      var bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2];
      while (gx--) {
        gy = cgh;
        while (gy--) {
          y = g;
          singleGridLoop: {
            while (y--) {
              x = g;
              while (x--) {
                if (imageData[((gy * g + y) * width +
                               (gx * g + x)) * 4 + 3]) {
                  occupied.push([gx, gy]);

                  if (gx < bounds[3]) {
                    bounds[3] = gx;
                  }
                  if (gx > bounds[1]) {
                    bounds[1] = gx;
                  }
                  if (gy < bounds[0]) {
                    bounds[0] = gy;
                  }
                  if (gy > bounds[2]) {
                    bounds[2] = gy;
                  }
                  break singleGridLoop;
                }
              }
            }
          }
        }
      }

      // Return information needed to create the text on the real canvas
      return {
        mu: mu,
        occupied: occupied,
        bounds: bounds,
        gw: cgw,
        gh: cgh,
        fillTextOffsetX: fillTextOffsetX,
        fillTextOffsetY: fillTextOffsetY,
        fillTextWidth: fw,
        fillTextHeight: fh,
        fontSize: fontSize
      };
    };

    /* Determine if there is room available in the given dimension */
    var canFitText = function canFitText(gx, gy, gw, gh, occupied) {
      // Go through the occupied points,
      // return false if the space is not available.
      var i = occupied.length;
      while (i--) {
        var px = gx + occupied[i][0];
        var py = gy + occupied[i][1];

        if (px >= ngx || py >= ngy || px < 0 || py < 0) {
          if (!settings.drawOutOfBound) {
            return false;
          }
          continue;
        }

        if (!grid[px][py]) {
          return false;
        }
      }
      return true;
    };

    /* Actually draw the text on the grid */
    var drawText = function drawText(gx, gy, info, word, weight,
                                     distance, theta, rotateDeg, attributes) {

      var fontSize = info.fontSize;
      var color;
      if (getTextColor) {
        color = getTextColor(word, weight, fontSize, distance, theta);
      } else {
        color = settings.color;
      }

      // get fontWeight that will be used to set ctx.font and font style rule
      var fontWeight;
      if (getTextFontWeight) {
        fontWeight = getTextFontWeight(word, weight, fontSize);
      } else {
        fontWeight = settings.fontWeight;
      }

      var classes;
      if (getTextClasses) {
        classes = getTextClasses(word, weight, fontSize);
      } else {
        classes = settings.classes;
      }

      var dimension;
      var bounds = info.bounds;
      dimension = {
        x: (gx + bounds[3]) * g,
        y: (gy + bounds[0]) * g,
        w: (bounds[1] - bounds[3] + 1) * g,
        h: (bounds[2] - bounds[0] + 1) * g
      };

      elements.forEach(function(el) {
        if (el.getContext) {
          var ctx = el.getContext('2d');
          var mu = info.mu;

          // Save the current state before messing it
          ctx.save();
          ctx.scale(1 / mu, 1 / mu);

          ctx.font = fontWeight + ' ' +
                     (fontSize * mu).toString(10) + 'px ' + settings.fontFamily;
          ctx.fillStyle = color;

          // Translate the canvas position to the origin coordinate of where
          // the text should be put.
          ctx.translate((gx + info.gw / 2) * g * mu,
                        (gy + info.gh / 2) * g * mu);

          if (rotateDeg !== 0) {
            ctx.rotate(- rotateDeg);
          }

          // Finally, fill the text.

          // XXX: We cannot because textBaseline = 'top' here because
          // Firefox and Chrome uses different default line-height for canvas.
          // Please read https://bugzil.la/737852#c6.
          // Here, we use textBaseline = 'middle' and draw the text at exactly
          // 0.5 * fontSize lower.
          ctx.textBaseline = 'middle';
          ctx.fillText(word, info.fillTextOffsetX * mu,
                             (info.fillTextOffsetY + fontSize * 0.5) * mu);

          // The below box is always matches how <span>s are positioned
          /* ctx.strokeRect(info.fillTextOffsetX, info.fillTextOffsetY,
            info.fillTextWidth, info.fillTextHeight); */

          // Restore the state.
          ctx.restore();
        } else {
          // drawText on DIV element
          var span = document.createElement('span');
          var transformRule = '';
          transformRule = 'rotate(' + (- rotateDeg / Math.PI * 180) + 'deg) ';
          if (info.mu !== 1) {
            transformRule +=
              'translateX(-' + (info.fillTextWidth / 4) + 'px) ' +
              'scale(' + (1 / info.mu) + ')';
          }
          var styleRules = {
            'position': 'absolute',
            'display': 'block',
            'font': fontWeight + ' ' +
                    (fontSize * info.mu) + 'px ' + settings.fontFamily,
            'left': ((gx + info.gw / 2) * g + info.fillTextOffsetX) + 'px',
            'top': ((gy + info.gh / 2) * g + info.fillTextOffsetY) + 'px',
            'width': info.fillTextWidth + 'px',
            'height': info.fillTextHeight + 'px',
            'lineHeight': fontSize + 'px',
            'whiteSpace': 'nowrap',
            'transform': transformRule,
            'webkitTransform': transformRule,
            'msTransform': transformRule,
            'transformOrigin': '50% 40%',
            'webkitTransformOrigin': '50% 40%',
            'msTransformOrigin': '50% 40%'
          };
          if (color) {
            styleRules.color = color;
          }
          span.textContent = word;
          for (var cssProp in styleRules) {
            span.style[cssProp] = styleRules[cssProp];
          }
          if (attributes) {
            for (var attribute in attributes) {
              span.setAttribute(attribute, attributes[attribute]);
            }
          }
          if (classes) {
            span.className += classes;
          }
          el.appendChild(span);
        }
      });
    };

    /* Help function to updateGrid */
    var fillGridAt = function fillGridAt(x, y, drawMask, dimension, item) {
      if (x >= ngx || y >= ngy || x < 0 || y < 0) {
        return;
      }

      grid[x][y] = false;

      if (drawMask) {
        var ctx = elements[0].getContext('2d');
        ctx.fillRect(x * g, y * g, maskRectWidth, maskRectWidth);
      }

      if (interactive) {
        infoGrid[x][y] = { item: item, dimension: dimension };
      }
    };

    /* Update the filling information of the given space with occupied points.
       Draw the mask on the canvas if necessary. */
    var updateGrid = function updateGrid(gx, gy, gw, gh, info, item) {
      var occupied = info.occupied;
      var drawMask = settings.drawMask;
      var ctx;
      if (drawMask) {
        ctx = elements[0].getContext('2d');
        ctx.save();
        ctx.fillStyle = settings.maskColor;
      }

      var dimension;
      if (interactive) {
        var bounds = info.bounds;
        dimension = {
          x: (gx + bounds[3]) * g,
          y: (gy + bounds[0]) * g,
          w: (bounds[1] - bounds[3] + 1) * g,
          h: (bounds[2] - bounds[0] + 1) * g
        };
      }

      var i = occupied.length;
      while (i--) {
        var px = gx + occupied[i][0];
        var py = gy + occupied[i][1];

        if (px >= ngx || py >= ngy || px < 0 || py < 0) {
          continue;
        }

        fillGridAt(px, py, drawMask, dimension, item);
      }

      if (drawMask) {
        ctx.restore();
      }
    };

    /* putWord() processes each item on the list,
       calculate it's size and determine it's position, and actually
       put it on the canvas. */
    var putWord = function putWord(item) {
      var word, weight, attributes;
      if (Array.isArray(item)) {
        word = item[0];
        weight = item[1];
      } else {
        word = item.word;
        weight = item.weight;
        attributes = item.attributes;
      }
      var rotateDeg = getRotateDeg();

      // get info needed to put the text onto the canvas
      var info = getTextInfo(word, weight, rotateDeg);

      // not getting the info means we shouldn't be drawing this one.
      if (!info) {
        return false;
      }

      if (exceedTime()) {
        return false;
      }

      // If drawOutOfBound is set to false,
      // skip the loop if we have already know the bounding box of
      // word is larger than the canvas.
      if (!settings.drawOutOfBound) {
        var bounds = info.bounds;
        if ((bounds[1] - bounds[3] + 1) > ngx ||
          (bounds[2] - bounds[0] + 1) > ngy) {
          return false;
        }
      }

      // Determine the position to put the text by
      // start looking for the nearest points
      var r = maxRadius + 1;

      var tryToPutWordAtPoint = function(gxy) {
        var gx = Math.floor(gxy[0] - info.gw / 2);
        var gy = Math.floor(gxy[1] - info.gh / 2);
        var gw = info.gw;
        var gh = info.gh;

        // If we cannot fit the text at this position, return false
        // and go to the next position.
        if (!canFitText(gx, gy, gw, gh, info.occupied)) {
          return false;
        }

        // Actually put the text on the canvas
        drawText(gx, gy, info, word, weight,
                 (maxRadius - r), gxy[2], rotateDeg, attributes);

        // Mark the spaces on the grid as filled
        updateGrid(gx, gy, gw, gh, info, item);

        // Return true so some() will stop and also return true.
        return true;
      };

      while (r--) {
        var points = getPointsAtRadius(maxRadius - r);

        if (settings.shuffle) {
          points = [].concat(points);
          shuffleArray(points);
        }

        // Try to fit the words by looking at each point.
        // array.some() will stop and return true
        // when putWordAtPoint() returns true.
        // If all the points returns false, array.some() returns false.
        var drawn = points.some(tryToPutWordAtPoint);

        if (drawn) {
          // leave putWord() and return true
          return true;
        }
      }
      if (settings.shrinkToFit) {
        if (Array.isArray(item)) {
          item[1] = item[1] * 3 / 4;
        } else {
          item.weight = item.weight * 3 / 4;
        }
        return putWord(item);
      }
      // we tried all distances but text won't fit, return false
      return false;
    };

    /* Send DOM event to all elements. Will stop sending event and return
       if the previous one is canceled (for cancelable events). */
    var sendEvent = function sendEvent(type, cancelable, details) {
      if (cancelable) {
        return !elements.some(function(el) {
          var event = new CustomEvent(type, {
            detail: details || {}
          });
          return !el.dispatchEvent(event);
        }, this);
      } else {
        elements.forEach(function(el) {
          var event = new CustomEvent(type, {
            detail: details || {}
          });
          el.dispatchEvent(event);
        }, this);
      }
    };

    /* Start drawing on a canvas */
    var start = function start() {
      // For dimensions, clearCanvas etc.,
      // we only care about the first element.
      var canvas = elements[0];

      if (canvas.getContext) {
        ngx = Math.ceil(canvas.width / g);
        ngy = Math.ceil(canvas.height / g);
      } else {
        var rect = canvas.getBoundingClientRect();
        ngx = Math.ceil(rect.width / g);
        ngy = Math.ceil(rect.height / g);
      }

      // Sending a wordcloudstart event which cause the previous loop to stop.
      // Do nothing if the event is canceled.
      if (!sendEvent('wordcloudstart', true)) {
        return;
      }

      // Determine the center of the word cloud
      center = (settings.origin) ?
        [settings.origin[0]/g, settings.origin[1]/g] :
        [ngx / 2, ngy / 2];

      // Maxium radius to look for space
      maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy));

      /* Clear the canvas only if the clearCanvas is set,
         if not, update the grid to the current canvas state */
      grid = [];

      var gx, gy, i;
      if (!canvas.getContext || settings.clearCanvas) {
        elements.forEach(function(el) {
          if (el.getContext) {
            var ctx = el.getContext('2d');
            ctx.fillStyle = settings.backgroundColor;
            ctx.clearRect(0, 0, ngx * (g + 1), ngy * (g + 1));
            ctx.fillRect(0, 0, ngx * (g + 1), ngy * (g + 1));
          } else {
            el.textContent = '';
            el.style.backgroundColor = settings.backgroundColor;
            el.style.position = 'relative';
          }
        });

        /* fill the grid with empty state */
        gx = ngx;
        while (gx--) {
          grid[gx] = [];
          gy = ngy;
          while (gy--) {
            grid[gx][gy] = true;
          }
        }
      } else {
        /* Determine bgPixel by creating
           another canvas and fill the specified background color. */
        var bctx = document.createElement('canvas').getContext('2d');

        bctx.fillStyle = settings.backgroundColor;
        bctx.fillRect(0, 0, 1, 1);
        var bgPixel = bctx.getImageData(0, 0, 1, 1).data;

        /* Read back the pixels of the canvas we got to tell which part of the
           canvas is empty.
           (no clearCanvas only works with a canvas, not divs) */
        var imageData =
          canvas.getContext('2d').getImageData(0, 0, ngx * g, ngy * g).data;

        gx = ngx;
        var x, y;
        while (gx--) {
          grid[gx] = [];
          gy = ngy;
          while (gy--) {
            y = g;
            singleGridLoop: while (y--) {
              x = g;
              while (x--) {
                i = 4;
                while (i--) {
                  if (imageData[((gy * g + y) * ngx * g +
                                 (gx * g + x)) * 4 + i] !== bgPixel[i]) {
                    grid[gx][gy] = false;
                    break singleGridLoop;
                  }
                }
              }
            }
            if (grid[gx][gy] !== false) {
              grid[gx][gy] = true;
            }
          }
        }

        imageData = bctx = bgPixel = undefined;
      }

      // fill the infoGrid with empty state if we need it
      if (settings.hover || settings.click) {

        interactive = true;

        /* fill the grid with empty state */
        gx = ngx + 1;
        while (gx--) {
          infoGrid[gx] = [];
        }

        if (settings.hover) {
          canvas.addEventListener('mousemove', wordcloudhover);
        }

        if (settings.click) {
          canvas.addEventListener('click', wordcloudclick);
          canvas.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
        }

        canvas.addEventListener('wordcloudstart', function stopInteraction() {
          canvas.removeEventListener('wordcloudstart', stopInteraction);

          canvas.removeEventListener('mousemove', wordcloudhover);
          canvas.removeEventListener('click', wordcloudclick);
          hovered = undefined;
        });
      }

      i = 0;
      var loopingFunction, stoppingFunction;
      if (settings.wait !== 0) {
        loopingFunction = window.setTimeout;
        stoppingFunction = window.clearTimeout;
      } else {
        loopingFunction = window.setImmediate;
        stoppingFunction = window.clearImmediate;
      }

      var addEventListener = function addEventListener(type, listener) {
        elements.forEach(function(el) {
          el.addEventListener(type, listener);
        }, this);
      };

      var removeEventListener = function removeEventListener(type, listener) {
        elements.forEach(function(el) {
          el.removeEventListener(type, listener);
        }, this);
      };

      var anotherWordCloudStart = function anotherWordCloudStart() {
        removeEventListener('wordcloudstart', anotherWordCloudStart);
        stoppingFunction(timer);
      };

      addEventListener('wordcloudstart', anotherWordCloudStart);

      var timer = loopingFunction(function loop() {
        if (i >= settings.list.length) {
          stoppingFunction(timer);
          sendEvent('wordcloudstop', false);
          removeEventListener('wordcloudstart', anotherWordCloudStart);

          return;
        }
        escapeTime = (new Date()).getTime();
        var drawn = putWord(settings.list[i]);
        var canceled = !sendEvent('wordclouddrawn', true, {
          item: settings.list[i], drawn: drawn });
        if (exceedTime() || canceled) {
          stoppingFunction(timer);
          settings.abort();
          sendEvent('wordcloudabort', false);
          sendEvent('wordcloudstop', false);
          removeEventListener('wordcloudstart', anotherWordCloudStart);
          return;
        }
        i++;
        timer = loopingFunction(loop, settings.wait);
      }, settings.wait);
    };

    // All set, start the drawing
    start();
  };

  WordCloud.isSupported = isSupported;
  WordCloud.minFontSize = minFontSize;

export { WordCloud };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZGNsb3VkMi5lZjI5MmM0ZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvd29yZGNsb3VkMi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIHdvcmRjbG91ZDIuanNcbiAqIGh0dHA6Ly90aW1kcmVhbS5vcmcvd29yZGNsb3VkMi5qcy9cbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSAtIDIwMTkgVGltIEd1YW4tdGluIENoaWVuIGFuZCBjb250cmlidXRvcnMuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG4vLyBzZXRJbW1lZGlhdGVcbmlmICghd2luZG93LnNldEltbWVkaWF0ZSkge1xuICB3aW5kb3cuc2V0SW1tZWRpYXRlID0gKGZ1bmN0aW9uIHNldHVwU2V0SW1tZWRpYXRlKCkge1xuICAgIHJldHVybiB3aW5kb3cubXNTZXRJbW1lZGlhdGUgfHxcbiAgICB3aW5kb3cud2Via2l0U2V0SW1tZWRpYXRlIHx8XG4gICAgd2luZG93Lm1velNldEltbWVkaWF0ZSB8fFxuICAgIHdpbmRvdy5vU2V0SW1tZWRpYXRlIHx8XG4gICAgKGZ1bmN0aW9uIHNldHVwU2V0WmVyb1RpbWVvdXQoKSB7XG4gICAgICBpZiAoIXdpbmRvdy5wb3N0TWVzc2FnZSB8fCAhd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxsYmFja3MgPSBbdW5kZWZpbmVkXTtcbiAgICAgIHZhciBtZXNzYWdlID0gJ3plcm8tdGltZW91dC1tZXNzYWdlJztcblxuICAgICAgLy8gTGlrZSBzZXRUaW1lb3V0LCBidXQgb25seSB0YWtlcyBhIGZ1bmN0aW9uIGFyZ3VtZW50LiAgVGhlcmUnc1xuICAgICAgLy8gbm8gdGltZSBhcmd1bWVudCAoYWx3YXlzIHplcm8pIGFuZCBubyBhcmd1bWVudHMgKHlvdSBoYXZlIHRvXG4gICAgICAvLyB1c2UgYSBjbG9zdXJlKS5cbiAgICAgIHZhciBzZXRaZXJvVGltZW91dCA9IGZ1bmN0aW9uIHNldFplcm9UaW1lb3V0KGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBpZCA9IGNhbGxiYWNrcy5sZW5ndGg7XG4gICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UgKyBpZC50b1N0cmluZygzNiksICcqJyk7XG5cbiAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgfTtcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiBzZXRaZXJvVGltZW91dE1lc3NhZ2UoZXZ0KSB7XG4gICAgICAgIC8vIFNraXBwaW5nIGNoZWNraW5nIGV2ZW50IHNvdXJjZSwgcmV0YXJkZWQgSUUgY29uZnVzZWQgdGhpcyB3aW5kb3dcbiAgICAgICAgLy8gb2JqZWN0IHdpdGggYW5vdGhlciBpbiB0aGUgcHJlc2VuY2Ugb2YgaWZyYW1lXG4gICAgICAgIGlmICh0eXBlb2YgZXZ0LmRhdGEgIT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICBldnQuZGF0YS5zdWJzdHIoMCwgbWVzc2FnZS5sZW5ndGgpICE9PSBtZXNzYWdlLyogfHxcbiAgICAgICAgICAgIGV2dC5zb3VyY2UgIT09IHdpbmRvdyAqLykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2dC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB2YXIgaWQgPSBwYXJzZUludChldnQuZGF0YS5zdWJzdHIobWVzc2FnZS5sZW5ndGgpLCAzNik7XG4gICAgICAgIGlmICghY2FsbGJhY2tzW2lkXSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrc1tpZF0oKTtcbiAgICAgICAgY2FsbGJhY2tzW2lkXSA9IHVuZGVmaW5lZDtcbiAgICAgIH0sIHRydWUpO1xuXG4gICAgICAvKiBzcGVjaWZ5IGNsZWFySW1tZWRpYXRlKCkgaGVyZSBzaW5jZSB3ZSBuZWVkIHRoZSBzY29wZSAqL1xuICAgICAgd2luZG93LmNsZWFySW1tZWRpYXRlID0gZnVuY3Rpb24gY2xlYXJaZXJvVGltZW91dChpZCkge1xuICAgICAgICBpZiAoIWNhbGxiYWNrc1tpZF0pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFja3NbaWRdID0gdW5kZWZpbmVkO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHNldFplcm9UaW1lb3V0O1xuICAgIH0pKCkgfHxcbiAgICAvLyBmYWxsYmFja1xuICAgIGZ1bmN0aW9uIHNldEltbWVkaWF0ZUZhbGxiYWNrKGZuKSB7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbiAgfSkoKTtcbn1cblxuaWYgKCF3aW5kb3cuY2xlYXJJbW1lZGlhdGUpIHtcbiAgd2luZG93LmNsZWFySW1tZWRpYXRlID0gKGZ1bmN0aW9uIHNldHVwQ2xlYXJJbW1lZGlhdGUoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5tc0NsZWFySW1tZWRpYXRlIHx8XG4gICAgd2luZG93LndlYmtpdENsZWFySW1tZWRpYXRlIHx8XG4gICAgd2luZG93Lm1vekNsZWFySW1tZWRpYXRlIHx8XG4gICAgd2luZG93Lm9DbGVhckltbWVkaWF0ZSB8fFxuICAgIC8vIFwiY2xlYXJaZXJvVGltZW91dFwiIGlzIGltcGxlbWVudCBvbiB0aGUgcHJldmlvdXMgYmxvY2sgfHxcbiAgICAvLyBmYWxsYmFja1xuICAgIGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlRmFsbGJhY2sodGltZXIpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xuICAgIH07XG4gIH0pKCk7XG59XG5cblxuICAvLyBDaGVjayBpZiBXb3JkQ2xvdWQgY2FuIHJ1biBvbiB0aGlzIGJyb3dzZXJcbiAgdmFyIGlzU3VwcG9ydGVkID0gKGZ1bmN0aW9uIGlzU3VwcG9ydGVkKCkge1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBpZiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgaWYgKCFjdHgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFjdHguZ2V0SW1hZ2VEYXRhKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghY3R4LmZpbGxUZXh0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFBcnJheS5wcm90b3R5cGUuc29tZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LnByb3RvdHlwZS5wdXNoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0oKSk7XG5cbiAgLy8gRmluZCBvdXQgaWYgdGhlIGJyb3dzZXIgaW1wb3NlIG1pbml1bSBmb250IHNpemUgYnlcbiAgLy8gZHJhd2luZyBzbWFsbCB0ZXh0cyBvbiBhIGNhbnZhcyBhbmQgbWVhc3VyZSBpdCdzIHdpZHRoLlxuICB2YXIgbWluRm9udFNpemUgPSAoZnVuY3Rpb24gZ2V0TWluRm9udFNpemUoKSB7XG4gICAgaWYgKCFpc1N1cHBvcnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjdHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gc3RhcnQgZnJvbSAyMFxuICAgIHZhciBzaXplID0gMjA7XG5cbiAgICAvLyB0d28gc2l6ZXMgdG8gbWVhc3VyZVxuICAgIHZhciBoYW5XaWR0aCwgbVdpZHRoO1xuXG4gICAgd2hpbGUgKHNpemUpIHtcbiAgICAgIGN0eC5mb250ID0gc2l6ZS50b1N0cmluZygxMCkgKyAncHggc2Fucy1zZXJpZic7XG4gICAgICBpZiAoKGN0eC5tZWFzdXJlVGV4dCgnXFx1RkYzNycpLndpZHRoID09PSBoYW5XaWR0aCkgJiZcbiAgICAgICAgICAoY3R4Lm1lYXN1cmVUZXh0KCdtJykud2lkdGgpID09PSBtV2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIChzaXplICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGhhbldpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KCdcXHVGRjM3Jykud2lkdGg7XG4gICAgICBtV2lkdGggPSBjdHgubWVhc3VyZVRleHQoJ20nKS53aWR0aDtcblxuICAgICAgc2l6ZS0tO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9KSgpO1xuXG4gIC8vIEJhc2VkIG9uIGh0dHA6Ly9qc2Zyb21oZWxsLmNvbS9hcnJheS9zaHVmZmxlXG4gIHZhciBzaHVmZmxlQXJyYXkgPSBmdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyKSB7XG4gICAgZm9yICh2YXIgaiwgeCwgaSA9IGFyci5sZW5ndGg7IGk7XG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSksXG4gICAgICB4ID0gYXJyWy0taV0sIGFycltpXSA9IGFycltqXSxcbiAgICAgIGFycltqXSA9IHgpIHt9XG4gICAgcmV0dXJuIGFycjtcbiAgfTtcblxuICB2YXIgV29yZENsb3VkID0gZnVuY3Rpb24gV29yZENsb3VkKGVsZW1lbnRzLCBvcHRpb25zKSB7XG4gICAgaWYgKCFpc1N1cHBvcnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghQXJyYXkuaXNBcnJheShlbGVtZW50cykpIHtcbiAgICAgIGVsZW1lbnRzID0gW2VsZW1lbnRzXTtcbiAgICB9XG5cbiAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsLCBpKSB7XG4gICAgICBpZiAodHlwZW9mIGVsID09PSAnc3RyaW5nJykge1xuICAgICAgICBlbGVtZW50c1tpXSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKTtcbiAgICAgICAgaWYgKCFlbGVtZW50c1tpXSkge1xuICAgICAgICAgIHRocm93ICdUaGUgZWxlbWVudCBpZCBzcGVjaWZpZWQgaXMgbm90IGZvdW5kLic7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWVsLnRhZ05hbWUgJiYgIWVsLmFwcGVuZENoaWxkKSB7XG4gICAgICAgIHRocm93ICdZb3UgbXVzdCBwYXNzIHZhbGlkIEhUTUwgZWxlbWVudHMsIG9yIElEIG9mIHRoZSBlbGVtZW50Lic7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiBEZWZhdWx0IHZhbHVlcyB0byBiZSBvdmVyd3JpdHRlbiBieSBvcHRpb25zIG9iamVjdCAqL1xuICAgIHZhciBzZXR0aW5ncyA9IHtcbiAgICAgIGxpc3Q6IFtdLFxuICAgICAgZm9udEZhbWlseTogJ1wiVHJlYnVjaGV0IE1TXCIsIFwiSGVpdGkgVENcIiwgXCLlvq7ou5/mraPpu5Hpq5RcIiwgJyArXG4gICAgICAgICAgICAgICAgICAnXCJBcmlhbCBVbmljb2RlIE1TXCIsIFwiRHJvaWQgRmFsbGJhY2sgU2Fuc1wiLCBzYW5zLXNlcmlmJyxcbiAgICAgIGZvbnRXZWlnaHQ6ICdub3JtYWwnLFxuICAgICAgY29sb3I6ICdyYW5kb20tZGFyaycsXG4gICAgICBtaW5TaXplOiAwLCAvLyAwIHRvIGRpc2FibGVcbiAgICAgIHdlaWdodEZhY3RvcjogMSxcbiAgICAgIGNsZWFyQ2FudmFzOiB0cnVlLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsICAvLyBvcGFxdWUgd2hpdGUgPSByZ2JhKDI1NSwgMjU1LCAyNTUsIDEpXG5cbiAgICAgIGdyaWRTaXplOiA4LFxuICAgICAgZHJhd091dE9mQm91bmQ6IGZhbHNlLFxuICAgICAgc2hyaW5rVG9GaXQ6IGZhbHNlLFxuICAgICAgb3JpZ2luOiBudWxsLFxuXG4gICAgICBkcmF3TWFzazogZmFsc2UsXG4gICAgICBtYXNrQ29sb3I6ICdyZ2JhKDI1NSwwLDAsMC4zKScsXG4gICAgICBtYXNrR2FwV2lkdGg6IDAuMyxcblxuICAgICAgd2FpdDogMCxcbiAgICAgIGFib3J0VGhyZXNob2xkOiAwLCAvLyBkaXNhYmxlZFxuICAgICAgYWJvcnQ6IGZ1bmN0aW9uIG5vb3AoKSB7fSxcblxuICAgICAgbWluUm90YXRpb246IC0gTWF0aC5QSSAvIDIsXG4gICAgICBtYXhSb3RhdGlvbjogTWF0aC5QSSAvIDIsXG4gICAgICByb3RhdGlvblN0ZXBzOiAwLFxuXG4gICAgICBzaHVmZmxlOiB0cnVlLFxuICAgICAgcm90YXRlUmF0aW86IDAuMSxcblxuICAgICAgc2hhcGU6ICdjaXJjbGUnLFxuICAgICAgZWxsaXB0aWNpdHk6IDAuNjUsXG5cbiAgICAgIGNsYXNzZXM6IG51bGwsXG5cbiAgICAgIGhvdmVyOiBudWxsLFxuICAgICAgY2xpY2s6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlmIChrZXkgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgICBzZXR0aW5nc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogQ29udmVydCB3ZWlnaHRGYWN0b3IgaW50byBhIGZ1bmN0aW9uICovXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy53ZWlnaHRGYWN0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBmYWN0b3IgPSBzZXR0aW5ncy53ZWlnaHRGYWN0b3I7XG4gICAgICBzZXR0aW5ncy53ZWlnaHRGYWN0b3IgPSBmdW5jdGlvbiB3ZWlnaHRGYWN0b3IocHQpIHtcbiAgICAgICAgcmV0dXJuIHB0ICogZmFjdG9yOyAvL2luIHB4XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qIENvbnZlcnQgc2hhcGUgaW50byBhIGZ1bmN0aW9uICovXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5zaGFwZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgc3dpdGNoIChzZXR0aW5ncy5zaGFwZSkge1xuICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gJ2NpcmNsZScgaXMgdGhlIGRlZmF1bHQgYW5kIGEgc2hvcnRjdXQgaW4gdGhlIGNvZGUgbG9vcC5cbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9ICdjaXJjbGUnO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NhcmRpb2lkJzpcbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9IGZ1bmN0aW9uIHNoYXBlQ2FyZGlvaWQodGhldGEpIHtcbiAgICAgICAgICAgIHJldHVybiAxIC0gTWF0aC5zaW4odGhldGEpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLypcbiAgICAgICAgVG8gd29yayBvdXQgYW4gWC1nb24sIG9uZSBoYXMgdG8gY2FsY3VsYXRlIFwibVwiLFxuICAgICAgICB3aGVyZSAxLyhjb3MoMipQSS9YKSttKnNpbigyKlBJL1gpKSA9IDEvKGNvcygwKSttKnNpbigwKSlcbiAgICAgICAgaHR0cDovL3d3dy53b2xmcmFtYWxwaGEuY29tL2lucHV0Lz9pPTElMkYlMjhjb3MlMjgyKlBJJTJGWCUyOSUyQm0qc2luJTI4XG4gICAgICAgIDIqUEklMkZYJTI5JTI5KyUzRCsxJTJGJTI4Y29zJTI4MCUyOSUyQm0qc2luJTI4MCUyOSUyOVxuICAgICAgICBDb3B5IHRoZSBzb2x1dGlvbiBpbnRvIHBvbGFyIGVxdWF0aW9uIHIgPSAxLyhjb3ModCcpICsgbSpzaW4odCcpKVxuICAgICAgICB3aGVyZSB0JyBlcXVhbHMgdG8gbW9kKHQsIDJQSS9YKTtcbiAgICAgICAgKi9cblxuICAgICAgICBjYXNlICdkaWFtb25kJzpcbiAgICAgICAgICAvLyBodHRwOi8vd3d3LndvbGZyYW1hbHBoYS5jb20vaW5wdXQvP2k9cGxvdCtyKyUzRCsxJTJGJTI4Y29zJTI4bW9kK1xuICAgICAgICAgIC8vICUyOHQlMkMrUEklMkYyJTI5JTI5JTJCc2luJTI4bW9kKyUyOHQlMkMrUEklMkYyJTI5JTI5JTI5JTJDK3QrJTNEXG4gICAgICAgICAgLy8gKzArLi4rMipQSVxuICAgICAgICAgIHNldHRpbmdzLnNoYXBlID0gZnVuY3Rpb24gc2hhcGVTcXVhcmUodGhldGEpIHtcbiAgICAgICAgICAgIHZhciB0aGV0YVByaW1lID0gdGhldGEgJSAoMiAqIE1hdGguUEkgLyA0KTtcbiAgICAgICAgICAgIHJldHVybiAxIC8gKE1hdGguY29zKHRoZXRhUHJpbWUpICsgTWF0aC5zaW4odGhldGFQcmltZSkpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICAvLyBodHRwOi8vd3d3LndvbGZyYW1hbHBoYS5jb20vaW5wdXQvP2k9cGxvdCtyKyUzRCttaW4oMSUyRmFicyhjb3ModFxuICAgICAgICAgIC8vICkpLDElMkZhYnMoc2luKHQpKSkpLCt0KyUzRCswKy4uKzIqUElcbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9IGZ1bmN0aW9uIHNoYXBlU3F1YXJlKHRoZXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oXG4gICAgICAgICAgICAgIDEgLyBNYXRoLmFicyhNYXRoLmNvcyh0aGV0YSkpLFxuICAgICAgICAgICAgICAxIC8gTWF0aC5hYnMoTWF0aC5zaW4odGhldGEpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlLWZvcndhcmQnOlxuICAgICAgICAgIC8vIGh0dHA6Ly93d3cud29sZnJhbWFscGhhLmNvbS9pbnB1dC8/aT1wbG90K3IrJTNEKzElMkYlMjhjb3MlMjhtb2QrXG4gICAgICAgICAgLy8gJTI4dCUyQysyKlBJJTJGMyUyOSUyOSUyQnNxcnQlMjgzJTI5c2luJTI4bW9kKyUyOHQlMkMrMipQSSUyRjMlMjlcbiAgICAgICAgICAvLyAlMjklMjklMkMrdCslM0QrMCsuLisyKlBJXG4gICAgICAgICAgc2V0dGluZ3Muc2hhcGUgPSBmdW5jdGlvbiBzaGFwZVRyaWFuZ2xlKHRoZXRhKSB7XG4gICAgICAgICAgICB2YXIgdGhldGFQcmltZSA9IHRoZXRhICUgKDIgKiBNYXRoLlBJIC8gMyk7XG4gICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcyh0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnNxcnQoMykgKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0cmlhbmdsZSc6XG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlLXVwcmlnaHQnOlxuICAgICAgICAgIHNldHRpbmdzLnNoYXBlID0gZnVuY3Rpb24gc2hhcGVUcmlhbmdsZSh0aGV0YSkge1xuICAgICAgICAgICAgdmFyIHRoZXRhUHJpbWUgPSAodGhldGEgKyBNYXRoLlBJICogMyAvIDIpICUgKDIgKiBNYXRoLlBJIC8gMyk7XG4gICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcyh0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnNxcnQoMykgKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwZW50YWdvbic6XG4gICAgICAgICAgc2V0dGluZ3Muc2hhcGUgPSBmdW5jdGlvbiBzaGFwZVBlbnRhZ29uKHRoZXRhKSB7XG4gICAgICAgICAgICB2YXIgdGhldGFQcmltZSA9ICh0aGV0YSArIDAuOTU1KSAlICgyICogTWF0aC5QSSAvIDUpO1xuICAgICAgICAgICAgcmV0dXJuIDEgLyAoTWF0aC5jb3ModGhldGFQcmltZSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgMC43MjY1NDMgKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzdGFyJzpcbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9IGZ1bmN0aW9uIHNoYXBlU3Rhcih0aGV0YSkge1xuICAgICAgICAgICAgdmFyIHRoZXRhUHJpbWUgPSAodGhldGEgKyAwLjk1NSkgJSAoMiAqIE1hdGguUEkgLyAxMCk7XG4gICAgICAgICAgICBpZiAoKHRoZXRhICsgMC45NTUpICUgKDIgKiBNYXRoLlBJIC8gNSkgLSAoMiAqIE1hdGguUEkgLyAxMCkgPj0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcygoMiAqIE1hdGguUEkgLyAxMCkgLSB0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDMuMDc3NjggKiBNYXRoLnNpbigoMiAqIE1hdGguUEkgLyAxMCkgLSB0aGV0YVByaW1lKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcyh0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDMuMDc3NjggKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBNYWtlIHN1cmUgZ3JpZFNpemUgaXMgYSB3aG9sZSBudW1iZXIgYW5kIGlzIG5vdCBzbWFsbGVyIHRoYW4gNHB4ICovXG4gICAgc2V0dGluZ3MuZ3JpZFNpemUgPSBNYXRoLm1heChNYXRoLmZsb29yKHNldHRpbmdzLmdyaWRTaXplKSwgNCk7XG5cbiAgICAvKiBzaG9ydGhhbmQgKi9cbiAgICB2YXIgZyA9IHNldHRpbmdzLmdyaWRTaXplO1xuICAgIHZhciBtYXNrUmVjdFdpZHRoID0gZyAtIHNldHRpbmdzLm1hc2tHYXBXaWR0aDtcblxuICAgIC8qIG5vcm1hbGl6ZSByb3RhdGlvbiBzZXR0aW5ncyAqL1xuICAgIHZhciByb3RhdGlvblJhbmdlID0gTWF0aC5hYnMoc2V0dGluZ3MubWF4Um90YXRpb24gLSBzZXR0aW5ncy5taW5Sb3RhdGlvbik7XG4gICAgdmFyIHJvdGF0aW9uU3RlcHMgPSBNYXRoLmFicyhNYXRoLmZsb29yKHNldHRpbmdzLnJvdGF0aW9uU3RlcHMpKTtcbiAgICB2YXIgbWluUm90YXRpb24gPSBNYXRoLm1pbihzZXR0aW5ncy5tYXhSb3RhdGlvbiwgc2V0dGluZ3MubWluUm90YXRpb24pO1xuXG4gICAgLyogaW5mb3JtYXRpb24vb2JqZWN0IGF2YWlsYWJsZSB0byBhbGwgZnVuY3Rpb25zLCBzZXQgd2hlbiBzdGFydCgpICovXG4gICAgdmFyIGdyaWQsIC8vIDJkIGFycmF5IGNvbnRhaW5pbmcgZmlsbGluZyBpbmZvcm1hdGlvblxuICAgICAgbmd4LCBuZ3ksIC8vIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGdyaWRcbiAgICAgIGNlbnRlciwgLy8gcG9zaXRpb24gb2YgdGhlIGNlbnRlciBvZiB0aGUgY2xvdWRcbiAgICAgIG1heFJhZGl1cztcblxuICAgIC8qIHRpbWVzdGFtcCBmb3IgbWVhc3VyaW5nIGVhY2ggcHV0V29yZCgpIGFjdGlvbiAqL1xuICAgIHZhciBlc2NhcGVUaW1lO1xuXG4gICAgLyogZnVuY3Rpb24gZm9yIGdldHRpbmcgdGhlIGNvbG9yIG9mIHRoZSB0ZXh0ICovXG4gICAgdmFyIGdldFRleHRDb2xvcjtcbiAgICBmdW5jdGlvbiByYW5kb21faHNsX2NvbG9yKG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gJ2hzbCgnICtcbiAgICAgICAgKE1hdGgucmFuZG9tKCkgKiAzNjApLnRvRml4ZWQoKSArICcsJyArXG4gICAgICAgIChNYXRoLnJhbmRvbSgpICogMzAgKyA3MCkudG9GaXhlZCgpICsgJyUsJyArXG4gICAgICAgIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pLnRvRml4ZWQoKSArICclKSc7XG4gICAgfVxuICAgIHN3aXRjaCAoc2V0dGluZ3MuY29sb3IpIHtcbiAgICAgIGNhc2UgJ3JhbmRvbS1kYXJrJzpcbiAgICAgICAgZ2V0VGV4dENvbG9yID0gZnVuY3Rpb24gZ2V0UmFuZG9tRGFya0NvbG9yKCkge1xuICAgICAgICAgIHJldHVybiByYW5kb21faHNsX2NvbG9yKDEwLCA1MCk7XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdyYW5kb20tbGlnaHQnOlxuICAgICAgICBnZXRUZXh0Q29sb3IgPSBmdW5jdGlvbiBnZXRSYW5kb21MaWdodENvbG9yKCkge1xuICAgICAgICAgIHJldHVybiByYW5kb21faHNsX2NvbG9yKDUwLCA5MCk7XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmNvbG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZ2V0VGV4dENvbG9yID0gc2V0dGluZ3MuY29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLyogZnVuY3Rpb24gZm9yIGdldHRpbmcgdGhlIGZvbnQtd2VpZ2h0IG9mIHRoZSB0ZXh0ICovXG4gICAgdmFyIGdldFRleHRGb250V2VpZ2h0O1xuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuZm9udFdlaWdodCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZ2V0VGV4dEZvbnRXZWlnaHQgPSBzZXR0aW5ncy5mb250V2VpZ2h0O1xuICAgIH1cblxuICAgIC8qIGZ1bmN0aW9uIGZvciBnZXR0aW5nIHRoZSBjbGFzc2VzIG9mIHRoZSB0ZXh0ICovXG4gICAgdmFyIGdldFRleHRDbGFzc2VzID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHNldHRpbmdzLmNsYXNzZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGdldFRleHRDbGFzc2VzID0gc2V0dGluZ3MuY2xhc3NlcztcbiAgICB9XG5cbiAgICAvKiBJbnRlcmFjdGl2ZSAqL1xuICAgIHZhciBpbnRlcmFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBpbmZvR3JpZCA9IFtdO1xuICAgIHZhciBob3ZlcmVkO1xuXG4gICAgdmFyIGdldEluZm9HcmlkRnJvbU1vdXNlVG91Y2hFdmVudCA9XG4gICAgZnVuY3Rpb24gZ2V0SW5mb0dyaWRGcm9tTW91c2VUb3VjaEV2ZW50KGV2dCkge1xuICAgICAgdmFyIGNhbnZhcyA9IGV2dC5jdXJyZW50VGFyZ2V0O1xuICAgICAgdmFyIHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2xpZW50WDtcbiAgICAgIHZhciBjbGllbnRZO1xuICAgICAgLyoqIERldGVjdCBpZiB0b3VjaGVzIGFyZSBhdmFpbGFibGUgKi9cbiAgICAgIGlmIChldnQudG91Y2hlcykge1xuICAgICAgICBjbGllbnRYID0gZXZ0LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgY2xpZW50WSA9IGV2dC50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbGllbnRYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgIGNsaWVudFkgPSBldnQuY2xpZW50WTtcbiAgICAgIH1cbiAgICAgIHZhciBldmVudFggPSBjbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgdmFyIGV2ZW50WSA9IGNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgdmFyIHggPSBNYXRoLmZsb29yKGV2ZW50WCAqICgoY2FudmFzLndpZHRoIC8gcmVjdC53aWR0aCkgfHwgMSkgLyBnKTtcbiAgICAgIHZhciB5ID0gTWF0aC5mbG9vcihldmVudFkgKiAoKGNhbnZhcy5oZWlnaHQgLyByZWN0LmhlaWdodCkgfHwgMSkgLyBnKTtcblxuICAgICAgcmV0dXJuIGluZm9HcmlkW3hdW3ldO1xuICAgIH07XG5cbiAgICB2YXIgd29yZGNsb3VkaG92ZXIgPSBmdW5jdGlvbiB3b3JkY2xvdWRob3ZlcihldnQpIHtcbiAgICAgIHZhciBpbmZvID0gZ2V0SW5mb0dyaWRGcm9tTW91c2VUb3VjaEV2ZW50KGV2dCk7XG5cbiAgICAgIGlmIChob3ZlcmVkID09PSBpbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaG92ZXJlZCA9IGluZm87XG4gICAgICBpZiAoIWluZm8pIHtcbiAgICAgICAgc2V0dGluZ3MuaG92ZXIodW5kZWZpbmVkLCB1bmRlZmluZWQsIGV2dCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZXR0aW5ncy5ob3ZlcihpbmZvLml0ZW0sIGluZm8uZGltZW5zaW9uLCBldnQpO1xuXG4gICAgfTtcblxuICAgIHZhciB3b3JkY2xvdWRjbGljayA9IGZ1bmN0aW9uIHdvcmRjbG91ZGNsaWNrKGV2dCkge1xuICAgICAgdmFyIGluZm8gPSBnZXRJbmZvR3JpZEZyb21Nb3VzZVRvdWNoRXZlbnQoZXZ0KTtcbiAgICAgIGlmICghaW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNldHRpbmdzLmNsaWNrKGluZm8uaXRlbSwgaW5mby5kaW1lbnNpb24sIGV2dCk7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuXG4gICAgLyogR2V0IHBvaW50cyBvbiB0aGUgZ3JpZCBmb3IgYSBnaXZlbiByYWRpdXMgYXdheSBmcm9tIHRoZSBjZW50ZXIgKi9cbiAgICB2YXIgcG9pbnRzQXRSYWRpdXMgPSBbXTtcbiAgICB2YXIgZ2V0UG9pbnRzQXRSYWRpdXMgPSBmdW5jdGlvbiBnZXRQb2ludHNBdFJhZGl1cyhyYWRpdXMpIHtcbiAgICAgIGlmIChwb2ludHNBdFJhZGl1c1tyYWRpdXNdKSB7XG4gICAgICAgIHJldHVybiBwb2ludHNBdFJhZGl1c1tyYWRpdXNdO1xuICAgICAgfVxuXG4gICAgICAvLyBMb29rIGZvciB0aGVzZSBudW1iZXIgb2YgcG9pbnRzIG9uIGVhY2ggcmFkaXVzXG4gICAgICB2YXIgVCA9IHJhZGl1cyAqIDg7XG5cbiAgICAgIC8vIEdldHRpbmcgYWxsIHRoZSBwb2ludHMgYXQgdGhpcyByYWRpdXNcbiAgICAgIHZhciB0ID0gVDtcbiAgICAgIHZhciBwb2ludHMgPSBbXTtcblxuICAgICAgaWYgKHJhZGl1cyA9PT0gMCkge1xuICAgICAgICBwb2ludHMucHVzaChbY2VudGVyWzBdLCBjZW50ZXJbMV0sIDBdKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHQtLSkge1xuICAgICAgICAvLyBkaXN0b3J0IHRoZSByYWRpdXMgdG8gcHV0IHRoZSBjbG91ZCBpbiBzaGFwZVxuICAgICAgICB2YXIgcnggPSAxO1xuICAgICAgICBpZiAoc2V0dGluZ3Muc2hhcGUgIT09ICdjaXJjbGUnKSB7XG4gICAgICAgICAgcnggPSBzZXR0aW5ncy5zaGFwZSh0IC8gVCAqIDIgKiBNYXRoLlBJKTsgLy8gMCB0byAxXG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIFt4LCB5LCB0XTsgdCBpcyB1c2VkIHNvbGVseSBmb3IgZ2V0VGV4dENvbG9yKClcbiAgICAgICAgcG9pbnRzLnB1c2goW1xuICAgICAgICAgIGNlbnRlclswXSArIHJhZGl1cyAqIHJ4ICogTWF0aC5jb3MoLXQgLyBUICogMiAqIE1hdGguUEkpLFxuICAgICAgICAgIGNlbnRlclsxXSArIHJhZGl1cyAqIHJ4ICogTWF0aC5zaW4oLXQgLyBUICogMiAqIE1hdGguUEkpICpcbiAgICAgICAgICAgIHNldHRpbmdzLmVsbGlwdGljaXR5LFxuICAgICAgICAgIHQgLyBUICogMiAqIE1hdGguUEldKTtcbiAgICAgIH1cblxuICAgICAgcG9pbnRzQXRSYWRpdXNbcmFkaXVzXSA9IHBvaW50cztcbiAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfTtcblxuICAgIC8qIFJldHVybiB0cnVlIGlmIHdlIGhhZCBzcGVudCB0b28gbXVjaCB0aW1lICovXG4gICAgdmFyIGV4Y2VlZFRpbWUgPSBmdW5jdGlvbiBleGNlZWRUaW1lKCkge1xuICAgICAgcmV0dXJuICgoc2V0dGluZ3MuYWJvcnRUaHJlc2hvbGQgPiAwKSAmJlxuICAgICAgICAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIGVzY2FwZVRpbWUgPiBzZXR0aW5ncy5hYm9ydFRocmVzaG9sZCkpO1xuICAgIH07XG5cbiAgICAvKiBHZXQgdGhlIGRlZyBvZiByb3RhdGlvbiBhY2NvcmRpbmcgdG8gc2V0dGluZ3MsIGFuZCBsdWNrLiAqL1xuICAgIHZhciBnZXRSb3RhdGVEZWcgPSBmdW5jdGlvbiBnZXRSb3RhdGVEZWcoKSB7XG4gICAgICBpZiAoc2V0dGluZ3Mucm90YXRlUmF0aW8gPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gc2V0dGluZ3Mucm90YXRlUmF0aW8pIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChyb3RhdGlvblJhbmdlID09PSAwKSB7XG4gICAgICAgIHJldHVybiBtaW5Sb3RhdGlvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvdGF0aW9uU3RlcHMgPiAwKSB7XG4gICAgICAgIC8vIE1pbiByb3RhdGlvbiArIHplcm8gb3IgbW9yZSBzdGVwcyAqIHNwYW4gb2Ygb25lIHN0ZXBcbiAgICAgICAgcmV0dXJuIG1pblJvdGF0aW9uICtcbiAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb3RhdGlvblN0ZXBzKSAqXG4gICAgICAgICAgcm90YXRpb25SYW5nZSAvIChyb3RhdGlvblN0ZXBzIC0gMSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG1pblJvdGF0aW9uICsgTWF0aC5yYW5kb20oKSAqIHJvdGF0aW9uUmFuZ2U7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRUZXh0SW5mbyA9IGZ1bmN0aW9uIGdldFRleHRJbmZvKHdvcmQsIHdlaWdodCwgcm90YXRlRGVnKSB7XG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIGFjdXRhbCBmb250IHNpemVcbiAgICAgIC8vIGZvbnRTaXplID09PSAwIG1lYW5zIHdlaWdodEZhY3RvciBmdW5jdGlvbiB3YW50cyB0aGUgdGV4dCBza2lwcGVkLFxuICAgICAgLy8gYW5kIHNpemUgPCBtaW5TaXplIG1lYW5zIHdlIGNhbm5vdCBkcmF3IHRoZSB0ZXh0LlxuICAgICAgdmFyIGRlYnVnID0gZmFsc2U7XG4gICAgICB2YXIgZm9udFNpemUgPSBzZXR0aW5ncy53ZWlnaHRGYWN0b3Iod2VpZ2h0KTtcbiAgICAgIGlmIChmb250U2l6ZSA8PSBzZXR0aW5ncy5taW5TaXplKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gU2NhbGUgZmFjdG9yIGhlcmUgaXMgdG8gbWFrZSBzdXJlIGZpbGxUZXh0IGlzIG5vdCBsaW1pdGVkIGJ5XG4gICAgICAvLyB0aGUgbWluaXVtIGZvbnQgc2l6ZSBzZXQgYnkgYnJvd3Nlci5cbiAgICAgIC8vIEl0IHdpbGwgYWx3YXlzIGJlIDEgb3IgMm4uXG4gICAgICB2YXIgbXUgPSAxO1xuICAgICAgaWYgKGZvbnRTaXplIDwgbWluRm9udFNpemUpIHtcbiAgICAgICAgbXUgPSAoZnVuY3Rpb24gY2FsY3VsYXRlU2NhbGVGYWN0b3IoKSB7XG4gICAgICAgICAgdmFyIG11ID0gMjtcbiAgICAgICAgICB3aGlsZSAobXUgKiBmb250U2l6ZSA8IG1pbkZvbnRTaXplKSB7XG4gICAgICAgICAgICBtdSArPSAyO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbXU7XG4gICAgICAgIH0pKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBmb250V2VpZ2h0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIHNldCBmY3R4LmZvbnRcbiAgICAgIHZhciBmb250V2VpZ2h0O1xuICAgICAgaWYgKGdldFRleHRGb250V2VpZ2h0KSB7XG4gICAgICAgIGZvbnRXZWlnaHQgPSBnZXRUZXh0Rm9udFdlaWdodCh3b3JkLCB3ZWlnaHQsIGZvbnRTaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvbnRXZWlnaHQgPSBzZXR0aW5ncy5mb250V2VpZ2h0O1xuICAgICAgfVxuXG4gICAgICB2YXIgZmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgdmFyIGZjdHggPSBmY2FudmFzLmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWUgfSk7XG5cbiAgICAgIGZjdHguZm9udCA9IGZvbnRXZWlnaHQgKyAnICcgK1xuICAgICAgICAoZm9udFNpemUgKiBtdSkudG9TdHJpbmcoMTApICsgJ3B4ICcgKyBzZXR0aW5ncy5mb250RmFtaWx5O1xuXG4gICAgICAvLyBFc3RpbWF0ZSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZXh0IHdpdGggbWVhc3VyZVRleHQoKS5cbiAgICAgIHZhciBmdyA9IGZjdHgubWVhc3VyZVRleHQod29yZCkud2lkdGggLyBtdTtcbiAgICAgIHZhciBmaCA9IE1hdGgubWF4KGZvbnRTaXplICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmY3R4Lm1lYXN1cmVUZXh0KCdtJykud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBmY3R4Lm1lYXN1cmVUZXh0KCdcXHVGRjM3Jykud2lkdGgpIC8gbXU7XG5cbiAgICAgIC8vIENyZWF0ZSBhIGJvdW5kYXJ5IGJveCB0aGF0IGlzIGxhcmdlciB0aGFuIG91ciBlc3RpbWF0ZXMsXG4gICAgICAvLyBzbyB0ZXh0IGRvbid0IGdldCBjdXQgb2YgKGl0IHNpbGwgbWlnaHQpXG4gICAgICB2YXIgYm94V2lkdGggPSBmdyArIGZoICogMjtcbiAgICAgIHZhciBib3hIZWlnaHQgPSBmaCAqIDM7XG4gICAgICB2YXIgZmd3ID0gTWF0aC5jZWlsKGJveFdpZHRoIC8gZyk7XG4gICAgICB2YXIgZmdoID0gTWF0aC5jZWlsKGJveEhlaWdodCAvIGcpO1xuICAgICAgYm94V2lkdGggPSBmZ3cgKiBnO1xuICAgICAgYm94SGVpZ2h0ID0gZmdoICogZztcblxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBwcm9wZXIgb2Zmc2V0cyB0byBtYWtlIHRoZSB0ZXh0IGNlbnRlcmVkIGF0XG4gICAgICAvLyB0aGUgcHJlZmVycmVkIHBvc2l0aW9uLlxuXG4gICAgICAvLyBUaGlzIGlzIHNpbXBseSBoYWxmIG9mIHRoZSB3aWR0aC5cbiAgICAgIHZhciBmaWxsVGV4dE9mZnNldFggPSAtIGZ3IC8gMjtcbiAgICAgIC8vIEluc3RlYWQgb2YgbW92aW5nIHRoZSBib3ggdG8gdGhlIGV4YWN0IG1pZGRsZSBvZiB0aGUgcHJlZmVycmVkXG4gICAgICAvLyBwb3NpdGlvbiwgZm9yIFktb2Zmc2V0IHdlIG1vdmUgMC40IGluc3RlYWQsIHNvIExhdGluIGFscGhhYmV0cyBsb29rXG4gICAgICAvLyB2ZXJ0aWNhbCBjZW50ZXJlZC5cbiAgICAgIHZhciBmaWxsVGV4dE9mZnNldFkgPSAtIGZoICogMC40O1xuXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGFjdHVhbCBkaW1lbnNpb24gb2YgdGhlIGNhbnZhcywgY29uc2lkZXJpbmcgdGhlIHJvdGF0aW9uLlxuICAgICAgdmFyIGNnaCA9IE1hdGguY2VpbCgoYm94V2lkdGggKiBNYXRoLmFicyhNYXRoLnNpbihyb3RhdGVEZWcpKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBib3hIZWlnaHQgKiBNYXRoLmFicyhNYXRoLmNvcyhyb3RhdGVEZWcpKSkgLyBnKTtcbiAgICAgIHZhciBjZ3cgPSBNYXRoLmNlaWwoKGJveFdpZHRoICogTWF0aC5hYnMoTWF0aC5jb3Mocm90YXRlRGVnKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94SGVpZ2h0ICogTWF0aC5hYnMoTWF0aC5zaW4ocm90YXRlRGVnKSkpIC8gZyk7XG4gICAgICB2YXIgd2lkdGggPSBjZ3cgKiBnO1xuICAgICAgdmFyIGhlaWdodCA9IGNnaCAqIGc7XG5cbiAgICAgIGZjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKTtcbiAgICAgIGZjYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gICAgICBpZiAoZGVidWcpIHtcbiAgICAgICAgLy8gQXR0YWNoIGZjYW52YXMgdG8gdGhlIERPTVxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZjYW52YXMpO1xuICAgICAgICAvLyBTYXZlIGl0J3Mgc3RhdGUgc28gdGhhdCB3ZSBjb3VsZCByZXN0b3JlIGFuZCBkcmF3IHRoZSBncmlkIGNvcnJlY3RseS5cbiAgICAgICAgZmN0eC5zYXZlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNjYWxlIHRoZSBjYW52YXMgd2l0aCB8bXV8LlxuICAgICAgZmN0eC5zY2FsZSgxIC8gbXUsIDEgLyBtdSk7XG4gICAgICBmY3R4LnRyYW5zbGF0ZSh3aWR0aCAqIG11IC8gMiwgaGVpZ2h0ICogbXUgLyAyKTtcbiAgICAgIGZjdHgucm90YXRlKC0gcm90YXRlRGVnKTtcblxuICAgICAgLy8gT25jZSB0aGUgd2lkdGgvaGVpZ2h0IGlzIHNldCwgY3R4IGluZm8gd2lsbCBiZSByZXNldC5cbiAgICAgIC8vIFNldCBpdCBhZ2FpbiBoZXJlLlxuICAgICAgZmN0eC5mb250ID0gZm9udFdlaWdodCArICcgJyArXG4gICAgICAgIChmb250U2l6ZSAqIG11KS50b1N0cmluZygxMCkgKyAncHggJyArIHNldHRpbmdzLmZvbnRGYW1pbHk7XG5cbiAgICAgIC8vIEZpbGwgdGhlIHRleHQgaW50byB0aGUgZmNhbnZhcy5cbiAgICAgIC8vIFhYWDogV2UgY2Fubm90IGJlY2F1c2UgdGV4dEJhc2VsaW5lID0gJ3RvcCcgaGVyZSBiZWNhdXNlXG4gICAgICAvLyBGaXJlZm94IGFuZCBDaHJvbWUgdXNlcyBkaWZmZXJlbnQgZGVmYXVsdCBsaW5lLWhlaWdodCBmb3IgY2FudmFzLlxuICAgICAgLy8gUGxlYXNlIHJlYWQgaHR0cHM6Ly9idWd6aWwubGEvNzM3ODUyI2M2LlxuICAgICAgLy8gSGVyZSwgd2UgdXNlIHRleHRCYXNlbGluZSA9ICdtaWRkbGUnIGFuZCBkcmF3IHRoZSB0ZXh0IGF0IGV4YWN0bHlcbiAgICAgIC8vIDAuNSAqIGZvbnRTaXplIGxvd2VyLlxuICAgICAgZmN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gICAgICBmY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgZmN0eC5maWxsVGV4dCh3b3JkLCBmaWxsVGV4dE9mZnNldFggKiBtdSxcbiAgICAgICAgICAgICAgICAgICAgKGZpbGxUZXh0T2Zmc2V0WSArIGZvbnRTaXplICogMC41KSAqIG11KTtcblxuICAgICAgLy8gR2V0IHRoZSBwaXhlbHMgb2YgdGhlIHRleHRcbiAgICAgIHZhciBpbWFnZURhdGEgPSBmY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xuXG4gICAgICBpZiAoZXhjZWVkVGltZSgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgIC8vIERyYXcgdGhlIGJveCBvZiB0aGUgb3JpZ2luYWwgZXN0aW1hdGlvblxuICAgICAgICBmY3R4LnN0cm9rZVJlY3QoZmlsbFRleHRPZmZzZXRYICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsVGV4dE9mZnNldFksIGZ3ICogbXUsIGZoICogbXUpO1xuICAgICAgICBmY3R4LnJlc3RvcmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVhZCB0aGUgcGl4ZWxzIGFuZCBzYXZlIHRoZSBpbmZvcm1hdGlvbiB0byB0aGUgb2NjdXBpZWQgYXJyYXlcbiAgICAgIHZhciBvY2N1cGllZCA9IFtdO1xuICAgICAgdmFyIGd4ID0gY2d3LCBneSwgeCwgeTtcbiAgICAgIHZhciBib3VuZHMgPSBbY2doIC8gMiwgY2d3IC8gMiwgY2doIC8gMiwgY2d3IC8gMl07XG4gICAgICB3aGlsZSAoZ3gtLSkge1xuICAgICAgICBneSA9IGNnaDtcbiAgICAgICAgd2hpbGUgKGd5LS0pIHtcbiAgICAgICAgICB5ID0gZztcbiAgICAgICAgICBzaW5nbGVHcmlkTG9vcDoge1xuICAgICAgICAgICAgd2hpbGUgKHktLSkge1xuICAgICAgICAgICAgICB4ID0gZztcbiAgICAgICAgICAgICAgd2hpbGUgKHgtLSkge1xuICAgICAgICAgICAgICAgIGlmIChpbWFnZURhdGFbKChneSAqIGcgKyB5KSAqIHdpZHRoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZ3ggKiBnICsgeCkpICogNCArIDNdKSB7XG4gICAgICAgICAgICAgICAgICBvY2N1cGllZC5wdXNoKFtneCwgZ3ldKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKGd4IDwgYm91bmRzWzNdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1szXSA9IGd4O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGd4ID4gYm91bmRzWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1sxXSA9IGd4O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGd5IDwgYm91bmRzWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1swXSA9IGd5O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGd5ID4gYm91bmRzWzJdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1syXSA9IGd5O1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoZGVidWcpIHtcbiAgICAgICAgICAgICAgICAgICAgZmN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsIDAsIDAsIDAuNSknO1xuICAgICAgICAgICAgICAgICAgICBmY3R4LmZpbGxSZWN0KGd4ICogZywgZ3kgKiBnLCBnIC0gMC41LCBnIC0gMC41KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJyZWFrIHNpbmdsZUdyaWRMb29wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgICAgICAgIGZjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMjU1LCAwLjUpJztcbiAgICAgICAgICAgICAgZmN0eC5maWxsUmVjdChneCAqIGcsIGd5ICogZywgZyAtIDAuNSwgZyAtIDAuNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWJ1Zykge1xuICAgICAgICBmY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDI1NSwgMCwgMC41KSc7XG4gICAgICAgIGZjdHguZmlsbFJlY3QoYm91bmRzWzNdICogZyxcbiAgICAgICAgICAgICAgICAgICAgICBib3VuZHNbMF0gKiBnLFxuICAgICAgICAgICAgICAgICAgICAgIChib3VuZHNbMV0gLSBib3VuZHNbM10gKyAxKSAqIGcsXG4gICAgICAgICAgICAgICAgICAgICAgKGJvdW5kc1syXSAtIGJvdW5kc1swXSArIDEpICogZyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gY3JlYXRlIHRoZSB0ZXh0IG9uIHRoZSByZWFsIGNhbnZhc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbXU6IG11LFxuICAgICAgICBvY2N1cGllZDogb2NjdXBpZWQsXG4gICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICBndzogY2d3LFxuICAgICAgICBnaDogY2doLFxuICAgICAgICBmaWxsVGV4dE9mZnNldFg6IGZpbGxUZXh0T2Zmc2V0WCxcbiAgICAgICAgZmlsbFRleHRPZmZzZXRZOiBmaWxsVGV4dE9mZnNldFksXG4gICAgICAgIGZpbGxUZXh0V2lkdGg6IGZ3LFxuICAgICAgICBmaWxsVGV4dEhlaWdodDogZmgsXG4gICAgICAgIGZvbnRTaXplOiBmb250U2l6ZVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyogRGV0ZXJtaW5lIGlmIHRoZXJlIGlzIHJvb20gYXZhaWxhYmxlIGluIHRoZSBnaXZlbiBkaW1lbnNpb24gKi9cbiAgICB2YXIgY2FuRml0VGV4dCA9IGZ1bmN0aW9uIGNhbkZpdFRleHQoZ3gsIGd5LCBndywgZ2gsIG9jY3VwaWVkKSB7XG4gICAgICAvLyBHbyB0aHJvdWdoIHRoZSBvY2N1cGllZCBwb2ludHMsXG4gICAgICAvLyByZXR1cm4gZmFsc2UgaWYgdGhlIHNwYWNlIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICB2YXIgaSA9IG9jY3VwaWVkLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdmFyIHB4ID0gZ3ggKyBvY2N1cGllZFtpXVswXTtcbiAgICAgICAgdmFyIHB5ID0gZ3kgKyBvY2N1cGllZFtpXVsxXTtcblxuICAgICAgICBpZiAocHggPj0gbmd4IHx8IHB5ID49IG5neSB8fCBweCA8IDAgfHwgcHkgPCAwKSB7XG4gICAgICAgICAgaWYgKCFzZXR0aW5ncy5kcmF3T3V0T2ZCb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ3JpZFtweF1bcHldKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyogQWN0dWFsbHkgZHJhdyB0aGUgdGV4dCBvbiB0aGUgZ3JpZCAqL1xuICAgIHZhciBkcmF3VGV4dCA9IGZ1bmN0aW9uIGRyYXdUZXh0KGd4LCBneSwgaW5mbywgd29yZCwgd2VpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlLCB0aGV0YSwgcm90YXRlRGVnLCBhdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBmb250U2l6ZSA9IGluZm8uZm9udFNpemU7XG4gICAgICB2YXIgY29sb3I7XG4gICAgICBpZiAoZ2V0VGV4dENvbG9yKSB7XG4gICAgICAgIGNvbG9yID0gZ2V0VGV4dENvbG9yKHdvcmQsIHdlaWdodCwgZm9udFNpemUsIGRpc3RhbmNlLCB0aGV0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xvciA9IHNldHRpbmdzLmNvbG9yO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgZm9udFdlaWdodCB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZXQgY3R4LmZvbnQgYW5kIGZvbnQgc3R5bGUgcnVsZVxuICAgICAgdmFyIGZvbnRXZWlnaHQ7XG4gICAgICBpZiAoZ2V0VGV4dEZvbnRXZWlnaHQpIHtcbiAgICAgICAgZm9udFdlaWdodCA9IGdldFRleHRGb250V2VpZ2h0KHdvcmQsIHdlaWdodCwgZm9udFNpemUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9udFdlaWdodCA9IHNldHRpbmdzLmZvbnRXZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBjbGFzc2VzO1xuICAgICAgaWYgKGdldFRleHRDbGFzc2VzKSB7XG4gICAgICAgIGNsYXNzZXMgPSBnZXRUZXh0Q2xhc3Nlcyh3b3JkLCB3ZWlnaHQsIGZvbnRTaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsYXNzZXMgPSBzZXR0aW5ncy5jbGFzc2VzO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGltZW5zaW9uO1xuICAgICAgdmFyIGJvdW5kcyA9IGluZm8uYm91bmRzO1xuICAgICAgZGltZW5zaW9uID0ge1xuICAgICAgICB4OiAoZ3ggKyBib3VuZHNbM10pICogZyxcbiAgICAgICAgeTogKGd5ICsgYm91bmRzWzBdKSAqIGcsXG4gICAgICAgIHc6IChib3VuZHNbMV0gLSBib3VuZHNbM10gKyAxKSAqIGcsXG4gICAgICAgIGg6IChib3VuZHNbMl0gLSBib3VuZHNbMF0gKyAxKSAqIGdcbiAgICAgIH07XG5cbiAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKGVsLmdldENvbnRleHQpIHtcbiAgICAgICAgICB2YXIgY3R4ID0gZWwuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICB2YXIgbXUgPSBpbmZvLm11O1xuXG4gICAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCBzdGF0ZSBiZWZvcmUgbWVzc2luZyBpdFxuICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgY3R4LnNjYWxlKDEgLyBtdSwgMSAvIG11KTtcblxuICAgICAgICAgIGN0eC5mb250ID0gZm9udFdlaWdodCArICcgJyArXG4gICAgICAgICAgICAgICAgICAgICAoZm9udFNpemUgKiBtdSkudG9TdHJpbmcoMTApICsgJ3B4ICcgKyBzZXR0aW5ncy5mb250RmFtaWx5O1xuICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcblxuICAgICAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgY2FudmFzIHBvc2l0aW9uIHRvIHRoZSBvcmlnaW4gY29vcmRpbmF0ZSBvZiB3aGVyZVxuICAgICAgICAgIC8vIHRoZSB0ZXh0IHNob3VsZCBiZSBwdXQuXG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSgoZ3ggKyBpbmZvLmd3IC8gMikgKiBnICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICAoZ3kgKyBpbmZvLmdoIC8gMikgKiBnICogbXUpO1xuXG4gICAgICAgICAgaWYgKHJvdGF0ZURlZyAhPT0gMCkge1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSgtIHJvdGF0ZURlZyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRmluYWxseSwgZmlsbCB0aGUgdGV4dC5cblxuICAgICAgICAgIC8vIFhYWDogV2UgY2Fubm90IGJlY2F1c2UgdGV4dEJhc2VsaW5lID0gJ3RvcCcgaGVyZSBiZWNhdXNlXG4gICAgICAgICAgLy8gRmlyZWZveCBhbmQgQ2hyb21lIHVzZXMgZGlmZmVyZW50IGRlZmF1bHQgbGluZS1oZWlnaHQgZm9yIGNhbnZhcy5cbiAgICAgICAgICAvLyBQbGVhc2UgcmVhZCBodHRwczovL2J1Z3ppbC5sYS83Mzc4NTIjYzYuXG4gICAgICAgICAgLy8gSGVyZSwgd2UgdXNlIHRleHRCYXNlbGluZSA9ICdtaWRkbGUnIGFuZCBkcmF3IHRoZSB0ZXh0IGF0IGV4YWN0bHlcbiAgICAgICAgICAvLyAwLjUgKiBmb250U2l6ZSBsb3dlci5cbiAgICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgY3R4LmZpbGxUZXh0KHdvcmQsIGluZm8uZmlsbFRleHRPZmZzZXRYICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbmZvLmZpbGxUZXh0T2Zmc2V0WSArIGZvbnRTaXplICogMC41KSAqIG11KTtcblxuICAgICAgICAgIC8vIFRoZSBiZWxvdyBib3ggaXMgYWx3YXlzIG1hdGNoZXMgaG93IDxzcGFuPnMgYXJlIHBvc2l0aW9uZWRcbiAgICAgICAgICAvKiBjdHguc3Ryb2tlUmVjdChpbmZvLmZpbGxUZXh0T2Zmc2V0WCwgaW5mby5maWxsVGV4dE9mZnNldFksXG4gICAgICAgICAgICBpbmZvLmZpbGxUZXh0V2lkdGgsIGluZm8uZmlsbFRleHRIZWlnaHQpOyAqL1xuXG4gICAgICAgICAgLy8gUmVzdG9yZSB0aGUgc3RhdGUuXG4gICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBkcmF3VGV4dCBvbiBESVYgZWxlbWVudFxuICAgICAgICAgIHZhciBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgIHZhciB0cmFuc2Zvcm1SdWxlID0gJyc7XG4gICAgICAgICAgdHJhbnNmb3JtUnVsZSA9ICdyb3RhdGUoJyArICgtIHJvdGF0ZURlZyAvIE1hdGguUEkgKiAxODApICsgJ2RlZykgJztcbiAgICAgICAgICBpZiAoaW5mby5tdSAhPT0gMSkge1xuICAgICAgICAgICAgdHJhbnNmb3JtUnVsZSArPVxuICAgICAgICAgICAgICAndHJhbnNsYXRlWCgtJyArIChpbmZvLmZpbGxUZXh0V2lkdGggLyA0KSArICdweCkgJyArXG4gICAgICAgICAgICAgICdzY2FsZSgnICsgKDEgLyBpbmZvLm11KSArICcpJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHN0eWxlUnVsZXMgPSB7XG4gICAgICAgICAgICAncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snLFxuICAgICAgICAgICAgJ2ZvbnQnOiBmb250V2VpZ2h0ICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgKGZvbnRTaXplICogaW5mby5tdSkgKyAncHggJyArIHNldHRpbmdzLmZvbnRGYW1pbHksXG4gICAgICAgICAgICAnbGVmdCc6ICgoZ3ggKyBpbmZvLmd3IC8gMikgKiBnICsgaW5mby5maWxsVGV4dE9mZnNldFgpICsgJ3B4JyxcbiAgICAgICAgICAgICd0b3AnOiAoKGd5ICsgaW5mby5naCAvIDIpICogZyArIGluZm8uZmlsbFRleHRPZmZzZXRZKSArICdweCcsXG4gICAgICAgICAgICAnd2lkdGgnOiBpbmZvLmZpbGxUZXh0V2lkdGggKyAncHgnLFxuICAgICAgICAgICAgJ2hlaWdodCc6IGluZm8uZmlsbFRleHRIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgJ2xpbmVIZWlnaHQnOiBmb250U2l6ZSArICdweCcsXG4gICAgICAgICAgICAnd2hpdGVTcGFjZSc6ICdub3dyYXAnLFxuICAgICAgICAgICAgJ3RyYW5zZm9ybSc6IHRyYW5zZm9ybVJ1bGUsXG4gICAgICAgICAgICAnd2Via2l0VHJhbnNmb3JtJzogdHJhbnNmb3JtUnVsZSxcbiAgICAgICAgICAgICdtc1RyYW5zZm9ybSc6IHRyYW5zZm9ybVJ1bGUsXG4gICAgICAgICAgICAndHJhbnNmb3JtT3JpZ2luJzogJzUwJSA0MCUnLFxuICAgICAgICAgICAgJ3dlYmtpdFRyYW5zZm9ybU9yaWdpbic6ICc1MCUgNDAlJyxcbiAgICAgICAgICAgICdtc1RyYW5zZm9ybU9yaWdpbic6ICc1MCUgNDAlJ1xuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKGNvbG9yKSB7XG4gICAgICAgICAgICBzdHlsZVJ1bGVzLmNvbG9yID0gY29sb3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNwYW4udGV4dENvbnRlbnQgPSB3b3JkO1xuICAgICAgICAgIGZvciAodmFyIGNzc1Byb3AgaW4gc3R5bGVSdWxlcykge1xuICAgICAgICAgICAgc3Bhbi5zdHlsZVtjc3NQcm9wXSA9IHN0eWxlUnVsZXNbY3NzUHJvcF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyaWJ1dGUgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIGF0dHJpYnV0ZXNbYXR0cmlidXRlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgICAgICBzcGFuLmNsYXNzTmFtZSArPSBjbGFzc2VzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZChzcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qIEhlbHAgZnVuY3Rpb24gdG8gdXBkYXRlR3JpZCAqL1xuICAgIHZhciBmaWxsR3JpZEF0ID0gZnVuY3Rpb24gZmlsbEdyaWRBdCh4LCB5LCBkcmF3TWFzaywgZGltZW5zaW9uLCBpdGVtKSB7XG4gICAgICBpZiAoeCA+PSBuZ3ggfHwgeSA+PSBuZ3kgfHwgeCA8IDAgfHwgeSA8IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBncmlkW3hdW3ldID0gZmFsc2U7XG5cbiAgICAgIGlmIChkcmF3TWFzaykge1xuICAgICAgICB2YXIgY3R4ID0gZWxlbWVudHNbMF0uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LmZpbGxSZWN0KHggKiBnLCB5ICogZywgbWFza1JlY3RXaWR0aCwgbWFza1JlY3RXaWR0aCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnRlcmFjdGl2ZSkge1xuICAgICAgICBpbmZvR3JpZFt4XVt5XSA9IHsgaXRlbTogaXRlbSwgZGltZW5zaW9uOiBkaW1lbnNpb24gfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogVXBkYXRlIHRoZSBmaWxsaW5nIGluZm9ybWF0aW9uIG9mIHRoZSBnaXZlbiBzcGFjZSB3aXRoIG9jY3VwaWVkIHBvaW50cy5cbiAgICAgICBEcmF3IHRoZSBtYXNrIG9uIHRoZSBjYW52YXMgaWYgbmVjZXNzYXJ5LiAqL1xuICAgIHZhciB1cGRhdGVHcmlkID0gZnVuY3Rpb24gdXBkYXRlR3JpZChneCwgZ3ksIGd3LCBnaCwgaW5mbywgaXRlbSkge1xuICAgICAgdmFyIG9jY3VwaWVkID0gaW5mby5vY2N1cGllZDtcbiAgICAgIHZhciBkcmF3TWFzayA9IHNldHRpbmdzLmRyYXdNYXNrO1xuICAgICAgdmFyIGN0eDtcbiAgICAgIGlmIChkcmF3TWFzaykge1xuICAgICAgICBjdHggPSBlbGVtZW50c1swXS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gc2V0dGluZ3MubWFza0NvbG9yO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGltZW5zaW9uO1xuICAgICAgaWYgKGludGVyYWN0aXZlKSB7XG4gICAgICAgIHZhciBib3VuZHMgPSBpbmZvLmJvdW5kcztcbiAgICAgICAgZGltZW5zaW9uID0ge1xuICAgICAgICAgIHg6IChneCArIGJvdW5kc1szXSkgKiBnLFxuICAgICAgICAgIHk6IChneSArIGJvdW5kc1swXSkgKiBnLFxuICAgICAgICAgIHc6IChib3VuZHNbMV0gLSBib3VuZHNbM10gKyAxKSAqIGcsXG4gICAgICAgICAgaDogKGJvdW5kc1syXSAtIGJvdW5kc1swXSArIDEpICogZ1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgaSA9IG9jY3VwaWVkLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdmFyIHB4ID0gZ3ggKyBvY2N1cGllZFtpXVswXTtcbiAgICAgICAgdmFyIHB5ID0gZ3kgKyBvY2N1cGllZFtpXVsxXTtcblxuICAgICAgICBpZiAocHggPj0gbmd4IHx8IHB5ID49IG5neSB8fCBweCA8IDAgfHwgcHkgPCAwKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBmaWxsR3JpZEF0KHB4LCBweSwgZHJhd01hc2ssIGRpbWVuc2lvbiwgaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkcmF3TWFzaykge1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBwdXRXb3JkKCkgcHJvY2Vzc2VzIGVhY2ggaXRlbSBvbiB0aGUgbGlzdCxcbiAgICAgICBjYWxjdWxhdGUgaXQncyBzaXplIGFuZCBkZXRlcm1pbmUgaXQncyBwb3NpdGlvbiwgYW5kIGFjdHVhbGx5XG4gICAgICAgcHV0IGl0IG9uIHRoZSBjYW52YXMuICovXG4gICAgdmFyIHB1dFdvcmQgPSBmdW5jdGlvbiBwdXRXb3JkKGl0ZW0pIHtcbiAgICAgIHZhciB3b3JkLCB3ZWlnaHQsIGF0dHJpYnV0ZXM7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgICAgICB3b3JkID0gaXRlbVswXTtcbiAgICAgICAgd2VpZ2h0ID0gaXRlbVsxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdvcmQgPSBpdGVtLndvcmQ7XG4gICAgICAgIHdlaWdodCA9IGl0ZW0ud2VpZ2h0O1xuICAgICAgICBhdHRyaWJ1dGVzID0gaXRlbS5hdHRyaWJ1dGVzO1xuICAgICAgfVxuICAgICAgdmFyIHJvdGF0ZURlZyA9IGdldFJvdGF0ZURlZygpO1xuXG4gICAgICAvLyBnZXQgaW5mbyBuZWVkZWQgdG8gcHV0IHRoZSB0ZXh0IG9udG8gdGhlIGNhbnZhc1xuICAgICAgdmFyIGluZm8gPSBnZXRUZXh0SW5mbyh3b3JkLCB3ZWlnaHQsIHJvdGF0ZURlZyk7XG5cbiAgICAgIC8vIG5vdCBnZXR0aW5nIHRoZSBpbmZvIG1lYW5zIHdlIHNob3VsZG4ndCBiZSBkcmF3aW5nIHRoaXMgb25lLlxuICAgICAgaWYgKCFpbmZvKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4Y2VlZFRpbWUoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGRyYXdPdXRPZkJvdW5kIGlzIHNldCB0byBmYWxzZSxcbiAgICAgIC8vIHNraXAgdGhlIGxvb3AgaWYgd2UgaGF2ZSBhbHJlYWR5IGtub3cgdGhlIGJvdW5kaW5nIGJveCBvZlxuICAgICAgLy8gd29yZCBpcyBsYXJnZXIgdGhhbiB0aGUgY2FudmFzLlxuICAgICAgaWYgKCFzZXR0aW5ncy5kcmF3T3V0T2ZCb3VuZCkge1xuICAgICAgICB2YXIgYm91bmRzID0gaW5mby5ib3VuZHM7XG4gICAgICAgIGlmICgoYm91bmRzWzFdIC0gYm91bmRzWzNdICsgMSkgPiBuZ3ggfHxcbiAgICAgICAgICAoYm91bmRzWzJdIC0gYm91bmRzWzBdICsgMSkgPiBuZ3kpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBwb3NpdGlvbiB0byBwdXQgdGhlIHRleHQgYnlcbiAgICAgIC8vIHN0YXJ0IGxvb2tpbmcgZm9yIHRoZSBuZWFyZXN0IHBvaW50c1xuICAgICAgdmFyIHIgPSBtYXhSYWRpdXMgKyAxO1xuXG4gICAgICB2YXIgdHJ5VG9QdXRXb3JkQXRQb2ludCA9IGZ1bmN0aW9uKGd4eSkge1xuICAgICAgICB2YXIgZ3ggPSBNYXRoLmZsb29yKGd4eVswXSAtIGluZm8uZ3cgLyAyKTtcbiAgICAgICAgdmFyIGd5ID0gTWF0aC5mbG9vcihneHlbMV0gLSBpbmZvLmdoIC8gMik7XG4gICAgICAgIHZhciBndyA9IGluZm8uZ3c7XG4gICAgICAgIHZhciBnaCA9IGluZm8uZ2g7XG5cbiAgICAgICAgLy8gSWYgd2UgY2Fubm90IGZpdCB0aGUgdGV4dCBhdCB0aGlzIHBvc2l0aW9uLCByZXR1cm4gZmFsc2VcbiAgICAgICAgLy8gYW5kIGdvIHRvIHRoZSBuZXh0IHBvc2l0aW9uLlxuICAgICAgICBpZiAoIWNhbkZpdFRleHQoZ3gsIGd5LCBndywgZ2gsIGluZm8ub2NjdXBpZWQpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWN0dWFsbHkgcHV0IHRoZSB0ZXh0IG9uIHRoZSBjYW52YXNcbiAgICAgICAgZHJhd1RleHQoZ3gsIGd5LCBpbmZvLCB3b3JkLCB3ZWlnaHQsXG4gICAgICAgICAgICAgICAgIChtYXhSYWRpdXMgLSByKSwgZ3h5WzJdLCByb3RhdGVEZWcsIGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIC8vIE1hcmsgdGhlIHNwYWNlcyBvbiB0aGUgZ3JpZCBhcyBmaWxsZWRcbiAgICAgICAgdXBkYXRlR3JpZChneCwgZ3ksIGd3LCBnaCwgaW5mbywgaXRlbSk7XG5cbiAgICAgICAgLy8gUmV0dXJuIHRydWUgc28gc29tZSgpIHdpbGwgc3RvcCBhbmQgYWxzbyByZXR1cm4gdHJ1ZS5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuXG4gICAgICB3aGlsZSAoci0tKSB7XG4gICAgICAgIHZhciBwb2ludHMgPSBnZXRQb2ludHNBdFJhZGl1cyhtYXhSYWRpdXMgLSByKTtcblxuICAgICAgICBpZiAoc2V0dGluZ3Muc2h1ZmZsZSkge1xuICAgICAgICAgIHBvaW50cyA9IFtdLmNvbmNhdChwb2ludHMpO1xuICAgICAgICAgIHNodWZmbGVBcnJheShwb2ludHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJ5IHRvIGZpdCB0aGUgd29yZHMgYnkgbG9va2luZyBhdCBlYWNoIHBvaW50LlxuICAgICAgICAvLyBhcnJheS5zb21lKCkgd2lsbCBzdG9wIGFuZCByZXR1cm4gdHJ1ZVxuICAgICAgICAvLyB3aGVuIHB1dFdvcmRBdFBvaW50KCkgcmV0dXJucyB0cnVlLlxuICAgICAgICAvLyBJZiBhbGwgdGhlIHBvaW50cyByZXR1cm5zIGZhbHNlLCBhcnJheS5zb21lKCkgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgdmFyIGRyYXduID0gcG9pbnRzLnNvbWUodHJ5VG9QdXRXb3JkQXRQb2ludCk7XG5cbiAgICAgICAgaWYgKGRyYXduKSB7XG4gICAgICAgICAgLy8gbGVhdmUgcHV0V29yZCgpIGFuZCByZXR1cm4gdHJ1ZVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc2V0dGluZ3Muc2hyaW5rVG9GaXQpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgICBpdGVtWzFdID0gaXRlbVsxXSAqIDMgLyA0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0ud2VpZ2h0ID0gaXRlbS53ZWlnaHQgKiAzIC8gNDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHV0V29yZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIC8vIHdlIHRyaWVkIGFsbCBkaXN0YW5jZXMgYnV0IHRleHQgd29uJ3QgZml0LCByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyogU2VuZCBET00gZXZlbnQgdG8gYWxsIGVsZW1lbnRzLiBXaWxsIHN0b3Agc2VuZGluZyBldmVudCBhbmQgcmV0dXJuXG4gICAgICAgaWYgdGhlIHByZXZpb3VzIG9uZSBpcyBjYW5jZWxlZCAoZm9yIGNhbmNlbGFibGUgZXZlbnRzKS4gKi9cbiAgICB2YXIgc2VuZEV2ZW50ID0gZnVuY3Rpb24gc2VuZEV2ZW50KHR5cGUsIGNhbmNlbGFibGUsIGRldGFpbHMpIHtcbiAgICAgIGlmIChjYW5jZWxhYmxlKSB7XG4gICAgICAgIHJldHVybiAhZWxlbWVudHMuc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XG4gICAgICAgICAgICBkZXRhaWw6IGRldGFpbHMgfHwge31cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gIWVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xuICAgICAgICAgICAgZGV0YWlsOiBkZXRhaWxzIHx8IHt9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBTdGFydCBkcmF3aW5nIG9uIGEgY2FudmFzICovXG4gICAgdmFyIHN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAvLyBGb3IgZGltZW5zaW9ucywgY2xlYXJDYW52YXMgZXRjLixcbiAgICAgIC8vIHdlIG9ubHkgY2FyZSBhYm91dCB0aGUgZmlyc3QgZWxlbWVudC5cbiAgICAgIHZhciBjYW52YXMgPSBlbGVtZW50c1swXTtcblxuICAgICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0KSB7XG4gICAgICAgIG5neCA9IE1hdGguY2VpbChjYW52YXMud2lkdGggLyBnKTtcbiAgICAgICAgbmd5ID0gTWF0aC5jZWlsKGNhbnZhcy5oZWlnaHQgLyBnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBuZ3ggPSBNYXRoLmNlaWwocmVjdC53aWR0aCAvIGcpO1xuICAgICAgICBuZ3kgPSBNYXRoLmNlaWwocmVjdC5oZWlnaHQgLyBnKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VuZGluZyBhIHdvcmRjbG91ZHN0YXJ0IGV2ZW50IHdoaWNoIGNhdXNlIHRoZSBwcmV2aW91cyBsb29wIHRvIHN0b3AuXG4gICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSBldmVudCBpcyBjYW5jZWxlZC5cbiAgICAgIGlmICghc2VuZEV2ZW50KCd3b3JkY2xvdWRzdGFydCcsIHRydWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBjZW50ZXIgb2YgdGhlIHdvcmQgY2xvdWRcbiAgICAgIGNlbnRlciA9IChzZXR0aW5ncy5vcmlnaW4pID9cbiAgICAgICAgW3NldHRpbmdzLm9yaWdpblswXS9nLCBzZXR0aW5ncy5vcmlnaW5bMV0vZ10gOlxuICAgICAgICBbbmd4IC8gMiwgbmd5IC8gMl07XG5cbiAgICAgIC8vIE1heGl1bSByYWRpdXMgdG8gbG9vayBmb3Igc3BhY2VcbiAgICAgIG1heFJhZGl1cyA9IE1hdGguZmxvb3IoTWF0aC5zcXJ0KG5neCAqIG5neCArIG5neSAqIG5neSkpO1xuXG4gICAgICAvKiBDbGVhciB0aGUgY2FudmFzIG9ubHkgaWYgdGhlIGNsZWFyQ2FudmFzIGlzIHNldCxcbiAgICAgICAgIGlmIG5vdCwgdXBkYXRlIHRoZSBncmlkIHRvIHRoZSBjdXJyZW50IGNhbnZhcyBzdGF0ZSAqL1xuICAgICAgZ3JpZCA9IFtdO1xuXG4gICAgICB2YXIgZ3gsIGd5LCBpO1xuICAgICAgaWYgKCFjYW52YXMuZ2V0Q29udGV4dCB8fCBzZXR0aW5ncy5jbGVhckNhbnZhcykge1xuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgaWYgKGVsLmdldENvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHNldHRpbmdzLmJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgbmd4ICogKGcgKyAxKSwgbmd5ICogKGcgKyAxKSk7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgbmd4ICogKGcgKyAxKSwgbmd5ICogKGcgKyAxKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgICAgICBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBzZXR0aW5ncy5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICAgICAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKiBmaWxsIHRoZSBncmlkIHdpdGggZW1wdHkgc3RhdGUgKi9cbiAgICAgICAgZ3ggPSBuZ3g7XG4gICAgICAgIHdoaWxlIChneC0tKSB7XG4gICAgICAgICAgZ3JpZFtneF0gPSBbXTtcbiAgICAgICAgICBneSA9IG5neTtcbiAgICAgICAgICB3aGlsZSAoZ3ktLSkge1xuICAgICAgICAgICAgZ3JpZFtneF1bZ3ldID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIERldGVybWluZSBiZ1BpeGVsIGJ5IGNyZWF0aW5nXG4gICAgICAgICAgIGFub3RoZXIgY2FudmFzIGFuZCBmaWxsIHRoZSBzcGVjaWZpZWQgYmFja2dyb3VuZCBjb2xvci4gKi9cbiAgICAgICAgdmFyIGJjdHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGJjdHguZmlsbFN0eWxlID0gc2V0dGluZ3MuYmFja2dyb3VuZENvbG9yO1xuICAgICAgICBiY3R4LmZpbGxSZWN0KDAsIDAsIDEsIDEpO1xuICAgICAgICB2YXIgYmdQaXhlbCA9IGJjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIDEsIDEpLmRhdGE7XG5cbiAgICAgICAgLyogUmVhZCBiYWNrIHRoZSBwaXhlbHMgb2YgdGhlIGNhbnZhcyB3ZSBnb3QgdG8gdGVsbCB3aGljaCBwYXJ0IG9mIHRoZVxuICAgICAgICAgICBjYW52YXMgaXMgZW1wdHkuXG4gICAgICAgICAgIChubyBjbGVhckNhbnZhcyBvbmx5IHdvcmtzIHdpdGggYSBjYW52YXMsIG5vdCBkaXZzKSAqL1xuICAgICAgICB2YXIgaW1hZ2VEYXRhID1cbiAgICAgICAgICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5nZXRJbWFnZURhdGEoMCwgMCwgbmd4ICogZywgbmd5ICogZykuZGF0YTtcblxuICAgICAgICBneCA9IG5neDtcbiAgICAgICAgdmFyIHgsIHk7XG4gICAgICAgIHdoaWxlIChneC0tKSB7XG4gICAgICAgICAgZ3JpZFtneF0gPSBbXTtcbiAgICAgICAgICBneSA9IG5neTtcbiAgICAgICAgICB3aGlsZSAoZ3ktLSkge1xuICAgICAgICAgICAgeSA9IGc7XG4gICAgICAgICAgICBzaW5nbGVHcmlkTG9vcDogd2hpbGUgKHktLSkge1xuICAgICAgICAgICAgICB4ID0gZztcbiAgICAgICAgICAgICAgd2hpbGUgKHgtLSkge1xuICAgICAgICAgICAgICAgIGkgPSA0O1xuICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpbWFnZURhdGFbKChneSAqIGcgKyB5KSAqIG5neCAqIGcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGd4ICogZyArIHgpKSAqIDQgKyBpXSAhPT0gYmdQaXhlbFtpXSkge1xuICAgICAgICAgICAgICAgICAgICBncmlkW2d4XVtneV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgc2luZ2xlR3JpZExvb3A7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ3JpZFtneF1bZ3ldICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICBncmlkW2d4XVtneV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGltYWdlRGF0YSA9IGJjdHggPSBiZ1BpeGVsID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICAvLyBmaWxsIHRoZSBpbmZvR3JpZCB3aXRoIGVtcHR5IHN0YXRlIGlmIHdlIG5lZWQgaXRcbiAgICAgIGlmIChzZXR0aW5ncy5ob3ZlciB8fCBzZXR0aW5ncy5jbGljaykge1xuXG4gICAgICAgIGludGVyYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAvKiBmaWxsIHRoZSBncmlkIHdpdGggZW1wdHkgc3RhdGUgKi9cbiAgICAgICAgZ3ggPSBuZ3ggKyAxO1xuICAgICAgICB3aGlsZSAoZ3gtLSkge1xuICAgICAgICAgIGluZm9HcmlkW2d4XSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmhvdmVyKSB7XG4gICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHdvcmRjbG91ZGhvdmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jbGljaykge1xuICAgICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHdvcmRjbG91ZGNsaWNrKTtcbiAgICAgICAgICBjYW52YXMuc3R5bGUud2Via2l0VGFwSGlnaGxpZ2h0Q29sb3IgPSAncmdiYSgwLCAwLCAwLCAwKSc7XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignd29yZGNsb3Vkc3RhcnQnLCBmdW5jdGlvbiBzdG9wSW50ZXJhY3Rpb24oKSB7XG4gICAgICAgICAgY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dvcmRjbG91ZHN0YXJ0Jywgc3RvcEludGVyYWN0aW9uKTtcblxuICAgICAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB3b3JkY2xvdWRob3Zlcik7XG4gICAgICAgICAgY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgd29yZGNsb3VkY2xpY2spO1xuICAgICAgICAgIGhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpID0gMDtcbiAgICAgIHZhciBsb29waW5nRnVuY3Rpb24sIHN0b3BwaW5nRnVuY3Rpb247XG4gICAgICBpZiAoc2V0dGluZ3Mud2FpdCAhPT0gMCkge1xuICAgICAgICBsb29waW5nRnVuY3Rpb24gPSB3aW5kb3cuc2V0VGltZW91dDtcbiAgICAgICAgc3RvcHBpbmdGdW5jdGlvbiA9IHdpbmRvdy5jbGVhclRpbWVvdXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb29waW5nRnVuY3Rpb24gPSB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgICAgICBzdG9wcGluZ0Z1bmN0aW9uID0gd2luZG93LmNsZWFySW1tZWRpYXRlO1xuICAgICAgfVxuXG4gICAgICB2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciByZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfTtcblxuICAgICAgdmFyIGFub3RoZXJXb3JkQ2xvdWRTdGFydCA9IGZ1bmN0aW9uIGFub3RoZXJXb3JkQ2xvdWRTdGFydCgpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcignd29yZGNsb3Vkc3RhcnQnLCBhbm90aGVyV29yZENsb3VkU3RhcnQpO1xuICAgICAgICBzdG9wcGluZ0Z1bmN0aW9uKHRpbWVyKTtcbiAgICAgIH07XG5cbiAgICAgIGFkZEV2ZW50TGlzdGVuZXIoJ3dvcmRjbG91ZHN0YXJ0JywgYW5vdGhlcldvcmRDbG91ZFN0YXJ0KTtcblxuICAgICAgdmFyIHRpbWVyID0gbG9vcGluZ0Z1bmN0aW9uKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICAgIGlmIChpID49IHNldHRpbmdzLmxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgc3RvcHBpbmdGdW5jdGlvbih0aW1lcik7XG4gICAgICAgICAgc2VuZEV2ZW50KCd3b3JkY2xvdWRzdG9wJywgZmFsc2UpO1xuICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dvcmRjbG91ZHN0YXJ0JywgYW5vdGhlcldvcmRDbG91ZFN0YXJ0KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlc2NhcGVUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgdmFyIGRyYXduID0gcHV0V29yZChzZXR0aW5ncy5saXN0W2ldKTtcbiAgICAgICAgdmFyIGNhbmNlbGVkID0gIXNlbmRFdmVudCgnd29yZGNsb3VkZHJhd24nLCB0cnVlLCB7XG4gICAgICAgICAgaXRlbTogc2V0dGluZ3MubGlzdFtpXSwgZHJhd246IGRyYXduIH0pO1xuICAgICAgICBpZiAoZXhjZWVkVGltZSgpIHx8IGNhbmNlbGVkKSB7XG4gICAgICAgICAgc3RvcHBpbmdGdW5jdGlvbih0aW1lcik7XG4gICAgICAgICAgc2V0dGluZ3MuYWJvcnQoKTtcbiAgICAgICAgICBzZW5kRXZlbnQoJ3dvcmRjbG91ZGFib3J0JywgZmFsc2UpO1xuICAgICAgICAgIHNlbmRFdmVudCgnd29yZGNsb3Vkc3RvcCcsIGZhbHNlKTtcbiAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCd3b3JkY2xvdWRzdGFydCcsIGFub3RoZXJXb3JkQ2xvdWRTdGFydCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgICAgdGltZXIgPSBsb29waW5nRnVuY3Rpb24obG9vcCwgc2V0dGluZ3Mud2FpdCk7XG4gICAgICB9LCBzZXR0aW5ncy53YWl0KTtcbiAgICB9O1xuXG4gICAgLy8gQWxsIHNldCwgc3RhcnQgdGhlIGRyYXdpbmdcbiAgICBzdGFydCgpO1xuICB9O1xuXG4gIFdvcmRDbG91ZC5pc1N1cHBvcnRlZCA9IGlzU3VwcG9ydGVkO1xuICBXb3JkQ2xvdWQubWluRm9udFNpemUgPSBtaW5Gb250U2l6ZTtcblxuICBleHBvcnQgeyBXb3JkQ2xvdWQgfTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0FBU0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7RUFDeEIsTUFBTSxDQUFDLFlBQVksR0FBRyxDQUFDLFNBQVMsaUJBQWlCLEdBQUc7SUFDbEQsT0FBTyxNQUFNLENBQUMsY0FBYztJQUM1QixNQUFNLENBQUMsa0JBQWtCO0lBQ3pCLE1BQU0sQ0FBQyxlQUFlO0lBQ3RCLE1BQU0sQ0FBQyxhQUFhO0lBQ3BCLENBQUMsU0FBUyxtQkFBbUIsR0FBRztNQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtRQUNuRCxPQUFPLElBQUksQ0FBQztPQUNiOztNQUVELElBQUksU0FBUyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7TUFDNUIsSUFBSSxPQUFPLEdBQUcsc0JBQXNCLENBQUM7Ozs7O01BS3JDLElBQUksY0FBYyxHQUFHLFNBQVMsY0FBYyxDQUFDLFFBQVEsRUFBRTtRQUNyRCxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQzFCLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFD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
