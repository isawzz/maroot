function displayOrbitCentered(containerId, n, radius = 300, dotSize = 140, centerSize = 400, padding = 10) {
  const container = document.getElementById(containerId);
  container.style.position = 'relative';

  // 1. Generate points starting at the bottom (PI / 2)
  let points = [];
  for (let i = 0; i < n; i++) {
    // Adding (PI / 2) shifts the 0-index dot to the bottom center
    const angle = (i * 2 * Math.PI) / n + (Math.PI / 2);
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }

  // 2. Calculate global boundaries (Center Dot vs Orbiting Dots)
  const halfCenter = centerSize / 2;
  const halfDot = dotSize / 2;

  let minX = -halfCenter, maxX = halfCenter;
  let minY = -halfCenter, maxY = halfCenter;

  points.forEach(p => {
    minX = Math.min(minX, p.x - halfDot);
    maxX = Math.max(maxX, p.x + halfDot);
    minY = Math.min(minY, p.y - halfDot);
    maxY = Math.max(maxY, p.y + halfDot);
  });

  // 3. Final Dimensions including padding
  const totalW = (maxX - minX) + (padding * 2);
  const totalH = (maxY - minY) + (padding * 2);

  // 4. Calculate the visual center relative to the top-left
  const centerX = padding - minX;
  const centerY = padding - minY;

  // Render Center
  const dCenter = document.createElement('div');
  dCenter.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: ${centerX}px;
    width: ${centerSize}px;
    height: ${centerSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  `;
  container.appendChild(dCenter);

  // Render Orbiters
  points.forEach(p => {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      top: ${centerY}px;
      left: ${centerX}px;
      width: ${dotSize}px;
      height: ${dotSize}px;
      background: blue;
      border-radius: 50%;
      transform: translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px));
    `;
    container.appendChild(dot);
  });

  // Apply dimensions to the container to ensure it encapsulates the content
  container.style.width = `${totalW}px`;
  container.style.height = `${totalH}px`;

  return { w: totalW, h: totalH, centerX, centerY };
}

