// Scene Manager - Handles Three.js scene creation, loading, and rendering
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor() {
        this.scenes = new Map(); // Store loaded scenes
        this.previewScenes = new Map(); // Store preview scenes for cards
        this.currentScene = null;
        this.currentSceneConfig = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
        this.animationFrameId = null;
    }

    // Initialize Three.js renderer
    initRenderer(container) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x0a0a0f);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    // Create a scene with lighting
    createScene(config) {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);
        scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, config.lighting.ambient);
        scene.add(ambientLight);

        // Directional light (main light)
        const directionalLight = new THREE.DirectionalLight(0xffffff, config.lighting.directional);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);

        // Hemisphere light for soft fill
        const hemisphereLight = new THREE.HemisphereLight(0x8b9dc3, 0x3a3a52, 0.3);
        scene.add(hemisphereLight);

        // Rim light for depth
        const rimLight = new THREE.DirectionalLight(0x6366f1, 0.4);
        rimLight.position.set(-5, 3, -5);
        scene.add(rimLight);

        return scene;
    }

    // Create camera for immersive view
    createCamera(config, aspect) {
        const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        camera.position.set(
            config.camera.position.x,
            config.camera.position.y,
            config.camera.position.z
        );
        return camera;
    }

    // Create camera for preview (card thumbnails)
    createPreviewCamera(aspect) {
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        camera.position.set(2.5, 2, 2.5);
        return camera;
    }

    // Create orbit controls
    createControls(camera, domElement) {
        const controls = new OrbitControls(camera, domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = 2;
        controls.maxDistance = 20;
        controls.maxPolarAngle = Math.PI / 2;
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0.5;
        return controls;
    }

    // Load GLB model
    async loadModel(modelPath) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                modelPath,
                (gltf) => {
                    const model = gltf.scene;

                    // Enable shadows
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    // Center and scale model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());

                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 4 / maxDim;
                    model.scale.multiplyScalar(scale);

                    box.setFromObject(model);
                    box.getCenter(center);
                    model.position.sub(center);

                    resolve(model);
                },
                (progress) => {
                    // Progress callback
                    const percentComplete = (progress.loaded / progress.total) * 100;
                    console.log(`Loading ${modelPath}: ${percentComplete.toFixed(2)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }

    // Load all scenes for gallery previews
    async loadAllScenes(sceneConfigs, onProgress) {
        const totalScenes = sceneConfigs.length;
        let loadedCount = 0;

        for (const config of sceneConfigs) {
            try {
                const model = await this.loadModel(config.modelPath);
                const scene = this.createScene(config);
                scene.add(model);

                this.scenes.set(config.id, {
                    scene,
                    model,
                    config
                });

                loadedCount++;
                if (onProgress) {
                    onProgress(loadedCount, totalScenes, config.name);
                }
            } catch (error) {
                console.error(`Failed to load scene: ${config.name}`, error);
                loadedCount++;
                if (onProgress) {
                    onProgress(loadedCount, totalScenes, config.name);
                }
            }
        }
    }

    // Create preview renderer for scene cards
    createPreviewRenderer(container, sceneId) {
        const sceneData = this.scenes.get(sceneId);
        if (!sceneData) return null;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const previewRenderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        previewRenderer.setSize(width, height);
        previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        previewRenderer.setClearColor(0x13131a);
        previewRenderer.shadowMap.enabled = true;
        previewRenderer.outputEncoding = THREE.sRGBEncoding;

        const camera = this.createPreviewCamera(width / height);
        const controls = new OrbitControls(camera, previewRenderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;

        // Look at center
        camera.lookAt(0, 1, 0);
        controls.target.set(0, 1, 0);
        controls.update();

        container.appendChild(previewRenderer.domElement);

        // Store preview data
        this.previewScenes.set(sceneId, {
            renderer: previewRenderer,
            camera,
            controls,
            scene: sceneData.scene
        });

        // Start animation loop for this preview
        const animate = () => {
            const previewData = this.previewScenes.get(sceneId);
            if (previewData) {
                previewData.controls.update();
                previewData.renderer.render(previewData.scene, previewData.camera);
                requestAnimationFrame(animate);
            }
        };
        animate();

        return previewRenderer;
    }

    // Display scene in immersive view
    displayScene(sceneId, container) {
        const sceneData = this.scenes.get(sceneId);
        if (!sceneData) {
            console.error(`Scene not found: ${sceneId}`);
            return false;
        }

        // Clean up previous scene
        if (this.controls) {
            this.controls.dispose();
        }

        this.currentScene = sceneData.scene;
        this.currentSceneConfig = sceneData.config;

        // Create or update camera
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = this.createCamera(sceneData.config, aspect);

        // Look at target
        this.camera.lookAt(
            sceneData.config.camera.target.x,
            sceneData.config.camera.target.y,
            sceneData.config.camera.target.z
        );

        // Create controls
        this.controls = this.createControls(this.camera, this.renderer.domElement);
        this.controls.target.set(
            sceneData.config.camera.target.x,
            sceneData.config.camera.target.y,
            sceneData.config.camera.target.z
        );
        this.controls.update();

        // Start render loop
        this.startRenderLoop();

        return true;
    }

    // Start animation render loop
    startRenderLoop() {
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);

            if (this.controls) {
                this.controls.update();
            }

            if (this.currentScene && this.camera && this.renderer) {
                this.renderer.render(this.currentScene, this.camera);
            }
        };
        animate();
    }

    // Stop render loop
    stopRenderLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // Handle window resize
    onWindowResize() {
        if (this.camera && this.renderer) {
            const container = this.renderer.domElement.parentElement;
            if (container) {
                this.camera.aspect = container.clientWidth / container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    }

    // Clean up preview scenes
    cleanupPreviews() {
        this.previewScenes.forEach((previewData, sceneId) => {
            if (previewData.controls) {
                previewData.controls.dispose();
            }
            if (previewData.renderer) {
                previewData.renderer.dispose();
            }
        });
        this.previewScenes.clear();
    }

    // Get current scene config
    getCurrentSceneConfig() {
        return this.currentSceneConfig;
    }

    // Dispose everything
    dispose() {
        this.stopRenderLoop();
        this.cleanupPreviews();

        if (this.controls) {
            this.controls.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        this.scenes.clear();
    }
}
