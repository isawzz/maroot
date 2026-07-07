
function fillWithTessellation(div, n, type) {
  const container = typeof div === 'string' ? document.getElementById(div) : div;
  container.innerHTML = ''; // Clear previous content
  
  // Ensure the container has relative positioning for absolute tiles
  container.style.position = 'relative';
  container.style.overflow = 'hidden';

  const rect = container.getBoundingClientRect();
  const step = rect.width / n;

  if (type.toLowerCase() === 'cairo') {
    // Cairo tiling consists of pentagons. 
    // We can simulate this by tiling 2x2 blocks of specific orientations.
    for (let i = -1; i <= n + 1; i++) {
      for (let j = -1; j <= n + 1; j++) {
        const x = i * step;
        const y = j * step;
        
        // Create the tile element using internal mDom pattern
        let tile = document.createElement('div');
        tile.style.position = 'absolute';
        tile.style.width = `${step + 1}px`; // +1 to prevent sub-pixel gaps
        tile.style.height = `${step + 1}px`;
        tile.style.left = `${x}px`;
        tile.style.top = `${y}px`;
        tile.style.backgroundColor = (i + j) % 2 === 0 ? '#3498db' : '#2ecc71';
        tile.style.border = '0.5px solid rgba(255,255,255,0.3)';

        // Cairo Pentagons logic: 
        // Alternate clip-paths based on grid position to form the characteristic 
        // interlocking pentagonal pattern found in Cairo tiling.
        if ((i + j) % 2 === 0) {
          tile.style.clipPath = 'polygon(0% 50%, 35% 0%, 100% 0%, 100% 100%, 35% 100%)';
        } else {
          tile.style.clipPath = 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)';
        }

        container.appendChild(tile);
      }
    }
  } else {
    // Fallback: Default to a simple square grid if type is unknown
    // Similar to _createGrid logic in the source
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let tile = document.createElement('div');
        tile.style.position = 'absolute';
        tile.style.width = `${step}px`;
        tile.style.height = `${step}px`;
        tile.style.left = `${i * step}px`;
        tile.style.top = `${j * step}px`;
        tile.style.border = '1px solid black';
        tile.style.backgroundColor = (i + j) % 2 === 0 ? '#eee' : '#ccc';
        container.appendChild(tile);
      }
    }
  }
}
