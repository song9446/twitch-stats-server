const COLOR_PALETTE = [
'#a6cee3',
'#1f78b4',
'#b2df8a',
'#33a02c',
'#fb9a99',
'#e31a1c',
'#fdbf6f',
'#ff7f00',
'#cab2d6',
'#6a3d9a',
'#ffff99',
'#b15928',
];
const PATTERNS = [
  [[1,1,1,1],
   [1,1,1,1],
   [1,1,1,1],
   [1,1,1,1]],
  [[1,0,1,1],
   [1,1,0,1],
   [1,1,1,0],
   [0,1,1,1]],
  [[1,0,1,0],
   [0,1,0,1],
   [1,0,1,0],
   [0,1,0,1]],
  [[1,1,1,1],
   [0,0,0,0],
   [1,1,1,1],
   [0,0,0,0]],
  [[0,1,0,1],
   [0,1,0,1],
   [0,1,0,1],
   [0,1,0,1]],
];
  const buffer_canvas = document.createElement("canvas"),
        buffer_ctx = buffer_canvas.getContext("2d");
  buffer_canvas.width = 4;
  buffer_canvas.height = 4;
  const FILL_STYLES = [];
  //const FILL_COLORS = [];
  for(let i=0; i<PATTERNS.length; ++i)
    for(let j=0; j<COLOR_PALETTE.length; ++j){
       FILL_STYLES.push(gen_pattern(i, COLOR_PALETTE[j], COLOR_PALETTE[(j+1)%COLOR_PALETTE.length]));
       //FILL_COLORS.push(COLOR_PALETTE[j]);
    }
  function gen_pattern(index, color1, color2=null, alpha=1.0) {
    buffer_canvas.width = PATTERNS[index].length;
    buffer_canvas.height = PATTERNS[0].length;
    buffer_ctx.clearRect(0, 0, buffer_canvas.width, buffer_canvas.height);
    buffer_ctx.fillStyle = color1;
    buffer_ctx.globalAlpha = alpha;
    for(let i=0; i<buffer_canvas.width; ++i)
      for(let j=0; j<buffer_canvas.height; ++j)
        if(PATTERNS[index][i][j])
          buffer_ctx.fillRect(i, j, 1, 1);
    if(color2){
      buffer_ctx.fillStyle = color2;
      for(let i=0; i<buffer_canvas.width; ++i)
        for(let j=0; j<buffer_canvas.height; ++j)
          if(!PATTERNS[index][i][j])
            buffer_ctx.fillRect(i, j, 1, 1);
    }
    return buffer_ctx.createPattern(buffer_canvas, "repeat");
  }

const Patterns = FILL_STYLES;

export { Patterns };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FudmFzUGF0dGVybnMuMGY5MDQ3MTEuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL0NhbnZhc1BhdHRlcm5zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IENPTE9SX1BBTEVUVEUgPSBbXG4nI2E2Y2VlMycsXG4nIzFmNzhiNCcsXG4nI2IyZGY4YScsXG4nIzMzYTAyYycsXG4nI2ZiOWE5OScsXG4nI2UzMWExYycsXG4nI2ZkYmY2ZicsXG4nI2ZmN2YwMCcsXG4nI2NhYjJkNicsXG4nIzZhM2Q5YScsXG4nI2ZmZmY5OScsXG4nI2IxNTkyOCcsXG5dO1xuY29uc3QgUEFUVEVSTlMgPSBbXG4gIFtbMSwxLDEsMV0sXG4gICBbMSwxLDEsMV0sXG4gICBbMSwxLDEsMV0sXG4gICBbMSwxLDEsMV1dLFxuICBbWzEsMCwxLDFdLFxuICAgWzEsMSwwLDFdLFxuICAgWzEsMSwxLDBdLFxuICAgWzAsMSwxLDFdXSxcbiAgW1sxLDAsMSwwXSxcbiAgIFswLDEsMCwxXSxcbiAgIFsxLDAsMSwwXSxcbiAgIFswLDEsMCwxXV0sXG4gIFtbMSwxLDEsMV0sXG4gICBbMCwwLDAsMF0sXG4gICBbMSwxLDEsMV0sXG4gICBbMCwwLDAsMF1dLFxuICBbWzAsMSwwLDFdLFxuICAgWzAsMSwwLDFdLFxuICAgWzAsMSwwLDFdLFxuICAgWzAsMSwwLDFdXSxcbl07XG4gIGNvbnN0IGJ1ZmZlcl9jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLFxuICAgICAgICBidWZmZXJfY3R4ID0gYnVmZmVyX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gIGJ1ZmZlcl9jYW52YXMud2lkdGggPSA0O1xuICBidWZmZXJfY2FudmFzLmhlaWdodCA9IDQ7XG4gIGNvbnN0IEZJTExfU1RZTEVTID0gW107XG4gIC8vY29uc3QgRklMTF9DT0xPUlMgPSBbXTtcbiAgZm9yKGxldCBpPTA7IGk8UEFUVEVSTlMubGVuZ3RoOyArK2kpXG4gICAgZm9yKGxldCBqPTA7IGo8Q09MT1JfUEFMRVRURS5sZW5ndGg7ICsrail7XG4gICAgICAgRklMTF9TVFlMRVMucHVzaChnZW5fcGF0dGVybihpLCBDT0xPUl9QQUxFVFRFW2pdLCBDT0xPUl9QQUxFVFRFWyhqKzEpJUNPTE9SX1BBTEVUVEUubGVuZ3RoXSkpO1xuICAgICAgIC8vRklMTF9DT0xPUlMucHVzaChDT0xPUl9QQUxFVFRFW2pdKTtcbiAgICB9XG4gIGZ1bmN0aW9uIGdlbl9wYXR0ZXJuKGluZGV4LCBjb2xvcjEsIGNvbG9yMj1udWxsLCBhbHBoYT0xLjApIHtcbiAgICBidWZmZXJfY2FudmFzLndpZHRoID0gUEFUVEVSTlNbaW5kZXhdLmxlbmd0aDtcbiAgICBidWZmZXJfY2FudmFzLmhlaWdodCA9IFBBVFRFUk5TWzBdLmxlbmd0aDtcbiAgICBidWZmZXJfY3R4LmNsZWFyUmVjdCgwLCAwLCBidWZmZXJfY2FudmFzLndpZHRoLCBidWZmZXJfY2FudmFzLmhlaWdodCk7XG4gICAgYnVmZmVyX2N0eC5maWxsU3R5bGUgPSBjb2xvcjE7XG4gICAgYnVmZmVyX2N0eC5nbG9iYWxBbHBoYSA9IGFscGhhO1xuICAgIGZvcihsZXQgaT0wOyBpPGJ1ZmZlcl9jYW52YXMud2lkdGg7ICsraSlcbiAgICAgIGZvcihsZXQgaj0wOyBqPGJ1ZmZlcl9jYW52YXMuaGVpZ2h0OyArK2opXG4gICAgICAgIGlmKFBBVFRFUk5TW2luZGV4XVtpXVtqXSlcbiAgICAgICAgICBidWZmZXJfY3R4LmZpbGxSZWN0KGksIGosIDEsIDEpO1xuICAgIGlmKGNvbG9yMil7XG4gICAgICBidWZmZXJfY3R4LmZpbGxTdHlsZSA9IGNvbG9yMjtcbiAgICAgIGZvcihsZXQgaT0wOyBpPGJ1ZmZlcl9jYW52YXMud2lkdGg7ICsraSlcbiAgICAgICAgZm9yKGxldCBqPTA7IGo8YnVmZmVyX2NhbnZhcy5oZWlnaHQ7ICsrailcbiAgICAgICAgICBpZighUEFUVEVSTlNbaW5kZXhdW2ldW2pdKVxuICAgICAgICAgICAgYnVmZmVyX2N0eC5maWxsUmVjdChpLCBqLCAxLCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlcl9jdHguY3JlYXRlUGF0dGVybihidWZmZXJfY2FudmFzLCBcInJlcGVhdFwiKTtcbiAgfVxuXG5leHBvcnQgY29uc3QgUGF0dGVybnMgPSBGSUxMX1NUWUxFUztcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLGFBQWEsR0FBRztBQUN0QixTQUFTO0FBQ1QsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1QsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1QsU0FBUztBQUNULFNBQVM7QUFDVCxTQUFTO0FBQ1QsU0FBUztBQUNULFNBQVM7Q0FDUixDQUFDO0FBQ0YsTUFBTSxRQUFRLEdBQUc7RUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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
