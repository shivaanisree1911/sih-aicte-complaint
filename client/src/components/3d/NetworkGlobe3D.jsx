import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function NetworkGlobe3D({ className = '', height = '360px' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 170;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Group for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Inner Wireframe Icosahedron (Geodesic Network)
    const icoGeometry = new THREE.IcosahedronGeometry(48, 2);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    globeGroup.add(icoMesh);

    // 2. Outer Core Nodes (Representing AICTE Institutions & Bureaus)
    const nodeCount = 42;
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);

    const colorCyan = new THREE.Color(0x06b6d4);
    const colorAmber = new THREE.Color(0xf59e0b);
    const colorRose = new THREE.Color(0xf43f5e);
    const colorBlue = new THREE.Color(0x3b82f6);

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 48 + (Math.random() - 0.5) * 3;

      nodePositions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      nodePositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      nodePositions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = i % 7 === 0 ? colorRose : i % 5 === 0 ? colorAmber : i % 3 === 0 ? colorCyan : colorBlue;
      nodeColors[i * 3] = chosenColor.r;
      nodeColors[i * 3 + 1] = chosenColor.g;
      nodeColors[i * 3 + 2] = chosenColor.b;
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    globeGroup.add(nodes);

    // 3. Orbital Ring Particles (Telemetry Data Stream)
    const ringCount = 180;
    const ringGeometry = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(ringCount * 3);

    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const r = 68 + (Math.random() - 0.5) * 6;
      ringPositions[i * 3] = Math.cos(angle) * r;
      ringPositions[i * 3 + 1] = (Math.sin(angle * 2) * 8) + (Math.random() - 0.5) * 4;
      ringPositions[i * 3 + 2] = Math.sin(angle) * r;
    }

    ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    const ringMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.6,
      transparent: true,
      opacity: 0.65
    });
    const ring = new THREE.Points(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 4;
    ring.rotation.y = Math.PI / 6;
    globeGroup.add(ring);

    // 4. Secondary Counter-Orbital Ring
    const ring2 = ring.clone();
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    globeGroup.add(ring2);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = mouseX * 0.4;
      targetRotationX = -mouseY * 0.3;
    };

    currentMount.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Continuous autonomous rotation
      globeGroup.rotation.y += 0.0035;
      ring.rotation.z -= 0.004;
      ring2.rotation.z += 0.003;

      // Smooth mouse follow interpolation
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y * 0.05) * 0.02;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x * 0.05) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeEventListener('mousemove', onMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full overflow-hidden pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
      style={{ height }}
    />
  );
}
