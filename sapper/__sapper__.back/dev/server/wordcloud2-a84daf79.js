'use strict';

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

exports.WordCloud = WordCloud;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZGNsb3VkMi1hODRkYWY3OS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvd29yZGNsb3VkMi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIHdvcmRjbG91ZDIuanNcbiAqIGh0dHA6Ly90aW1kcmVhbS5vcmcvd29yZGNsb3VkMi5qcy9cbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSAtIDIwMTkgVGltIEd1YW4tdGluIENoaWVuIGFuZCBjb250cmlidXRvcnMuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuXG4vLyBzZXRJbW1lZGlhdGVcbmlmICghd2luZG93LnNldEltbWVkaWF0ZSkge1xuICB3aW5kb3cuc2V0SW1tZWRpYXRlID0gKGZ1bmN0aW9uIHNldHVwU2V0SW1tZWRpYXRlKCkge1xuICAgIHJldHVybiB3aW5kb3cubXNTZXRJbW1lZGlhdGUgfHxcbiAgICB3aW5kb3cud2Via2l0U2V0SW1tZWRpYXRlIHx8XG4gICAgd2luZG93Lm1velNldEltbWVkaWF0ZSB8fFxuICAgIHdpbmRvdy5vU2V0SW1tZWRpYXRlIHx8XG4gICAgKGZ1bmN0aW9uIHNldHVwU2V0WmVyb1RpbWVvdXQoKSB7XG4gICAgICBpZiAoIXdpbmRvdy5wb3N0TWVzc2FnZSB8fCAhd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxsYmFja3MgPSBbdW5kZWZpbmVkXTtcbiAgICAgIHZhciBtZXNzYWdlID0gJ3plcm8tdGltZW91dC1tZXNzYWdlJztcblxuICAgICAgLy8gTGlrZSBzZXRUaW1lb3V0LCBidXQgb25seSB0YWtlcyBhIGZ1bmN0aW9uIGFyZ3VtZW50LiAgVGhlcmUnc1xuICAgICAgLy8gbm8gdGltZSBhcmd1bWVudCAoYWx3YXlzIHplcm8pIGFuZCBubyBhcmd1bWVudHMgKHlvdSBoYXZlIHRvXG4gICAgICAvLyB1c2UgYSBjbG9zdXJlKS5cbiAgICAgIHZhciBzZXRaZXJvVGltZW91dCA9IGZ1bmN0aW9uIHNldFplcm9UaW1lb3V0KGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBpZCA9IGNhbGxiYWNrcy5sZW5ndGg7XG4gICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKG1lc3NhZ2UgKyBpZC50b1N0cmluZygzNiksICcqJyk7XG5cbiAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgfTtcblxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiBzZXRaZXJvVGltZW91dE1lc3NhZ2UoZXZ0KSB7XG4gICAgICAgIC8vIFNraXBwaW5nIGNoZWNraW5nIGV2ZW50IHNvdXJjZSwgcmV0YXJkZWQgSUUgY29uZnVzZWQgdGhpcyB3aW5kb3dcbiAgICAgICAgLy8gb2JqZWN0IHdpdGggYW5vdGhlciBpbiB0aGUgcHJlc2VuY2Ugb2YgaWZyYW1lXG4gICAgICAgIGlmICh0eXBlb2YgZXZ0LmRhdGEgIT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICBldnQuZGF0YS5zdWJzdHIoMCwgbWVzc2FnZS5sZW5ndGgpICE9PSBtZXNzYWdlLyogfHxcbiAgICAgICAgICAgIGV2dC5zb3VyY2UgIT09IHdpbmRvdyAqLykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2dC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB2YXIgaWQgPSBwYXJzZUludChldnQuZGF0YS5zdWJzdHIobWVzc2FnZS5sZW5ndGgpLCAzNik7XG4gICAgICAgIGlmICghY2FsbGJhY2tzW2lkXSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrc1tpZF0oKTtcbiAgICAgICAgY2FsbGJhY2tzW2lkXSA9IHVuZGVmaW5lZDtcbiAgICAgIH0sIHRydWUpO1xuXG4gICAgICAvKiBzcGVjaWZ5IGNsZWFySW1tZWRpYXRlKCkgaGVyZSBzaW5jZSB3ZSBuZWVkIHRoZSBzY29wZSAqL1xuICAgICAgd2luZG93LmNsZWFySW1tZWRpYXRlID0gZnVuY3Rpb24gY2xlYXJaZXJvVGltZW91dChpZCkge1xuICAgICAgICBpZiAoIWNhbGxiYWNrc1tpZF0pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFja3NbaWRdID0gdW5kZWZpbmVkO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHNldFplcm9UaW1lb3V0O1xuICAgIH0pKCkgfHxcbiAgICAvLyBmYWxsYmFja1xuICAgIGZ1bmN0aW9uIHNldEltbWVkaWF0ZUZhbGxiYWNrKGZuKSB7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbiAgfSkoKTtcbn1cblxuaWYgKCF3aW5kb3cuY2xlYXJJbW1lZGlhdGUpIHtcbiAgd2luZG93LmNsZWFySW1tZWRpYXRlID0gKGZ1bmN0aW9uIHNldHVwQ2xlYXJJbW1lZGlhdGUoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5tc0NsZWFySW1tZWRpYXRlIHx8XG4gICAgd2luZG93LndlYmtpdENsZWFySW1tZWRpYXRlIHx8XG4gICAgd2luZG93Lm1vekNsZWFySW1tZWRpYXRlIHx8XG4gICAgd2luZG93Lm9DbGVhckltbWVkaWF0ZSB8fFxuICAgIC8vIFwiY2xlYXJaZXJvVGltZW91dFwiIGlzIGltcGxlbWVudCBvbiB0aGUgcHJldmlvdXMgYmxvY2sgfHxcbiAgICAvLyBmYWxsYmFja1xuICAgIGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlRmFsbGJhY2sodGltZXIpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xuICAgIH07XG4gIH0pKCk7XG59XG5cblxuICAvLyBDaGVjayBpZiBXb3JkQ2xvdWQgY2FuIHJ1biBvbiB0aGlzIGJyb3dzZXJcbiAgdmFyIGlzU3VwcG9ydGVkID0gKGZ1bmN0aW9uIGlzU3VwcG9ydGVkKCkge1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBpZiAoIWNhbnZhcyB8fCAhY2FudmFzLmdldENvbnRleHQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgaWYgKCFjdHgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFjdHguZ2V0SW1hZ2VEYXRhKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghY3R4LmZpbGxUZXh0KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFBcnJheS5wcm90b3R5cGUuc29tZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LnByb3RvdHlwZS5wdXNoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH0oKSk7XG5cbiAgLy8gRmluZCBvdXQgaWYgdGhlIGJyb3dzZXIgaW1wb3NlIG1pbml1bSBmb250IHNpemUgYnlcbiAgLy8gZHJhd2luZyBzbWFsbCB0ZXh0cyBvbiBhIGNhbnZhcyBhbmQgbWVhc3VyZSBpdCdzIHdpZHRoLlxuICB2YXIgbWluRm9udFNpemUgPSAoZnVuY3Rpb24gZ2V0TWluRm9udFNpemUoKSB7XG4gICAgaWYgKCFpc1N1cHBvcnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBjdHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gc3RhcnQgZnJvbSAyMFxuICAgIHZhciBzaXplID0gMjA7XG5cbiAgICAvLyB0d28gc2l6ZXMgdG8gbWVhc3VyZVxuICAgIHZhciBoYW5XaWR0aCwgbVdpZHRoO1xuXG4gICAgd2hpbGUgKHNpemUpIHtcbiAgICAgIGN0eC5mb250ID0gc2l6ZS50b1N0cmluZygxMCkgKyAncHggc2Fucy1zZXJpZic7XG4gICAgICBpZiAoKGN0eC5tZWFzdXJlVGV4dCgnXFx1RkYzNycpLndpZHRoID09PSBoYW5XaWR0aCkgJiZcbiAgICAgICAgICAoY3R4Lm1lYXN1cmVUZXh0KCdtJykud2lkdGgpID09PSBtV2lkdGgpIHtcbiAgICAgICAgcmV0dXJuIChzaXplICsgMSk7XG4gICAgICB9XG5cbiAgICAgIGhhbldpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KCdcXHVGRjM3Jykud2lkdGg7XG4gICAgICBtV2lkdGggPSBjdHgubWVhc3VyZVRleHQoJ20nKS53aWR0aDtcblxuICAgICAgc2l6ZS0tO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9KSgpO1xuXG4gIC8vIEJhc2VkIG9uIGh0dHA6Ly9qc2Zyb21oZWxsLmNvbS9hcnJheS9zaHVmZmxlXG4gIHZhciBzaHVmZmxlQXJyYXkgPSBmdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyKSB7XG4gICAgZm9yICh2YXIgaiwgeCwgaSA9IGFyci5sZW5ndGg7IGk7XG4gICAgICBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSksXG4gICAgICB4ID0gYXJyWy0taV0sIGFycltpXSA9IGFycltqXSxcbiAgICAgIGFycltqXSA9IHgpIHt9XG4gICAgcmV0dXJuIGFycjtcbiAgfTtcblxuICB2YXIgV29yZENsb3VkID0gZnVuY3Rpb24gV29yZENsb3VkKGVsZW1lbnRzLCBvcHRpb25zKSB7XG4gICAgaWYgKCFpc1N1cHBvcnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghQXJyYXkuaXNBcnJheShlbGVtZW50cykpIHtcbiAgICAgIGVsZW1lbnRzID0gW2VsZW1lbnRzXTtcbiAgICB9XG5cbiAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsLCBpKSB7XG4gICAgICBpZiAodHlwZW9mIGVsID09PSAnc3RyaW5nJykge1xuICAgICAgICBlbGVtZW50c1tpXSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKTtcbiAgICAgICAgaWYgKCFlbGVtZW50c1tpXSkge1xuICAgICAgICAgIHRocm93ICdUaGUgZWxlbWVudCBpZCBzcGVjaWZpZWQgaXMgbm90IGZvdW5kLic7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWVsLnRhZ05hbWUgJiYgIWVsLmFwcGVuZENoaWxkKSB7XG4gICAgICAgIHRocm93ICdZb3UgbXVzdCBwYXNzIHZhbGlkIEhUTUwgZWxlbWVudHMsIG9yIElEIG9mIHRoZSBlbGVtZW50Lic7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiBEZWZhdWx0IHZhbHVlcyB0byBiZSBvdmVyd3JpdHRlbiBieSBvcHRpb25zIG9iamVjdCAqL1xuICAgIHZhciBzZXR0aW5ncyA9IHtcbiAgICAgIGxpc3Q6IFtdLFxuICAgICAgZm9udEZhbWlseTogJ1wiVHJlYnVjaGV0IE1TXCIsIFwiSGVpdGkgVENcIiwgXCLlvq7ou5/mraPpu5Hpq5RcIiwgJyArXG4gICAgICAgICAgICAgICAgICAnXCJBcmlhbCBVbmljb2RlIE1TXCIsIFwiRHJvaWQgRmFsbGJhY2sgU2Fuc1wiLCBzYW5zLXNlcmlmJyxcbiAgICAgIGZvbnRXZWlnaHQ6ICdub3JtYWwnLFxuICAgICAgY29sb3I6ICdyYW5kb20tZGFyaycsXG4gICAgICBtaW5TaXplOiAwLCAvLyAwIHRvIGRpc2FibGVcbiAgICAgIHdlaWdodEZhY3RvcjogMSxcbiAgICAgIGNsZWFyQ2FudmFzOiB0cnVlLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsICAvLyBvcGFxdWUgd2hpdGUgPSByZ2JhKDI1NSwgMjU1LCAyNTUsIDEpXG5cbiAgICAgIGdyaWRTaXplOiA4LFxuICAgICAgZHJhd091dE9mQm91bmQ6IGZhbHNlLFxuICAgICAgc2hyaW5rVG9GaXQ6IGZhbHNlLFxuICAgICAgb3JpZ2luOiBudWxsLFxuXG4gICAgICBkcmF3TWFzazogZmFsc2UsXG4gICAgICBtYXNrQ29sb3I6ICdyZ2JhKDI1NSwwLDAsMC4zKScsXG4gICAgICBtYXNrR2FwV2lkdGg6IDAuMyxcblxuICAgICAgd2FpdDogMCxcbiAgICAgIGFib3J0VGhyZXNob2xkOiAwLCAvLyBkaXNhYmxlZFxuICAgICAgYWJvcnQ6IGZ1bmN0aW9uIG5vb3AoKSB7fSxcblxuICAgICAgbWluUm90YXRpb246IC0gTWF0aC5QSSAvIDIsXG4gICAgICBtYXhSb3RhdGlvbjogTWF0aC5QSSAvIDIsXG4gICAgICByb3RhdGlvblN0ZXBzOiAwLFxuXG4gICAgICBzaHVmZmxlOiB0cnVlLFxuICAgICAgcm90YXRlUmF0aW86IDAuMSxcblxuICAgICAgc2hhcGU6ICdjaXJjbGUnLFxuICAgICAgZWxsaXB0aWNpdHk6IDAuNjUsXG5cbiAgICAgIGNsYXNzZXM6IG51bGwsXG5cbiAgICAgIGhvdmVyOiBudWxsLFxuICAgICAgY2xpY2s6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIGlmIChrZXkgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgICBzZXR0aW5nc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogQ29udmVydCB3ZWlnaHRGYWN0b3IgaW50byBhIGZ1bmN0aW9uICovXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy53ZWlnaHRGYWN0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBmYWN0b3IgPSBzZXR0aW5ncy53ZWlnaHRGYWN0b3I7XG4gICAgICBzZXR0aW5ncy53ZWlnaHRGYWN0b3IgPSBmdW5jdGlvbiB3ZWlnaHRGYWN0b3IocHQpIHtcbiAgICAgICAgcmV0dXJuIHB0ICogZmFjdG9yOyAvL2luIHB4XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qIENvbnZlcnQgc2hhcGUgaW50byBhIGZ1bmN0aW9uICovXG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5zaGFwZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgc3dpdGNoIChzZXR0aW5ncy5zaGFwZSkge1xuICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy8gJ2NpcmNsZScgaXMgdGhlIGRlZmF1bHQgYW5kIGEgc2hvcnRjdXQgaW4gdGhlIGNvZGUgbG9vcC5cbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9ICdjaXJjbGUnO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2NhcmRpb2lkJzpcbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9IGZ1bmN0aW9uIHNoYXBlQ2FyZGlvaWQodGhldGEpIHtcbiAgICAgICAgICAgIHJldHVybiAxIC0gTWF0aC5zaW4odGhldGEpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgLypcbiAgICAgICAgVG8gd29yayBvdXQgYW4gWC1nb24sIG9uZSBoYXMgdG8gY2FsY3VsYXRlIFwibVwiLFxuICAgICAgICB3aGVyZSAxLyhjb3MoMipQSS9YKSttKnNpbigyKlBJL1gpKSA9IDEvKGNvcygwKSttKnNpbigwKSlcbiAgICAgICAgaHR0cDovL3d3dy53b2xmcmFtYWxwaGEuY29tL2lucHV0Lz9pPTElMkYlMjhjb3MlMjgyKlBJJTJGWCUyOSUyQm0qc2luJTI4XG4gICAgICAgIDIqUEklMkZYJTI5JTI5KyUzRCsxJTJGJTI4Y29zJTI4MCUyOSUyQm0qc2luJTI4MCUyOSUyOVxuICAgICAgICBDb3B5IHRoZSBzb2x1dGlvbiBpbnRvIHBvbGFyIGVxdWF0aW9uIHIgPSAxLyhjb3ModCcpICsgbSpzaW4odCcpKVxuICAgICAgICB3aGVyZSB0JyBlcXVhbHMgdG8gbW9kKHQsIDJQSS9YKTtcbiAgICAgICAgKi9cblxuICAgICAgICBjYXNlICdkaWFtb25kJzpcbiAgICAgICAgICAvLyBodHRwOi8vd3d3LndvbGZyYW1hbHBoYS5jb20vaW5wdXQvP2k9cGxvdCtyKyUzRCsxJTJGJTI4Y29zJTI4bW9kK1xuICAgICAgICAgIC8vICUyOHQlMkMrUEklMkYyJTI5JTI5JTJCc2luJTI4bW9kKyUyOHQlMkMrUEklMkYyJTI5JTI5JTI5JTJDK3QrJTNEXG4gICAgICAgICAgLy8gKzArLi4rMipQSVxuICAgICAgICAgIHNldHRpbmdzLnNoYXBlID0gZnVuY3Rpb24gc2hhcGVTcXVhcmUodGhldGEpIHtcbiAgICAgICAgICAgIHZhciB0aGV0YVByaW1lID0gdGhldGEgJSAoMiAqIE1hdGguUEkgLyA0KTtcbiAgICAgICAgICAgIHJldHVybiAxIC8gKE1hdGguY29zKHRoZXRhUHJpbWUpICsgTWF0aC5zaW4odGhldGFQcmltZSkpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICAvLyBodHRwOi8vd3d3LndvbGZyYW1hbHBoYS5jb20vaW5wdXQvP2k9cGxvdCtyKyUzRCttaW4oMSUyRmFicyhjb3ModFxuICAgICAgICAgIC8vICkpLDElMkZhYnMoc2luKHQpKSkpLCt0KyUzRCswKy4uKzIqUElcbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9IGZ1bmN0aW9uIHNoYXBlU3F1YXJlKHRoZXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oXG4gICAgICAgICAgICAgIDEgLyBNYXRoLmFicyhNYXRoLmNvcyh0aGV0YSkpLFxuICAgICAgICAgICAgICAxIC8gTWF0aC5hYnMoTWF0aC5zaW4odGhldGEpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlLWZvcndhcmQnOlxuICAgICAgICAgIC8vIGh0dHA6Ly93d3cud29sZnJhbWFscGhhLmNvbS9pbnB1dC8/aT1wbG90K3IrJTNEKzElMkYlMjhjb3MlMjhtb2QrXG4gICAgICAgICAgLy8gJTI4dCUyQysyKlBJJTJGMyUyOSUyOSUyQnNxcnQlMjgzJTI5c2luJTI4bW9kKyUyOHQlMkMrMipQSSUyRjMlMjlcbiAgICAgICAgICAvLyAlMjklMjklMkMrdCslM0QrMCsuLisyKlBJXG4gICAgICAgICAgc2V0dGluZ3Muc2hhcGUgPSBmdW5jdGlvbiBzaGFwZVRyaWFuZ2xlKHRoZXRhKSB7XG4gICAgICAgICAgICB2YXIgdGhldGFQcmltZSA9IHRoZXRhICUgKDIgKiBNYXRoLlBJIC8gMyk7XG4gICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcyh0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnNxcnQoMykgKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0cmlhbmdsZSc6XG4gICAgICAgIGNhc2UgJ3RyaWFuZ2xlLXVwcmlnaHQnOlxuICAgICAgICAgIHNldHRpbmdzLnNoYXBlID0gZnVuY3Rpb24gc2hhcGVUcmlhbmdsZSh0aGV0YSkge1xuICAgICAgICAgICAgdmFyIHRoZXRhUHJpbWUgPSAodGhldGEgKyBNYXRoLlBJICogMyAvIDIpICUgKDIgKiBNYXRoLlBJIC8gMyk7XG4gICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcyh0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnNxcnQoMykgKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwZW50YWdvbic6XG4gICAgICAgICAgc2V0dGluZ3Muc2hhcGUgPSBmdW5jdGlvbiBzaGFwZVBlbnRhZ29uKHRoZXRhKSB7XG4gICAgICAgICAgICB2YXIgdGhldGFQcmltZSA9ICh0aGV0YSArIDAuOTU1KSAlICgyICogTWF0aC5QSSAvIDUpO1xuICAgICAgICAgICAgcmV0dXJuIDEgLyAoTWF0aC5jb3ModGhldGFQcmltZSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgMC43MjY1NDMgKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzdGFyJzpcbiAgICAgICAgICBzZXR0aW5ncy5zaGFwZSA9IGZ1bmN0aW9uIHNoYXBlU3Rhcih0aGV0YSkge1xuICAgICAgICAgICAgdmFyIHRoZXRhUHJpbWUgPSAodGhldGEgKyAwLjk1NSkgJSAoMiAqIE1hdGguUEkgLyAxMCk7XG4gICAgICAgICAgICBpZiAoKHRoZXRhICsgMC45NTUpICUgKDIgKiBNYXRoLlBJIC8gNSkgLSAoMiAqIE1hdGguUEkgLyAxMCkgPj0gMCkge1xuICAgICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcygoMiAqIE1hdGguUEkgLyAxMCkgLSB0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDMuMDc3NjggKiBNYXRoLnNpbigoMiAqIE1hdGguUEkgLyAxMCkgLSB0aGV0YVByaW1lKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gMSAvIChNYXRoLmNvcyh0aGV0YVByaW1lKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDMuMDc3NjggKiBNYXRoLnNpbih0aGV0YVByaW1lKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBNYWtlIHN1cmUgZ3JpZFNpemUgaXMgYSB3aG9sZSBudW1iZXIgYW5kIGlzIG5vdCBzbWFsbGVyIHRoYW4gNHB4ICovXG4gICAgc2V0dGluZ3MuZ3JpZFNpemUgPSBNYXRoLm1heChNYXRoLmZsb29yKHNldHRpbmdzLmdyaWRTaXplKSwgNCk7XG5cbiAgICAvKiBzaG9ydGhhbmQgKi9cbiAgICB2YXIgZyA9IHNldHRpbmdzLmdyaWRTaXplO1xuICAgIHZhciBtYXNrUmVjdFdpZHRoID0gZyAtIHNldHRpbmdzLm1hc2tHYXBXaWR0aDtcblxuICAgIC8qIG5vcm1hbGl6ZSByb3RhdGlvbiBzZXR0aW5ncyAqL1xuICAgIHZhciByb3RhdGlvblJhbmdlID0gTWF0aC5hYnMoc2V0dGluZ3MubWF4Um90YXRpb24gLSBzZXR0aW5ncy5taW5Sb3RhdGlvbik7XG4gICAgdmFyIHJvdGF0aW9uU3RlcHMgPSBNYXRoLmFicyhNYXRoLmZsb29yKHNldHRpbmdzLnJvdGF0aW9uU3RlcHMpKTtcbiAgICB2YXIgbWluUm90YXRpb24gPSBNYXRoLm1pbihzZXR0aW5ncy5tYXhSb3RhdGlvbiwgc2V0dGluZ3MubWluUm90YXRpb24pO1xuXG4gICAgLyogaW5mb3JtYXRpb24vb2JqZWN0IGF2YWlsYWJsZSB0byBhbGwgZnVuY3Rpb25zLCBzZXQgd2hlbiBzdGFydCgpICovXG4gICAgdmFyIGdyaWQsIC8vIDJkIGFycmF5IGNvbnRhaW5pbmcgZmlsbGluZyBpbmZvcm1hdGlvblxuICAgICAgbmd4LCBuZ3ksIC8vIHdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIGdyaWRcbiAgICAgIGNlbnRlciwgLy8gcG9zaXRpb24gb2YgdGhlIGNlbnRlciBvZiB0aGUgY2xvdWRcbiAgICAgIG1heFJhZGl1cztcblxuICAgIC8qIHRpbWVzdGFtcCBmb3IgbWVhc3VyaW5nIGVhY2ggcHV0V29yZCgpIGFjdGlvbiAqL1xuICAgIHZhciBlc2NhcGVUaW1lO1xuXG4gICAgLyogZnVuY3Rpb24gZm9yIGdldHRpbmcgdGhlIGNvbG9yIG9mIHRoZSB0ZXh0ICovXG4gICAgdmFyIGdldFRleHRDb2xvcjtcbiAgICBmdW5jdGlvbiByYW5kb21faHNsX2NvbG9yKG1pbiwgbWF4KSB7XG4gICAgICByZXR1cm4gJ2hzbCgnICtcbiAgICAgICAgKE1hdGgucmFuZG9tKCkgKiAzNjApLnRvRml4ZWQoKSArICcsJyArXG4gICAgICAgIChNYXRoLnJhbmRvbSgpICogMzAgKyA3MCkudG9GaXhlZCgpICsgJyUsJyArXG4gICAgICAgIChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbikgKyBtaW4pLnRvRml4ZWQoKSArICclKSc7XG4gICAgfVxuICAgIHN3aXRjaCAoc2V0dGluZ3MuY29sb3IpIHtcbiAgICAgIGNhc2UgJ3JhbmRvbS1kYXJrJzpcbiAgICAgICAgZ2V0VGV4dENvbG9yID0gZnVuY3Rpb24gZ2V0UmFuZG9tRGFya0NvbG9yKCkge1xuICAgICAgICAgIHJldHVybiByYW5kb21faHNsX2NvbG9yKDEwLCA1MCk7XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdyYW5kb20tbGlnaHQnOlxuICAgICAgICBnZXRUZXh0Q29sb3IgPSBmdW5jdGlvbiBnZXRSYW5kb21MaWdodENvbG9yKCkge1xuICAgICAgICAgIHJldHVybiByYW5kb21faHNsX2NvbG9yKDUwLCA5MCk7XG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodHlwZW9mIHNldHRpbmdzLmNvbG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZ2V0VGV4dENvbG9yID0gc2V0dGluZ3MuY29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLyogZnVuY3Rpb24gZm9yIGdldHRpbmcgdGhlIGZvbnQtd2VpZ2h0IG9mIHRoZSB0ZXh0ICovXG4gICAgdmFyIGdldFRleHRGb250V2VpZ2h0O1xuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MuZm9udFdlaWdodCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZ2V0VGV4dEZvbnRXZWlnaHQgPSBzZXR0aW5ncy5mb250V2VpZ2h0O1xuICAgIH1cblxuICAgIC8qIGZ1bmN0aW9uIGZvciBnZXR0aW5nIHRoZSBjbGFzc2VzIG9mIHRoZSB0ZXh0ICovXG4gICAgdmFyIGdldFRleHRDbGFzc2VzID0gbnVsbDtcbiAgICBpZiAodHlwZW9mIHNldHRpbmdzLmNsYXNzZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGdldFRleHRDbGFzc2VzID0gc2V0dGluZ3MuY2xhc3NlcztcbiAgICB9XG5cbiAgICAvKiBJbnRlcmFjdGl2ZSAqL1xuICAgIHZhciBpbnRlcmFjdGl2ZSA9IGZhbHNlO1xuICAgIHZhciBpbmZvR3JpZCA9IFtdO1xuICAgIHZhciBob3ZlcmVkO1xuXG4gICAgdmFyIGdldEluZm9HcmlkRnJvbU1vdXNlVG91Y2hFdmVudCA9XG4gICAgZnVuY3Rpb24gZ2V0SW5mb0dyaWRGcm9tTW91c2VUb3VjaEV2ZW50KGV2dCkge1xuICAgICAgdmFyIGNhbnZhcyA9IGV2dC5jdXJyZW50VGFyZ2V0O1xuICAgICAgdmFyIHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB2YXIgY2xpZW50WDtcbiAgICAgIHZhciBjbGllbnRZO1xuICAgICAgLyoqIERldGVjdCBpZiB0b3VjaGVzIGFyZSBhdmFpbGFibGUgKi9cbiAgICAgIGlmIChldnQudG91Y2hlcykge1xuICAgICAgICBjbGllbnRYID0gZXZ0LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgY2xpZW50WSA9IGV2dC50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbGllbnRYID0gZXZ0LmNsaWVudFg7XG4gICAgICAgIGNsaWVudFkgPSBldnQuY2xpZW50WTtcbiAgICAgIH1cbiAgICAgIHZhciBldmVudFggPSBjbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgdmFyIGV2ZW50WSA9IGNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgdmFyIHggPSBNYXRoLmZsb29yKGV2ZW50WCAqICgoY2FudmFzLndpZHRoIC8gcmVjdC53aWR0aCkgfHwgMSkgLyBnKTtcbiAgICAgIHZhciB5ID0gTWF0aC5mbG9vcihldmVudFkgKiAoKGNhbnZhcy5oZWlnaHQgLyByZWN0LmhlaWdodCkgfHwgMSkgLyBnKTtcblxuICAgICAgcmV0dXJuIGluZm9HcmlkW3hdW3ldO1xuICAgIH07XG5cbiAgICB2YXIgd29yZGNsb3VkaG92ZXIgPSBmdW5jdGlvbiB3b3JkY2xvdWRob3ZlcihldnQpIHtcbiAgICAgIHZhciBpbmZvID0gZ2V0SW5mb0dyaWRGcm9tTW91c2VUb3VjaEV2ZW50KGV2dCk7XG5cbiAgICAgIGlmIChob3ZlcmVkID09PSBpbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaG92ZXJlZCA9IGluZm87XG4gICAgICBpZiAoIWluZm8pIHtcbiAgICAgICAgc2V0dGluZ3MuaG92ZXIodW5kZWZpbmVkLCB1bmRlZmluZWQsIGV2dCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZXR0aW5ncy5ob3ZlcihpbmZvLml0ZW0sIGluZm8uZGltZW5zaW9uLCBldnQpO1xuXG4gICAgfTtcblxuICAgIHZhciB3b3JkY2xvdWRjbGljayA9IGZ1bmN0aW9uIHdvcmRjbG91ZGNsaWNrKGV2dCkge1xuICAgICAgdmFyIGluZm8gPSBnZXRJbmZvR3JpZEZyb21Nb3VzZVRvdWNoRXZlbnQoZXZ0KTtcbiAgICAgIGlmICghaW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNldHRpbmdzLmNsaWNrKGluZm8uaXRlbSwgaW5mby5kaW1lbnNpb24sIGV2dCk7XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuXG4gICAgLyogR2V0IHBvaW50cyBvbiB0aGUgZ3JpZCBmb3IgYSBnaXZlbiByYWRpdXMgYXdheSBmcm9tIHRoZSBjZW50ZXIgKi9cbiAgICB2YXIgcG9pbnRzQXRSYWRpdXMgPSBbXTtcbiAgICB2YXIgZ2V0UG9pbnRzQXRSYWRpdXMgPSBmdW5jdGlvbiBnZXRQb2ludHNBdFJhZGl1cyhyYWRpdXMpIHtcbiAgICAgIGlmIChwb2ludHNBdFJhZGl1c1tyYWRpdXNdKSB7XG4gICAgICAgIHJldHVybiBwb2ludHNBdFJhZGl1c1tyYWRpdXNdO1xuICAgICAgfVxuXG4gICAgICAvLyBMb29rIGZvciB0aGVzZSBudW1iZXIgb2YgcG9pbnRzIG9uIGVhY2ggcmFkaXVzXG4gICAgICB2YXIgVCA9IHJhZGl1cyAqIDg7XG5cbiAgICAgIC8vIEdldHRpbmcgYWxsIHRoZSBwb2ludHMgYXQgdGhpcyByYWRpdXNcbiAgICAgIHZhciB0ID0gVDtcbiAgICAgIHZhciBwb2ludHMgPSBbXTtcblxuICAgICAgaWYgKHJhZGl1cyA9PT0gMCkge1xuICAgICAgICBwb2ludHMucHVzaChbY2VudGVyWzBdLCBjZW50ZXJbMV0sIDBdKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKHQtLSkge1xuICAgICAgICAvLyBkaXN0b3J0IHRoZSByYWRpdXMgdG8gcHV0IHRoZSBjbG91ZCBpbiBzaGFwZVxuICAgICAgICB2YXIgcnggPSAxO1xuICAgICAgICBpZiAoc2V0dGluZ3Muc2hhcGUgIT09ICdjaXJjbGUnKSB7XG4gICAgICAgICAgcnggPSBzZXR0aW5ncy5zaGFwZSh0IC8gVCAqIDIgKiBNYXRoLlBJKTsgLy8gMCB0byAxXG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIFt4LCB5LCB0XTsgdCBpcyB1c2VkIHNvbGVseSBmb3IgZ2V0VGV4dENvbG9yKClcbiAgICAgICAgcG9pbnRzLnB1c2goW1xuICAgICAgICAgIGNlbnRlclswXSArIHJhZGl1cyAqIHJ4ICogTWF0aC5jb3MoLXQgLyBUICogMiAqIE1hdGguUEkpLFxuICAgICAgICAgIGNlbnRlclsxXSArIHJhZGl1cyAqIHJ4ICogTWF0aC5zaW4oLXQgLyBUICogMiAqIE1hdGguUEkpICpcbiAgICAgICAgICAgIHNldHRpbmdzLmVsbGlwdGljaXR5LFxuICAgICAgICAgIHQgLyBUICogMiAqIE1hdGguUEldKTtcbiAgICAgIH1cblxuICAgICAgcG9pbnRzQXRSYWRpdXNbcmFkaXVzXSA9IHBvaW50cztcbiAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfTtcblxuICAgIC8qIFJldHVybiB0cnVlIGlmIHdlIGhhZCBzcGVudCB0b28gbXVjaCB0aW1lICovXG4gICAgdmFyIGV4Y2VlZFRpbWUgPSBmdW5jdGlvbiBleGNlZWRUaW1lKCkge1xuICAgICAgcmV0dXJuICgoc2V0dGluZ3MuYWJvcnRUaHJlc2hvbGQgPiAwKSAmJlxuICAgICAgICAoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIGVzY2FwZVRpbWUgPiBzZXR0aW5ncy5hYm9ydFRocmVzaG9sZCkpO1xuICAgIH07XG5cbiAgICAvKiBHZXQgdGhlIGRlZyBvZiByb3RhdGlvbiBhY2NvcmRpbmcgdG8gc2V0dGluZ3MsIGFuZCBsdWNrLiAqL1xuICAgIHZhciBnZXRSb3RhdGVEZWcgPSBmdW5jdGlvbiBnZXRSb3RhdGVEZWcoKSB7XG4gICAgICBpZiAoc2V0dGluZ3Mucm90YXRlUmF0aW8gPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gc2V0dGluZ3Mucm90YXRlUmF0aW8pIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChyb3RhdGlvblJhbmdlID09PSAwKSB7XG4gICAgICAgIHJldHVybiBtaW5Sb3RhdGlvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvdGF0aW9uU3RlcHMgPiAwKSB7XG4gICAgICAgIC8vIE1pbiByb3RhdGlvbiArIHplcm8gb3IgbW9yZSBzdGVwcyAqIHNwYW4gb2Ygb25lIHN0ZXBcbiAgICAgICAgcmV0dXJuIG1pblJvdGF0aW9uICtcbiAgICAgICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByb3RhdGlvblN0ZXBzKSAqXG4gICAgICAgICAgcm90YXRpb25SYW5nZSAvIChyb3RhdGlvblN0ZXBzIC0gMSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG1pblJvdGF0aW9uICsgTWF0aC5yYW5kb20oKSAqIHJvdGF0aW9uUmFuZ2U7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRUZXh0SW5mbyA9IGZ1bmN0aW9uIGdldFRleHRJbmZvKHdvcmQsIHdlaWdodCwgcm90YXRlRGVnKSB7XG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIGFjdXRhbCBmb250IHNpemVcbiAgICAgIC8vIGZvbnRTaXplID09PSAwIG1lYW5zIHdlaWdodEZhY3RvciBmdW5jdGlvbiB3YW50cyB0aGUgdGV4dCBza2lwcGVkLFxuICAgICAgLy8gYW5kIHNpemUgPCBtaW5TaXplIG1lYW5zIHdlIGNhbm5vdCBkcmF3IHRoZSB0ZXh0LlxuICAgICAgdmFyIGRlYnVnID0gZmFsc2U7XG4gICAgICB2YXIgZm9udFNpemUgPSBzZXR0aW5ncy53ZWlnaHRGYWN0b3Iod2VpZ2h0KTtcbiAgICAgIGlmIChmb250U2l6ZSA8PSBzZXR0aW5ncy5taW5TaXplKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gU2NhbGUgZmFjdG9yIGhlcmUgaXMgdG8gbWFrZSBzdXJlIGZpbGxUZXh0IGlzIG5vdCBsaW1pdGVkIGJ5XG4gICAgICAvLyB0aGUgbWluaXVtIGZvbnQgc2l6ZSBzZXQgYnkgYnJvd3Nlci5cbiAgICAgIC8vIEl0IHdpbGwgYWx3YXlzIGJlIDEgb3IgMm4uXG4gICAgICB2YXIgbXUgPSAxO1xuICAgICAgaWYgKGZvbnRTaXplIDwgbWluRm9udFNpemUpIHtcbiAgICAgICAgbXUgPSAoZnVuY3Rpb24gY2FsY3VsYXRlU2NhbGVGYWN0b3IoKSB7XG4gICAgICAgICAgdmFyIG11ID0gMjtcbiAgICAgICAgICB3aGlsZSAobXUgKiBmb250U2l6ZSA8IG1pbkZvbnRTaXplKSB7XG4gICAgICAgICAgICBtdSArPSAyO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbXU7XG4gICAgICAgIH0pKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBmb250V2VpZ2h0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIHNldCBmY3R4LmZvbnRcbiAgICAgIHZhciBmb250V2VpZ2h0O1xuICAgICAgaWYgKGdldFRleHRGb250V2VpZ2h0KSB7XG4gICAgICAgIGZvbnRXZWlnaHQgPSBnZXRUZXh0Rm9udFdlaWdodCh3b3JkLCB3ZWlnaHQsIGZvbnRTaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvbnRXZWlnaHQgPSBzZXR0aW5ncy5mb250V2VpZ2h0O1xuICAgICAgfVxuXG4gICAgICB2YXIgZmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgdmFyIGZjdHggPSBmY2FudmFzLmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWUgfSk7XG5cbiAgICAgIGZjdHguZm9udCA9IGZvbnRXZWlnaHQgKyAnICcgK1xuICAgICAgICAoZm9udFNpemUgKiBtdSkudG9TdHJpbmcoMTApICsgJ3B4ICcgKyBzZXR0aW5ncy5mb250RmFtaWx5O1xuXG4gICAgICAvLyBFc3RpbWF0ZSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZXh0IHdpdGggbWVhc3VyZVRleHQoKS5cbiAgICAgIHZhciBmdyA9IGZjdHgubWVhc3VyZVRleHQod29yZCkud2lkdGggLyBtdTtcbiAgICAgIHZhciBmaCA9IE1hdGgubWF4KGZvbnRTaXplICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmY3R4Lm1lYXN1cmVUZXh0KCdtJykud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBmY3R4Lm1lYXN1cmVUZXh0KCdcXHVGRjM3Jykud2lkdGgpIC8gbXU7XG5cbiAgICAgIC8vIENyZWF0ZSBhIGJvdW5kYXJ5IGJveCB0aGF0IGlzIGxhcmdlciB0aGFuIG91ciBlc3RpbWF0ZXMsXG4gICAgICAvLyBzbyB0ZXh0IGRvbid0IGdldCBjdXQgb2YgKGl0IHNpbGwgbWlnaHQpXG4gICAgICB2YXIgYm94V2lkdGggPSBmdyArIGZoICogMjtcbiAgICAgIHZhciBib3hIZWlnaHQgPSBmaCAqIDM7XG4gICAgICB2YXIgZmd3ID0gTWF0aC5jZWlsKGJveFdpZHRoIC8gZyk7XG4gICAgICB2YXIgZmdoID0gTWF0aC5jZWlsKGJveEhlaWdodCAvIGcpO1xuICAgICAgYm94V2lkdGggPSBmZ3cgKiBnO1xuICAgICAgYm94SGVpZ2h0ID0gZmdoICogZztcblxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBwcm9wZXIgb2Zmc2V0cyB0byBtYWtlIHRoZSB0ZXh0IGNlbnRlcmVkIGF0XG4gICAgICAvLyB0aGUgcHJlZmVycmVkIHBvc2l0aW9uLlxuXG4gICAgICAvLyBUaGlzIGlzIHNpbXBseSBoYWxmIG9mIHRoZSB3aWR0aC5cbiAgICAgIHZhciBmaWxsVGV4dE9mZnNldFggPSAtIGZ3IC8gMjtcbiAgICAgIC8vIEluc3RlYWQgb2YgbW92aW5nIHRoZSBib3ggdG8gdGhlIGV4YWN0IG1pZGRsZSBvZiB0aGUgcHJlZmVycmVkXG4gICAgICAvLyBwb3NpdGlvbiwgZm9yIFktb2Zmc2V0IHdlIG1vdmUgMC40IGluc3RlYWQsIHNvIExhdGluIGFscGhhYmV0cyBsb29rXG4gICAgICAvLyB2ZXJ0aWNhbCBjZW50ZXJlZC5cbiAgICAgIHZhciBmaWxsVGV4dE9mZnNldFkgPSAtIGZoICogMC40O1xuXG4gICAgICAvLyBDYWxjdWxhdGUgdGhlIGFjdHVhbCBkaW1lbnNpb24gb2YgdGhlIGNhbnZhcywgY29uc2lkZXJpbmcgdGhlIHJvdGF0aW9uLlxuICAgICAgdmFyIGNnaCA9IE1hdGguY2VpbCgoYm94V2lkdGggKiBNYXRoLmFicyhNYXRoLnNpbihyb3RhdGVEZWcpKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBib3hIZWlnaHQgKiBNYXRoLmFicyhNYXRoLmNvcyhyb3RhdGVEZWcpKSkgLyBnKTtcbiAgICAgIHZhciBjZ3cgPSBNYXRoLmNlaWwoKGJveFdpZHRoICogTWF0aC5hYnMoTWF0aC5jb3Mocm90YXRlRGVnKSkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94SGVpZ2h0ICogTWF0aC5hYnMoTWF0aC5zaW4ocm90YXRlRGVnKSkpIC8gZyk7XG4gICAgICB2YXIgd2lkdGggPSBjZ3cgKiBnO1xuICAgICAgdmFyIGhlaWdodCA9IGNnaCAqIGc7XG5cbiAgICAgIGZjYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHdpZHRoKTtcbiAgICAgIGZjYW52YXMuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gICAgICBpZiAoZGVidWcpIHtcbiAgICAgICAgLy8gQXR0YWNoIGZjYW52YXMgdG8gdGhlIERPTVxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGZjYW52YXMpO1xuICAgICAgICAvLyBTYXZlIGl0J3Mgc3RhdGUgc28gdGhhdCB3ZSBjb3VsZCByZXN0b3JlIGFuZCBkcmF3IHRoZSBncmlkIGNvcnJlY3RseS5cbiAgICAgICAgZmN0eC5zYXZlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNjYWxlIHRoZSBjYW52YXMgd2l0aCB8bXV8LlxuICAgICAgZmN0eC5zY2FsZSgxIC8gbXUsIDEgLyBtdSk7XG4gICAgICBmY3R4LnRyYW5zbGF0ZSh3aWR0aCAqIG11IC8gMiwgaGVpZ2h0ICogbXUgLyAyKTtcbiAgICAgIGZjdHgucm90YXRlKC0gcm90YXRlRGVnKTtcblxuICAgICAgLy8gT25jZSB0aGUgd2lkdGgvaGVpZ2h0IGlzIHNldCwgY3R4IGluZm8gd2lsbCBiZSByZXNldC5cbiAgICAgIC8vIFNldCBpdCBhZ2FpbiBoZXJlLlxuICAgICAgZmN0eC5mb250ID0gZm9udFdlaWdodCArICcgJyArXG4gICAgICAgIChmb250U2l6ZSAqIG11KS50b1N0cmluZygxMCkgKyAncHggJyArIHNldHRpbmdzLmZvbnRGYW1pbHk7XG5cbiAgICAgIC8vIEZpbGwgdGhlIHRleHQgaW50byB0aGUgZmNhbnZhcy5cbiAgICAgIC8vIFhYWDogV2UgY2Fubm90IGJlY2F1c2UgdGV4dEJhc2VsaW5lID0gJ3RvcCcgaGVyZSBiZWNhdXNlXG4gICAgICAvLyBGaXJlZm94IGFuZCBDaHJvbWUgdXNlcyBkaWZmZXJlbnQgZGVmYXVsdCBsaW5lLWhlaWdodCBmb3IgY2FudmFzLlxuICAgICAgLy8gUGxlYXNlIHJlYWQgaHR0cHM6Ly9idWd6aWwubGEvNzM3ODUyI2M2LlxuICAgICAgLy8gSGVyZSwgd2UgdXNlIHRleHRCYXNlbGluZSA9ICdtaWRkbGUnIGFuZCBkcmF3IHRoZSB0ZXh0IGF0IGV4YWN0bHlcbiAgICAgIC8vIDAuNSAqIGZvbnRTaXplIGxvd2VyLlxuICAgICAgZmN0eC5maWxsU3R5bGUgPSAnIzAwMCc7XG4gICAgICBmY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuICAgICAgZmN0eC5maWxsVGV4dCh3b3JkLCBmaWxsVGV4dE9mZnNldFggKiBtdSxcbiAgICAgICAgICAgICAgICAgICAgKGZpbGxUZXh0T2Zmc2V0WSArIGZvbnRTaXplICogMC41KSAqIG11KTtcblxuICAgICAgLy8gR2V0IHRoZSBwaXhlbHMgb2YgdGhlIHRleHRcbiAgICAgIHZhciBpbWFnZURhdGEgPSBmY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xuXG4gICAgICBpZiAoZXhjZWVkVGltZSgpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgIC8vIERyYXcgdGhlIGJveCBvZiB0aGUgb3JpZ2luYWwgZXN0aW1hdGlvblxuICAgICAgICBmY3R4LnN0cm9rZVJlY3QoZmlsbFRleHRPZmZzZXRYICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsVGV4dE9mZnNldFksIGZ3ICogbXUsIGZoICogbXUpO1xuICAgICAgICBmY3R4LnJlc3RvcmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gUmVhZCB0aGUgcGl4ZWxzIGFuZCBzYXZlIHRoZSBpbmZvcm1hdGlvbiB0byB0aGUgb2NjdXBpZWQgYXJyYXlcbiAgICAgIHZhciBvY2N1cGllZCA9IFtdO1xuICAgICAgdmFyIGd4ID0gY2d3LCBneSwgeCwgeTtcbiAgICAgIHZhciBib3VuZHMgPSBbY2doIC8gMiwgY2d3IC8gMiwgY2doIC8gMiwgY2d3IC8gMl07XG4gICAgICB3aGlsZSAoZ3gtLSkge1xuICAgICAgICBneSA9IGNnaDtcbiAgICAgICAgd2hpbGUgKGd5LS0pIHtcbiAgICAgICAgICB5ID0gZztcbiAgICAgICAgICBzaW5nbGVHcmlkTG9vcDoge1xuICAgICAgICAgICAgd2hpbGUgKHktLSkge1xuICAgICAgICAgICAgICB4ID0gZztcbiAgICAgICAgICAgICAgd2hpbGUgKHgtLSkge1xuICAgICAgICAgICAgICAgIGlmIChpbWFnZURhdGFbKChneSAqIGcgKyB5KSAqIHdpZHRoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZ3ggKiBnICsgeCkpICogNCArIDNdKSB7XG4gICAgICAgICAgICAgICAgICBvY2N1cGllZC5wdXNoKFtneCwgZ3ldKTtcblxuICAgICAgICAgICAgICAgICAgaWYgKGd4IDwgYm91bmRzWzNdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1szXSA9IGd4O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGd4ID4gYm91bmRzWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1sxXSA9IGd4O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGd5IDwgYm91bmRzWzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1swXSA9IGd5O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGd5ID4gYm91bmRzWzJdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc1syXSA9IGd5O1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoZGVidWcpIHtcbiAgICAgICAgICAgICAgICAgICAgZmN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsIDAsIDAsIDAuNSknO1xuICAgICAgICAgICAgICAgICAgICBmY3R4LmZpbGxSZWN0KGd4ICogZywgZ3kgKiBnLCBnIC0gMC41LCBnIC0gMC41KTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJyZWFrIHNpbmdsZUdyaWRMb29wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgICAgICAgIGZjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMjU1LCAwLjUpJztcbiAgICAgICAgICAgICAgZmN0eC5maWxsUmVjdChneCAqIGcsIGd5ICogZywgZyAtIDAuNSwgZyAtIDAuNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWJ1Zykge1xuICAgICAgICBmY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDI1NSwgMCwgMC41KSc7XG4gICAgICAgIGZjdHguZmlsbFJlY3QoYm91bmRzWzNdICogZyxcbiAgICAgICAgICAgICAgICAgICAgICBib3VuZHNbMF0gKiBnLFxuICAgICAgICAgICAgICAgICAgICAgIChib3VuZHNbMV0gLSBib3VuZHNbM10gKyAxKSAqIGcsXG4gICAgICAgICAgICAgICAgICAgICAgKGJvdW5kc1syXSAtIGJvdW5kc1swXSArIDEpICogZyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gY3JlYXRlIHRoZSB0ZXh0IG9uIHRoZSByZWFsIGNhbnZhc1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbXU6IG11LFxuICAgICAgICBvY2N1cGllZDogb2NjdXBpZWQsXG4gICAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgICBndzogY2d3LFxuICAgICAgICBnaDogY2doLFxuICAgICAgICBmaWxsVGV4dE9mZnNldFg6IGZpbGxUZXh0T2Zmc2V0WCxcbiAgICAgICAgZmlsbFRleHRPZmZzZXRZOiBmaWxsVGV4dE9mZnNldFksXG4gICAgICAgIGZpbGxUZXh0V2lkdGg6IGZ3LFxuICAgICAgICBmaWxsVGV4dEhlaWdodDogZmgsXG4gICAgICAgIGZvbnRTaXplOiBmb250U2l6ZVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgLyogRGV0ZXJtaW5lIGlmIHRoZXJlIGlzIHJvb20gYXZhaWxhYmxlIGluIHRoZSBnaXZlbiBkaW1lbnNpb24gKi9cbiAgICB2YXIgY2FuRml0VGV4dCA9IGZ1bmN0aW9uIGNhbkZpdFRleHQoZ3gsIGd5LCBndywgZ2gsIG9jY3VwaWVkKSB7XG4gICAgICAvLyBHbyB0aHJvdWdoIHRoZSBvY2N1cGllZCBwb2ludHMsXG4gICAgICAvLyByZXR1cm4gZmFsc2UgaWYgdGhlIHNwYWNlIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICB2YXIgaSA9IG9jY3VwaWVkLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdmFyIHB4ID0gZ3ggKyBvY2N1cGllZFtpXVswXTtcbiAgICAgICAgdmFyIHB5ID0gZ3kgKyBvY2N1cGllZFtpXVsxXTtcblxuICAgICAgICBpZiAocHggPj0gbmd4IHx8IHB5ID49IG5neSB8fCBweCA8IDAgfHwgcHkgPCAwKSB7XG4gICAgICAgICAgaWYgKCFzZXR0aW5ncy5kcmF3T3V0T2ZCb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZ3JpZFtweF1bcHldKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyogQWN0dWFsbHkgZHJhdyB0aGUgdGV4dCBvbiB0aGUgZ3JpZCAqL1xuICAgIHZhciBkcmF3VGV4dCA9IGZ1bmN0aW9uIGRyYXdUZXh0KGd4LCBneSwgaW5mbywgd29yZCwgd2VpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlLCB0aGV0YSwgcm90YXRlRGVnLCBhdHRyaWJ1dGVzKSB7XG5cbiAgICAgIHZhciBmb250U2l6ZSA9IGluZm8uZm9udFNpemU7XG4gICAgICB2YXIgY29sb3I7XG4gICAgICBpZiAoZ2V0VGV4dENvbG9yKSB7XG4gICAgICAgIGNvbG9yID0gZ2V0VGV4dENvbG9yKHdvcmQsIHdlaWdodCwgZm9udFNpemUsIGRpc3RhbmNlLCB0aGV0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xvciA9IHNldHRpbmdzLmNvbG9yO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgZm9udFdlaWdodCB0aGF0IHdpbGwgYmUgdXNlZCB0byBzZXQgY3R4LmZvbnQgYW5kIGZvbnQgc3R5bGUgcnVsZVxuICAgICAgdmFyIGZvbnRXZWlnaHQ7XG4gICAgICBpZiAoZ2V0VGV4dEZvbnRXZWlnaHQpIHtcbiAgICAgICAgZm9udFdlaWdodCA9IGdldFRleHRGb250V2VpZ2h0KHdvcmQsIHdlaWdodCwgZm9udFNpemUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9udFdlaWdodCA9IHNldHRpbmdzLmZvbnRXZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBjbGFzc2VzO1xuICAgICAgaWYgKGdldFRleHRDbGFzc2VzKSB7XG4gICAgICAgIGNsYXNzZXMgPSBnZXRUZXh0Q2xhc3Nlcyh3b3JkLCB3ZWlnaHQsIGZvbnRTaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNsYXNzZXMgPSBzZXR0aW5ncy5jbGFzc2VzO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGltZW5zaW9uO1xuICAgICAgdmFyIGJvdW5kcyA9IGluZm8uYm91bmRzO1xuICAgICAgZGltZW5zaW9uID0ge1xuICAgICAgICB4OiAoZ3ggKyBib3VuZHNbM10pICogZyxcbiAgICAgICAgeTogKGd5ICsgYm91bmRzWzBdKSAqIGcsXG4gICAgICAgIHc6IChib3VuZHNbMV0gLSBib3VuZHNbM10gKyAxKSAqIGcsXG4gICAgICAgIGg6IChib3VuZHNbMl0gLSBib3VuZHNbMF0gKyAxKSAqIGdcbiAgICAgIH07XG5cbiAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKGVsLmdldENvbnRleHQpIHtcbiAgICAgICAgICB2YXIgY3R4ID0gZWwuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICB2YXIgbXUgPSBpbmZvLm11O1xuXG4gICAgICAgICAgLy8gU2F2ZSB0aGUgY3VycmVudCBzdGF0ZSBiZWZvcmUgbWVzc2luZyBpdFxuICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgY3R4LnNjYWxlKDEgLyBtdSwgMSAvIG11KTtcblxuICAgICAgICAgIGN0eC5mb250ID0gZm9udFdlaWdodCArICcgJyArXG4gICAgICAgICAgICAgICAgICAgICAoZm9udFNpemUgKiBtdSkudG9TdHJpbmcoMTApICsgJ3B4ICcgKyBzZXR0aW5ncy5mb250RmFtaWx5O1xuICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcblxuICAgICAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgY2FudmFzIHBvc2l0aW9uIHRvIHRoZSBvcmlnaW4gY29vcmRpbmF0ZSBvZiB3aGVyZVxuICAgICAgICAgIC8vIHRoZSB0ZXh0IHNob3VsZCBiZSBwdXQuXG4gICAgICAgICAgY3R4LnRyYW5zbGF0ZSgoZ3ggKyBpbmZvLmd3IC8gMikgKiBnICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICAoZ3kgKyBpbmZvLmdoIC8gMikgKiBnICogbXUpO1xuXG4gICAgICAgICAgaWYgKHJvdGF0ZURlZyAhPT0gMCkge1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSgtIHJvdGF0ZURlZyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRmluYWxseSwgZmlsbCB0aGUgdGV4dC5cblxuICAgICAgICAgIC8vIFhYWDogV2UgY2Fubm90IGJlY2F1c2UgdGV4dEJhc2VsaW5lID0gJ3RvcCcgaGVyZSBiZWNhdXNlXG4gICAgICAgICAgLy8gRmlyZWZveCBhbmQgQ2hyb21lIHVzZXMgZGlmZmVyZW50IGRlZmF1bHQgbGluZS1oZWlnaHQgZm9yIGNhbnZhcy5cbiAgICAgICAgICAvLyBQbGVhc2UgcmVhZCBodHRwczovL2J1Z3ppbC5sYS83Mzc4NTIjYzYuXG4gICAgICAgICAgLy8gSGVyZSwgd2UgdXNlIHRleHRCYXNlbGluZSA9ICdtaWRkbGUnIGFuZCBkcmF3IHRoZSB0ZXh0IGF0IGV4YWN0bHlcbiAgICAgICAgICAvLyAwLjUgKiBmb250U2l6ZSBsb3dlci5cbiAgICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSc7XG4gICAgICAgICAgY3R4LmZpbGxUZXh0KHdvcmQsIGluZm8uZmlsbFRleHRPZmZzZXRYICogbXUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIChpbmZvLmZpbGxUZXh0T2Zmc2V0WSArIGZvbnRTaXplICogMC41KSAqIG11KTtcblxuICAgICAgICAgIC8vIFRoZSBiZWxvdyBib3ggaXMgYWx3YXlzIG1hdGNoZXMgaG93IDxzcGFuPnMgYXJlIHBvc2l0aW9uZWRcbiAgICAgICAgICAvKiBjdHguc3Ryb2tlUmVjdChpbmZvLmZpbGxUZXh0T2Zmc2V0WCwgaW5mby5maWxsVGV4dE9mZnNldFksXG4gICAgICAgICAgICBpbmZvLmZpbGxUZXh0V2lkdGgsIGluZm8uZmlsbFRleHRIZWlnaHQpOyAqL1xuXG4gICAgICAgICAgLy8gUmVzdG9yZSB0aGUgc3RhdGUuXG4gICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBkcmF3VGV4dCBvbiBESVYgZWxlbWVudFxuICAgICAgICAgIHZhciBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgIHZhciB0cmFuc2Zvcm1SdWxlID0gJyc7XG4gICAgICAgICAgdHJhbnNmb3JtUnVsZSA9ICdyb3RhdGUoJyArICgtIHJvdGF0ZURlZyAvIE1hdGguUEkgKiAxODApICsgJ2RlZykgJztcbiAgICAgICAgICBpZiAoaW5mby5tdSAhPT0gMSkge1xuICAgICAgICAgICAgdHJhbnNmb3JtUnVsZSArPVxuICAgICAgICAgICAgICAndHJhbnNsYXRlWCgtJyArIChpbmZvLmZpbGxUZXh0V2lkdGggLyA0KSArICdweCkgJyArXG4gICAgICAgICAgICAgICdzY2FsZSgnICsgKDEgLyBpbmZvLm11KSArICcpJztcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHN0eWxlUnVsZXMgPSB7XG4gICAgICAgICAgICAncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snLFxuICAgICAgICAgICAgJ2ZvbnQnOiBmb250V2VpZ2h0ICsgJyAnICtcbiAgICAgICAgICAgICAgICAgICAgKGZvbnRTaXplICogaW5mby5tdSkgKyAncHggJyArIHNldHRpbmdzLmZvbnRGYW1pbHksXG4gICAgICAgICAgICAnbGVmdCc6ICgoZ3ggKyBpbmZvLmd3IC8gMikgKiBnICsgaW5mby5maWxsVGV4dE9mZnNldFgpICsgJ3B4JyxcbiAgICAgICAgICAgICd0b3AnOiAoKGd5ICsgaW5mby5naCAvIDIpICogZyArIGluZm8uZmlsbFRleHRPZmZzZXRZKSArICdweCcsXG4gICAgICAgICAgICAnd2lkdGgnOiBpbmZvLmZpbGxUZXh0V2lkdGggKyAncHgnLFxuICAgICAgICAgICAgJ2hlaWdodCc6IGluZm8uZmlsbFRleHRIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgJ2xpbmVIZWlnaHQnOiBmb250U2l6ZSArICdweCcsXG4gICAgICAgICAgICAnd2hpdGVTcGFjZSc6ICdub3dyYXAnLFxuICAgICAgICAgICAgJ3RyYW5zZm9ybSc6IHRyYW5zZm9ybVJ1bGUsXG4gICAgICAgICAgICAnd2Via2l0VHJhbnNmb3JtJzogdHJhbnNmb3JtUnVsZSxcbiAgICAgICAgICAgICdtc1RyYW5zZm9ybSc6IHRyYW5zZm9ybVJ1bGUsXG4gICAgICAgICAgICAndHJhbnNmb3JtT3JpZ2luJzogJzUwJSA0MCUnLFxuICAgICAgICAgICAgJ3dlYmtpdFRyYW5zZm9ybU9yaWdpbic6ICc1MCUgNDAlJyxcbiAgICAgICAgICAgICdtc1RyYW5zZm9ybU9yaWdpbic6ICc1MCUgNDAlJ1xuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKGNvbG9yKSB7XG4gICAgICAgICAgICBzdHlsZVJ1bGVzLmNvbG9yID0gY29sb3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNwYW4udGV4dENvbnRlbnQgPSB3b3JkO1xuICAgICAgICAgIGZvciAodmFyIGNzc1Byb3AgaW4gc3R5bGVSdWxlcykge1xuICAgICAgICAgICAgc3Bhbi5zdHlsZVtjc3NQcm9wXSA9IHN0eWxlUnVsZXNbY3NzUHJvcF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyaWJ1dGUgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICBzcGFuLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIGF0dHJpYnV0ZXNbYXR0cmlidXRlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgICAgICBzcGFuLmNsYXNzTmFtZSArPSBjbGFzc2VzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZChzcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qIEhlbHAgZnVuY3Rpb24gdG8gdXBkYXRlR3JpZCAqL1xuICAgIHZhciBmaWxsR3JpZEF0ID0gZnVuY3Rpb24gZmlsbEdyaWRBdCh4LCB5LCBkcmF3TWFzaywgZGltZW5zaW9uLCBpdGVtKSB7XG4gICAgICBpZiAoeCA+PSBuZ3ggfHwgeSA+PSBuZ3kgfHwgeCA8IDAgfHwgeSA8IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBncmlkW3hdW3ldID0gZmFsc2U7XG5cbiAgICAgIGlmIChkcmF3TWFzaykge1xuICAgICAgICB2YXIgY3R4ID0gZWxlbWVudHNbMF0uZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY3R4LmZpbGxSZWN0KHggKiBnLCB5ICogZywgbWFza1JlY3RXaWR0aCwgbWFza1JlY3RXaWR0aCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbnRlcmFjdGl2ZSkge1xuICAgICAgICBpbmZvR3JpZFt4XVt5XSA9IHsgaXRlbTogaXRlbSwgZGltZW5zaW9uOiBkaW1lbnNpb24gfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogVXBkYXRlIHRoZSBmaWxsaW5nIGluZm9ybWF0aW9uIG9mIHRoZSBnaXZlbiBzcGFjZSB3aXRoIG9jY3VwaWVkIHBvaW50cy5cbiAgICAgICBEcmF3IHRoZSBtYXNrIG9uIHRoZSBjYW52YXMgaWYgbmVjZXNzYXJ5LiAqL1xuICAgIHZhciB1cGRhdGVHcmlkID0gZnVuY3Rpb24gdXBkYXRlR3JpZChneCwgZ3ksIGd3LCBnaCwgaW5mbywgaXRlbSkge1xuICAgICAgdmFyIG9jY3VwaWVkID0gaW5mby5vY2N1cGllZDtcbiAgICAgIHZhciBkcmF3TWFzayA9IHNldHRpbmdzLmRyYXdNYXNrO1xuICAgICAgdmFyIGN0eDtcbiAgICAgIGlmIChkcmF3TWFzaykge1xuICAgICAgICBjdHggPSBlbGVtZW50c1swXS5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gc2V0dGluZ3MubWFza0NvbG9yO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGltZW5zaW9uO1xuICAgICAgaWYgKGludGVyYWN0aXZlKSB7XG4gICAgICAgIHZhciBib3VuZHMgPSBpbmZvLmJvdW5kcztcbiAgICAgICAgZGltZW5zaW9uID0ge1xuICAgICAgICAgIHg6IChneCArIGJvdW5kc1szXSkgKiBnLFxuICAgICAgICAgIHk6IChneSArIGJvdW5kc1swXSkgKiBnLFxuICAgICAgICAgIHc6IChib3VuZHNbMV0gLSBib3VuZHNbM10gKyAxKSAqIGcsXG4gICAgICAgICAgaDogKGJvdW5kc1syXSAtIGJvdW5kc1swXSArIDEpICogZ1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgaSA9IG9jY3VwaWVkLmxlbmd0aDtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdmFyIHB4ID0gZ3ggKyBvY2N1cGllZFtpXVswXTtcbiAgICAgICAgdmFyIHB5ID0gZ3kgKyBvY2N1cGllZFtpXVsxXTtcblxuICAgICAgICBpZiAocHggPj0gbmd4IHx8IHB5ID49IG5neSB8fCBweCA8IDAgfHwgcHkgPCAwKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBmaWxsR3JpZEF0KHB4LCBweSwgZHJhd01hc2ssIGRpbWVuc2lvbiwgaXRlbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkcmF3TWFzaykge1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBwdXRXb3JkKCkgcHJvY2Vzc2VzIGVhY2ggaXRlbSBvbiB0aGUgbGlzdCxcbiAgICAgICBjYWxjdWxhdGUgaXQncyBzaXplIGFuZCBkZXRlcm1pbmUgaXQncyBwb3NpdGlvbiwgYW5kIGFjdHVhbGx5XG4gICAgICAgcHV0IGl0IG9uIHRoZSBjYW52YXMuICovXG4gICAgdmFyIHB1dFdvcmQgPSBmdW5jdGlvbiBwdXRXb3JkKGl0ZW0pIHtcbiAgICAgIHZhciB3b3JkLCB3ZWlnaHQsIGF0dHJpYnV0ZXM7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgICAgICB3b3JkID0gaXRlbVswXTtcbiAgICAgICAgd2VpZ2h0ID0gaXRlbVsxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdvcmQgPSBpdGVtLndvcmQ7XG4gICAgICAgIHdlaWdodCA9IGl0ZW0ud2VpZ2h0O1xuICAgICAgICBhdHRyaWJ1dGVzID0gaXRlbS5hdHRyaWJ1dGVzO1xuICAgICAgfVxuICAgICAgdmFyIHJvdGF0ZURlZyA9IGdldFJvdGF0ZURlZygpO1xuXG4gICAgICAvLyBnZXQgaW5mbyBuZWVkZWQgdG8gcHV0IHRoZSB0ZXh0IG9udG8gdGhlIGNhbnZhc1xuICAgICAgdmFyIGluZm8gPSBnZXRUZXh0SW5mbyh3b3JkLCB3ZWlnaHQsIHJvdGF0ZURlZyk7XG5cbiAgICAgIC8vIG5vdCBnZXR0aW5nIHRoZSBpbmZvIG1lYW5zIHdlIHNob3VsZG4ndCBiZSBkcmF3aW5nIHRoaXMgb25lLlxuICAgICAgaWYgKCFpbmZvKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4Y2VlZFRpbWUoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGRyYXdPdXRPZkJvdW5kIGlzIHNldCB0byBmYWxzZSxcbiAgICAgIC8vIHNraXAgdGhlIGxvb3AgaWYgd2UgaGF2ZSBhbHJlYWR5IGtub3cgdGhlIGJvdW5kaW5nIGJveCBvZlxuICAgICAgLy8gd29yZCBpcyBsYXJnZXIgdGhhbiB0aGUgY2FudmFzLlxuICAgICAgaWYgKCFzZXR0aW5ncy5kcmF3T3V0T2ZCb3VuZCkge1xuICAgICAgICB2YXIgYm91bmRzID0gaW5mby5ib3VuZHM7XG4gICAgICAgIGlmICgoYm91bmRzWzFdIC0gYm91bmRzWzNdICsgMSkgPiBuZ3ggfHxcbiAgICAgICAgICAoYm91bmRzWzJdIC0gYm91bmRzWzBdICsgMSkgPiBuZ3kpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBwb3NpdGlvbiB0byBwdXQgdGhlIHRleHQgYnlcbiAgICAgIC8vIHN0YXJ0IGxvb2tpbmcgZm9yIHRoZSBuZWFyZXN0IHBvaW50c1xuICAgICAgdmFyIHIgPSBtYXhSYWRpdXMgKyAxO1xuXG4gICAgICB2YXIgdHJ5VG9QdXRXb3JkQXRQb2ludCA9IGZ1bmN0aW9uKGd4eSkge1xuICAgICAgICB2YXIgZ3ggPSBNYXRoLmZsb29yKGd4eVswXSAtIGluZm8uZ3cgLyAyKTtcbiAgICAgICAgdmFyIGd5ID0gTWF0aC5mbG9vcihneHlbMV0gLSBpbmZvLmdoIC8gMik7XG4gICAgICAgIHZhciBndyA9IGluZm8uZ3c7XG4gICAgICAgIHZhciBnaCA9IGluZm8uZ2g7XG5cbiAgICAgICAgLy8gSWYgd2UgY2Fubm90IGZpdCB0aGUgdGV4dCBhdCB0aGlzIHBvc2l0aW9uLCByZXR1cm4gZmFsc2VcbiAgICAgICAgLy8gYW5kIGdvIHRvIHRoZSBuZXh0IHBvc2l0aW9uLlxuICAgICAgICBpZiAoIWNhbkZpdFRleHQoZ3gsIGd5LCBndywgZ2gsIGluZm8ub2NjdXBpZWQpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWN0dWFsbHkgcHV0IHRoZSB0ZXh0IG9uIHRoZSBjYW52YXNcbiAgICAgICAgZHJhd1RleHQoZ3gsIGd5LCBpbmZvLCB3b3JkLCB3ZWlnaHQsXG4gICAgICAgICAgICAgICAgIChtYXhSYWRpdXMgLSByKSwgZ3h5WzJdLCByb3RhdGVEZWcsIGF0dHJpYnV0ZXMpO1xuXG4gICAgICAgIC8vIE1hcmsgdGhlIHNwYWNlcyBvbiB0aGUgZ3JpZCBhcyBmaWxsZWRcbiAgICAgICAgdXBkYXRlR3JpZChneCwgZ3ksIGd3LCBnaCwgaW5mbywgaXRlbSk7XG5cbiAgICAgICAgLy8gUmV0dXJuIHRydWUgc28gc29tZSgpIHdpbGwgc3RvcCBhbmQgYWxzbyByZXR1cm4gdHJ1ZS5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuXG4gICAgICB3aGlsZSAoci0tKSB7XG4gICAgICAgIHZhciBwb2ludHMgPSBnZXRQb2ludHNBdFJhZGl1cyhtYXhSYWRpdXMgLSByKTtcblxuICAgICAgICBpZiAoc2V0dGluZ3Muc2h1ZmZsZSkge1xuICAgICAgICAgIHBvaW50cyA9IFtdLmNvbmNhdChwb2ludHMpO1xuICAgICAgICAgIHNodWZmbGVBcnJheShwb2ludHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJ5IHRvIGZpdCB0aGUgd29yZHMgYnkgbG9va2luZyBhdCBlYWNoIHBvaW50LlxuICAgICAgICAvLyBhcnJheS5zb21lKCkgd2lsbCBzdG9wIGFuZCByZXR1cm4gdHJ1ZVxuICAgICAgICAvLyB3aGVuIHB1dFdvcmRBdFBvaW50KCkgcmV0dXJucyB0cnVlLlxuICAgICAgICAvLyBJZiBhbGwgdGhlIHBvaW50cyByZXR1cm5zIGZhbHNlLCBhcnJheS5zb21lKCkgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgdmFyIGRyYXduID0gcG9pbnRzLnNvbWUodHJ5VG9QdXRXb3JkQXRQb2ludCk7XG5cbiAgICAgICAgaWYgKGRyYXduKSB7XG4gICAgICAgICAgLy8gbGVhdmUgcHV0V29yZCgpIGFuZCByZXR1cm4gdHJ1ZVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc2V0dGluZ3Muc2hyaW5rVG9GaXQpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgICBpdGVtWzFdID0gaXRlbVsxXSAqIDMgLyA0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0ud2VpZ2h0ID0gaXRlbS53ZWlnaHQgKiAzIC8gNDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHV0V29yZChpdGVtKTtcbiAgICAgIH1cbiAgICAgIC8vIHdlIHRyaWVkIGFsbCBkaXN0YW5jZXMgYnV0IHRleHQgd29uJ3QgZml0LCByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyogU2VuZCBET00gZXZlbnQgdG8gYWxsIGVsZW1lbnRzLiBXaWxsIHN0b3Agc2VuZGluZyBldmVudCBhbmQgcmV0dXJuXG4gICAgICAgaWYgdGhlIHByZXZpb3VzIG9uZSBpcyBjYW5jZWxlZCAoZm9yIGNhbmNlbGFibGUgZXZlbnRzKS4gKi9cbiAgICB2YXIgc2VuZEV2ZW50ID0gZnVuY3Rpb24gc2VuZEV2ZW50KHR5cGUsIGNhbmNlbGFibGUsIGRldGFpbHMpIHtcbiAgICAgIGlmIChjYW5jZWxhYmxlKSB7XG4gICAgICAgIHJldHVybiAhZWxlbWVudHMuc29tZShmdW5jdGlvbihlbCkge1xuICAgICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XG4gICAgICAgICAgICBkZXRhaWw6IGRldGFpbHMgfHwge31cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gIWVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwge1xuICAgICAgICAgICAgZGV0YWlsOiBkZXRhaWxzIHx8IHt9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBTdGFydCBkcmF3aW5nIG9uIGEgY2FudmFzICovXG4gICAgdmFyIHN0YXJ0ID0gZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAvLyBGb3IgZGltZW5zaW9ucywgY2xlYXJDYW52YXMgZXRjLixcbiAgICAgIC8vIHdlIG9ubHkgY2FyZSBhYm91dCB0aGUgZmlyc3QgZWxlbWVudC5cbiAgICAgIHZhciBjYW52YXMgPSBlbGVtZW50c1swXTtcblxuICAgICAgaWYgKGNhbnZhcy5nZXRDb250ZXh0KSB7XG4gICAgICAgIG5neCA9IE1hdGguY2VpbChjYW52YXMud2lkdGggLyBnKTtcbiAgICAgICAgbmd5ID0gTWF0aC5jZWlsKGNhbnZhcy5oZWlnaHQgLyBnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBuZ3ggPSBNYXRoLmNlaWwocmVjdC53aWR0aCAvIGcpO1xuICAgICAgICBuZ3kgPSBNYXRoLmNlaWwocmVjdC5oZWlnaHQgLyBnKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VuZGluZyBhIHdvcmRjbG91ZHN0YXJ0IGV2ZW50IHdoaWNoIGNhdXNlIHRoZSBwcmV2aW91cyBsb29wIHRvIHN0b3AuXG4gICAgICAvLyBEbyBub3RoaW5nIGlmIHRoZSBldmVudCBpcyBjYW5jZWxlZC5cbiAgICAgIGlmICghc2VuZEV2ZW50KCd3b3JkY2xvdWRzdGFydCcsIHRydWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBjZW50ZXIgb2YgdGhlIHdvcmQgY2xvdWRcbiAgICAgIGNlbnRlciA9IChzZXR0aW5ncy5vcmlnaW4pID9cbiAgICAgICAgW3NldHRpbmdzLm9yaWdpblswXS9nLCBzZXR0aW5ncy5vcmlnaW5bMV0vZ10gOlxuICAgICAgICBbbmd4IC8gMiwgbmd5IC8gMl07XG5cbiAgICAgIC8vIE1heGl1bSByYWRpdXMgdG8gbG9vayBmb3Igc3BhY2VcbiAgICAgIG1heFJhZGl1cyA9IE1hdGguZmxvb3IoTWF0aC5zcXJ0KG5neCAqIG5neCArIG5neSAqIG5neSkpO1xuXG4gICAgICAvKiBDbGVhciB0aGUgY2FudmFzIG9ubHkgaWYgdGhlIGNsZWFyQ2FudmFzIGlzIHNldCxcbiAgICAgICAgIGlmIG5vdCwgdXBkYXRlIHRoZSBncmlkIHRvIHRoZSBjdXJyZW50IGNhbnZhcyBzdGF0ZSAqL1xuICAgICAgZ3JpZCA9IFtdO1xuXG4gICAgICB2YXIgZ3gsIGd5LCBpO1xuICAgICAgaWYgKCFjYW52YXMuZ2V0Q29udGV4dCB8fCBzZXR0aW5ncy5jbGVhckNhbnZhcykge1xuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgaWYgKGVsLmdldENvbnRleHQpIHtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHNldHRpbmdzLmJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgbmd4ICogKGcgKyAxKSwgbmd5ICogKGcgKyAxKSk7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgbmd4ICogKGcgKyAxKSwgbmd5ICogKGcgKyAxKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgICAgICBlbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBzZXR0aW5ncy5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgICAgICAgICBlbC5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvKiBmaWxsIHRoZSBncmlkIHdpdGggZW1wdHkgc3RhdGUgKi9cbiAgICAgICAgZ3ggPSBuZ3g7XG4gICAgICAgIHdoaWxlIChneC0tKSB7XG4gICAgICAgICAgZ3JpZFtneF0gPSBbXTtcbiAgICAgICAgICBneSA9IG5neTtcbiAgICAgICAgICB3aGlsZSAoZ3ktLSkge1xuICAgICAgICAgICAgZ3JpZFtneF1bZ3ldID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIERldGVybWluZSBiZ1BpeGVsIGJ5IGNyZWF0aW5nXG4gICAgICAgICAgIGFub3RoZXIgY2FudmFzIGFuZCBmaWxsIHRoZSBzcGVjaWZpZWQgYmFja2dyb3VuZCBjb2xvci4gKi9cbiAgICAgICAgdmFyIGJjdHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGJjdHguZmlsbFN0eWxlID0gc2V0dGluZ3MuYmFja2dyb3VuZENvbG9yO1xuICAgICAgICBiY3R4LmZpbGxSZWN0KDAsIDAsIDEsIDEpO1xuICAgICAgICB2YXIgYmdQaXhlbCA9IGJjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIDEsIDEpLmRhdGE7XG5cbiAgICAgICAgLyogUmVhZCBiYWNrIHRoZSBwaXhlbHMgb2YgdGhlIGNhbnZhcyB3ZSBnb3QgdG8gdGVsbCB3aGljaCBwYXJ0IG9mIHRoZVxuICAgICAgICAgICBjYW52YXMgaXMgZW1wdHkuXG4gICAgICAgICAgIChubyBjbGVhckNhbnZhcyBvbmx5IHdvcmtzIHdpdGggYSBjYW52YXMsIG5vdCBkaXZzKSAqL1xuICAgICAgICB2YXIgaW1hZ2VEYXRhID1cbiAgICAgICAgICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5nZXRJbWFnZURhdGEoMCwgMCwgbmd4ICogZywgbmd5ICogZykuZGF0YTtcblxuICAgICAgICBneCA9IG5neDtcbiAgICAgICAgdmFyIHgsIHk7XG4gICAgICAgIHdoaWxlIChneC0tKSB7XG4gICAgICAgICAgZ3JpZFtneF0gPSBbXTtcbiAgICAgICAgICBneSA9IG5neTtcbiAgICAgICAgICB3aGlsZSAoZ3ktLSkge1xuICAgICAgICAgICAgeSA9IGc7XG4gICAgICAgICAgICBzaW5nbGVHcmlkTG9vcDogd2hpbGUgKHktLSkge1xuICAgICAgICAgICAgICB4ID0gZztcbiAgICAgICAgICAgICAgd2hpbGUgKHgtLSkge1xuICAgICAgICAgICAgICAgIGkgPSA0O1xuICAgICAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpbWFnZURhdGFbKChneSAqIGcgKyB5KSAqIG5neCAqIGcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGd4ICogZyArIHgpKSAqIDQgKyBpXSAhPT0gYmdQaXhlbFtpXSkge1xuICAgICAgICAgICAgICAgICAgICBncmlkW2d4XVtneV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgc2luZ2xlR3JpZExvb3A7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZ3JpZFtneF1bZ3ldICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICBncmlkW2d4XVtneV0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGltYWdlRGF0YSA9IGJjdHggPSBiZ1BpeGVsID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICAvLyBmaWxsIHRoZSBpbmZvR3JpZCB3aXRoIGVtcHR5IHN0YXRlIGlmIHdlIG5lZWQgaXRcbiAgICAgIGlmIChzZXR0aW5ncy5ob3ZlciB8fCBzZXR0aW5ncy5jbGljaykge1xuXG4gICAgICAgIGludGVyYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAvKiBmaWxsIHRoZSBncmlkIHdpdGggZW1wdHkgc3RhdGUgKi9cbiAgICAgICAgZ3ggPSBuZ3ggKyAxO1xuICAgICAgICB3aGlsZSAoZ3gtLSkge1xuICAgICAgICAgIGluZm9HcmlkW2d4XSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmhvdmVyKSB7XG4gICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHdvcmRjbG91ZGhvdmVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5jbGljaykge1xuICAgICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHdvcmRjbG91ZGNsaWNrKTtcbiAgICAgICAgICBjYW52YXMuc3R5bGUud2Via2l0VGFwSGlnaGxpZ2h0Q29sb3IgPSAncmdiYSgwLCAwLCAwLCAwKSc7XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignd29yZGNsb3Vkc3RhcnQnLCBmdW5jdGlvbiBzdG9wSW50ZXJhY3Rpb24oKSB7XG4gICAgICAgICAgY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dvcmRjbG91ZHN0YXJ0Jywgc3RvcEludGVyYWN0aW9uKTtcblxuICAgICAgICAgIGNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB3b3JkY2xvdWRob3Zlcik7XG4gICAgICAgICAgY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgd29yZGNsb3VkY2xpY2spO1xuICAgICAgICAgIGhvdmVyZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpID0gMDtcbiAgICAgIHZhciBsb29waW5nRnVuY3Rpb24sIHN0b3BwaW5nRnVuY3Rpb247XG4gICAgICBpZiAoc2V0dGluZ3Mud2FpdCAhPT0gMCkge1xuICAgICAgICBsb29waW5nRnVuY3Rpb24gPSB3aW5kb3cuc2V0VGltZW91dDtcbiAgICAgICAgc3RvcHBpbmdGdW5jdGlvbiA9IHdpbmRvdy5jbGVhclRpbWVvdXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb29waW5nRnVuY3Rpb24gPSB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgICAgICBzdG9wcGluZ0Z1bmN0aW9uID0gd2luZG93LmNsZWFySW1tZWRpYXRlO1xuICAgICAgfVxuXG4gICAgICB2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgICAgZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciByZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgfTtcblxuICAgICAgdmFyIGFub3RoZXJXb3JkQ2xvdWRTdGFydCA9IGZ1bmN0aW9uIGFub3RoZXJXb3JkQ2xvdWRTdGFydCgpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcignd29yZGNsb3Vkc3RhcnQnLCBhbm90aGVyV29yZENsb3VkU3RhcnQpO1xuICAgICAgICBzdG9wcGluZ0Z1bmN0aW9uKHRpbWVyKTtcbiAgICAgIH07XG5cbiAgICAgIGFkZEV2ZW50TGlzdGVuZXIoJ3dvcmRjbG91ZHN0YXJ0JywgYW5vdGhlcldvcmRDbG91ZFN0YXJ0KTtcblxuICAgICAgdmFyIHRpbWVyID0gbG9vcGluZ0Z1bmN0aW9uKGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgICAgIGlmIChpID49IHNldHRpbmdzLmxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgc3RvcHBpbmdGdW5jdGlvbih0aW1lcik7XG4gICAgICAgICAgc2VuZEV2ZW50KCd3b3JkY2xvdWRzdG9wJywgZmFsc2UpO1xuICAgICAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dvcmRjbG91ZHN0YXJ0JywgYW5vdGhlcldvcmRDbG91ZFN0YXJ0KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlc2NhcGVUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgdmFyIGRyYXduID0gcHV0V29yZChzZXR0aW5ncy5saXN0W2ldKTtcbiAgICAgICAgdmFyIGNhbmNlbGVkID0gIXNlbmRFdmVudCgnd29yZGNsb3VkZHJhd24nLCB0cnVlLCB7XG4gICAgICAgICAgaXRlbTogc2V0dGluZ3MubGlzdFtpXSwgZHJhd246IGRyYXduIH0pO1xuICAgICAgICBpZiAoZXhjZWVkVGltZSgpIHx8IGNhbmNlbGVkKSB7XG4gICAgICAgICAgc3RvcHBpbmdGdW5jdGlvbih0aW1lcik7XG4gICAgICAgICAgc2V0dGluZ3MuYWJvcnQoKTtcbiAgICAgICAgICBzZW5kRXZlbnQoJ3dvcmRjbG91ZGFib3J0JywgZmFsc2UpO1xuICAgICAgICAgIHNlbmRFdmVudCgnd29yZGNsb3Vkc3RvcCcsIGZhbHNlKTtcbiAgICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyKCd3b3JkY2xvdWRzdGFydCcsIGFub3RoZXJXb3JkQ2xvdWRTdGFydCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgICAgdGltZXIgPSBsb29waW5nRnVuY3Rpb24obG9vcCwgc2V0dGluZ3Mud2FpdCk7XG4gICAgICB9LCBzZXR0aW5ncy53YWl0KTtcbiAgICB9O1xuXG4gICAgLy8gQWxsIHNldCwgc3RhcnQgdGhlIGRyYXdpbmdcbiAgICBzdGFydCgpO1xuICB9O1xuXG4gIFdvcmRDbG91ZC5pc1N1cHBvcnRlZCA9IGlzU3VwcG9ydGVkO1xuICBXb3JkQ2xvdWQubWluRm9udFNpemUgPSBtaW5Gb250U2l6ZTtcblxuICBleHBvcnQgeyBXb3JkQ2xvdWQgfTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7QUFTQSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRTtFQUN4QixNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsU0FBUyxpQkFBaUIsR0FBRztJQUNsRCxPQUFPLE1BQU0sQ0FBQyxjQUFjO0lBQzVCLE1BQU0sQ0FBQyxrQkFBa0I7SUFDekIsTUFBTSxDQUFDLGVBQWU7SUFDdEIsTUFBTSxDQUFDLGFBQWE7SUFDcEIsQ0FBQyxTQUFTLG1CQUFtQixHQUFHO01BQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFO1FBQ25ELE9BQU8sSUFBSSxDQUFDO09BQ2I7O01BRUQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztNQUM1QixJQUFJLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQzs7Ozs7TUFLckMsSUFBSSxjQUFjLEdBQUcsU0FBUyxjQUFjLENBQUMsUUFBUSxFQUFFO1FBQ3JELElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztR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QUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDcEMsTUFBTTtRQUNMLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztPQUNsQzs7OztNQUlELElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDdEMsT0FBTztPQUNSOzs7TUFHRCxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTTtRQUN2QixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7OztNQUdyQixTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Ozs7TUFJekQsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7TUFFVixJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO01BQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFdBQVcsRUFBRTtRQUM5QyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFO1VBQzVCLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRTtZQUNqQixJQUFJLEdBQUcsR0FBRyxFQUFF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
