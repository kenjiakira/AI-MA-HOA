document.addEventListener('DOMContentLoaded', () => {
  // Initialize Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  // Create renderer and set size
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById('bg-canvas').appendChild(renderer.domElement);
  
  // Camera position
  camera.position.z = 30;
  
  // Create stars
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.25,
    transparent: true,
    opacity: 0.8,
  });
  
  const starCount = 1500;
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 100;     // x
    starPositions[i+1] = (Math.random() - 0.5) * 100;   // y
    starPositions[i+2] = (Math.random() - 0.5) * 100;   // z
  }
  
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  
  // Create nebulas (glowing spheres)
  function createNebula(color, size, position, intensity) {
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.15 * intensity,
    });
    const nebulaGeometry = new THREE.SphereGeometry(size, 32, 32);
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.set(position.x, position.y, position.z);
    scene.add(nebula);
    return nebula;
  }
  
  // Create multiple nebulas with different colors and positions
  const nebulas = [
    createNebula(0xff7eeb, 10, { x: -15, y: 10, z: -30 }, 1), // Pink (Aki)
    createNebula(0x7ef2ff, 8, { x: 20, y: -15, z: -20 }, 0.8), // Blue (Miko)
    createNebula(0x8a5fff, 15, { x: 0, y: 0, z: -50 }, 0.6), // Purple
    createNebula(0xff5f8a, 12, { x: -25, y: -20, z: -40 }, 0.7), // Pink-red
    createNebula(0x5f78ff, 9, { x: 30, y: 25, z: -35 }, 0.5), // Blue-purple
  ];
  
  // Create magical dust particles
  const dustGeometry = new THREE.BufferGeometry();
  const dustCount = 300;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSizes = new Float32Array(dustCount);
  const dustColors = new Float32Array(dustCount * 3);
  
  // Color palette for dust particles
  const dustColorPalette = [
    new THREE.Color(0xff7eeb), // Pink (Aki)
    new THREE.Color(0x7ef2ff), // Blue (Miko)
    new THREE.Color(0x8a5fff), // Purple
    new THREE.Color(0xc27eff), // Lavender
  ];
  
  for (let i = 0; i < dustCount; i++) {
    const i3 = i * 3;
    dustPositions[i3] = (Math.random() - 0.5) * 70;     // x
    dustPositions[i3+1] = (Math.random() - 0.5) * 70;   // y
    dustPositions[i3+2] = (Math.random() - 0.5) * 50;   // z
    
    dustSizes[i] = Math.random() * 0.5 + 0.1;
    
    // Assign a random color from the palette
    const color = dustColorPalette[Math.floor(Math.random() * dustColorPalette.length)];
    dustColors[i3] = color.r;
    dustColors[i3+1] = color.g;
    dustColors[i3+2] = color.b;
  }
  
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
  dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
  
  // Custom shader material for the dust particles
  const dustMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time;
      
      void main() {
        vColor = color;
        
        // Simple animation
        vec3 pos = position;
        float yMovement = sin(time * 0.3 + position.x) * 0.5;
        float xMovement = cos(time * 0.3 + position.y) * 0.5;
        pos.y += yMovement;
        pos.x += xMovement;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      
      void main() {
        // Create a circular point
        float r = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (r > 0.5) discard;
        
        // Add glow effect
        float strength = 1.0 - (r / 0.5);
        gl_FragColor = vec4(vColor, strength);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);
  
  // Add fog to the scene for depth
  scene.fog = new THREE.FogExp2(0x0a0a14, 0.0025);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  // Animation loop
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Rotate stars slowly
    stars.rotation.y = elapsedTime * 0.05;
    stars.rotation.x = elapsedTime * 0.02;
    
    // Animate nebulas
    nebulas.forEach((nebula, i) => {
      nebula.scale.x = 1 + Math.sin(elapsedTime * 0.2 + i) * 0.1;
      nebula.scale.y = 1 + Math.sin(elapsedTime * 0.3 + i) * 0.1;
      nebula.scale.z = 1 + Math.sin(elapsedTime * 0.4 + i) * 0.1;
    });
    
    // Update dust particles
    dust.material.uniforms.time.value = elapsedTime;
    
    // Render scene
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Mouse interaction to move camera slightly based on mouse position
  document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Gently move camera based on mouse position
    const targetX = mouseX * 2;
    const targetY = mouseY * 2;
    
    camera.position.x += (targetX - camera.position.x) * 0.01;
    camera.position.y += (targetY - camera.position.y) * 0.01;
    
    camera.lookAt(scene.position);
  });
});
