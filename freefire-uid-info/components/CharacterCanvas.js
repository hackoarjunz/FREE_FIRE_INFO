import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CharacterCanvas({ dressUrl }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemi.position.set(0, 2, 0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    scene.add(dir);

    // Simple ground
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.1, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.75;
    scene.add(ground);

    // Character made from primitives (head, torso, arms, legs)
    const group = new THREE.Group();

    // Head
    const headGeo = new THREE.SphereGeometry(0.28, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd1b3 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.3, 0);
    group.add(head);

    // Torso (where we apply the dress texture)
    const torsoGeo = new THREE.BoxGeometry(0.9, 1.0, 0.45);
    let torsoMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.6, 0);
    group.add(torso);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const leftArm = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: 0xffd1b3 }));
    const rightArm = leftArm.clone();
    leftArm.position.set(-0.65, 0.7, 0);
    rightArm.position.set(0.65, 0.7, 0);
    group.add(leftArm, rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.28);
    const leftLeg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
    const rightLeg = leftLeg.clone();
    leftLeg.position.set(-0.2, -0.25, 0);
    rightLeg.position.set(0.2, -0.25, 0);
    group.add(leftLeg, rightLeg);

    scene.add(group);

    // Load dress texture if provided and map to front of torso
    const applyDressTexture = (url) => {
      if (!url) return;
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = "";
      loader.load(
        url,
        (tex) => {
          // create a material that uses the texture; clamp to front and back
          const mat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.2, roughness: 0.6 });
          torso.material = mat;
        },
        undefined,
        (err) => {
          console.warn("Failed to load dress texture:", err);
        }
      );
    };

    applyDressTexture(dressUrl);

    // Responsive
    const onResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Animation
    let req = null;
    const clock = new THREE.Clock();
    function animate() {
      if (!mounted) return;
      const t = clock.getElapsedTime();
      // gentle bob and rotation
      group.rotation.y = Math.sin(t * 0.6) * 0.2;
      group.position.y = Math.sin(t * 1.5) * 0.03;
      renderer.render(scene, camera);
      req = requestAnimationFrame(animate);
    }
    animate();

    // Cleanup
    return () => {
      mounted = false;
      window.removeEventListener("resize", onResize);
      if (req) cancelAnimationFrame(req);
      renderer.dispose();
      // remove canvas
      try { mount.removeChild(renderer.domElement); } catch(e) {}
    };
  }, [dressUrl]);

  return (
    <div style={{ width: "100%", height: "320px", borderRadius: 12, overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.03))" }} ref={mountRef} />
  );
}
