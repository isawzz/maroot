
function _mTranslate(child, newParent, ms = 800) {
	return new Promise((resolve) => {
		let [dx, dy] = get_screen_distance(child, newParent);
		const onend = () => { resolve(child); };
		mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], onend, ms, 'ease');
	});
}
function mTranslate(child, newParent, ms = 800) {
	return new Promise((resolve) => {
		let resolved = false;

		const finalize = () => {
			if (resolved) return;
			resolved = true;
			resolve(child);
		};

		let [dx, dy] = get_screen_distance(child, newParent);

		// Safety: If the animation fails to trigger onend, 
		// force resolve after the duration + 50ms
		console.log(ms)
		//setTimeout(finalize, ms + 50);

		mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], finalize, ms, 'ease');
	});
}
function _mTranslate(child, newParent, ms = 2800) {
  return new Promise((resolve) => {
    let resolved = false;

    // 1. Calculate distance
    let [dx, dy] = get_screen_distance(child, newParent);

    const finalize = () => {
      if (resolved) return;
      resolved = true;
      
      // Reset all transform/filter styles before appending
      // child.style.transform = '';
      // child.style.filter = '';
      // child.style.zIndex = '';
      // mAppend(newParent, child);
      resolve(child);
    };

    // 2. Lift the card (Z-index and Shadow)
    child.style.zIndex = 1000;
    
    // We animate transform (move + scale) and filter (shadow)
    // The shadow uses a blur that increases with "height"
    const transformTarget = `translateX(${dx}px) translateY(${dy}px) scale(1.05)`;
    const shadowTarget = `drop-shadow(${dx/20}px ${dy/20}px 10px rgba(0,0,0,0.4))`;

    // Safety timeout
    setTimeout(finalize, ms + 50);

    // 3. Execute combined animation
    // Note: If mAnimate only handles one property, you can set the filter manually
    child.style.transition = `transform ${ms}ms ease, filter ${ms}ms ease`;
    
    requestAnimationFrame(() => {
        child.style.transform = transformTarget;
        child.style.filter = shadowTarget;
    });

    // Listen for the end of the transform transition
    child.addEventListener('transitionend', finalize, { once: true });
  });
}