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

export const Patterns = FILL_STYLES;
