import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeJsViewerProps {
  imageUrl: string;
}

const ThreeJsViewer: React.FC<ThreeJsViewerProps> = ({ imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 1.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageUrl);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // Create a plane with the texture
    const geometry = new THREE.BoxGeometry(1, 1, 0.1);
    const material = [
      new THREE.MeshBasicMaterial({ color: 0x333333 }), // right
      new THREE.MeshBasicMaterial({ color: 0x333333 }), // left
      new THREE.MeshBasicMaterial({ color: 0x333333 }), // top
      new THREE.MeshBasicMaterial({ color: 0x333333 }), // bottom
      new THREE.MeshBasicMaterial({ map: texture }), // front
      new THREE.MeshBasicMaterial({ color: 0x333333 }), // back
    ];
    
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Rotate the cube
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [imageUrl]);

  return <div ref={containerRef} className="w-full h-full"></div>;
};

export default ThreeJsViewer;
