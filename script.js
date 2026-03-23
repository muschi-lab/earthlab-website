/* ============================================
   EARTHLAB — Script v2
   Enhanced: countdown, globe, FAQ
   ============================================ */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        const spans = toggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// Countdown Timer
// Set deadline to May 15, 2026, 23:59 UTC (adjust as needed)
const DEADLINE = new Date('2026-05-15T23:59:00Z').getTime();

function updateCountdown() {
    const now = Date.now();
    const diff = DEADLINE - now;

    if (diff <= 0) {
        document.querySelectorAll('.countdown-number').forEach(el => el.textContent = '00');
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = n => String(n).padStart(2, '0');

    // Hero countdown
    const d1 = document.getElementById('cd-days');
    const h1 = document.getElementById('cd-hours');
    const m1 = document.getElementById('cd-mins');
    const s1 = document.getElementById('cd-secs');
    if (d1) d1.textContent = pad(days);
    if (h1) h1.textContent = pad(hours);
    if (m1) m1.textContent = pad(mins);
    if (s1) s1.textContent = pad(secs);

    // Apply section countdown
    const d2 = document.getElementById('cd2-days');
    const h2 = document.getElementById('cd2-hours');
    const m2 = document.getElementById('cd2-mins');
    const s2 = document.getElementById('cd2-secs');
    if (d2) d2.textContent = pad(days);
    if (h2) h2.textContent = pad(hours);
    if (m2) m2.textContent = pad(mins);
    if (s2) s2.textContent = pad(secs);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Scroll-triggered fade-in animations
const fadeElements = document.querySelectorAll(
    '.highlight-card, .timeline-item, .topic-card, .organiser-card, .detail-item, .supporter, .stat, .faq-item'
);
fadeElements.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
                const i = Array.from(siblings).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 100);
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
);

fadeElements.forEach(el => observer.observe(el));

// ============================================
// Three.js Interactive Globe — Textured Earth
// ============================================
function initGlobe() {
    if (window.innerWidth < 768 || typeof THREE === 'undefined') return;

    const container = document.getElementById('globe-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold Earth (so it rotates together)
    const earthGroup = new THREE.Group();
    // Tilt the earth ~23.5 degrees like real axial tilt
    earthGroup.rotation.z = 23.5 * (Math.PI / 180);
    scene.add(earthGroup);

    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('assets/sst_trends_texture.png?v=3');

    // Textured Earth sphere
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        shininess: 10,
        specular: 0x111122,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earth);

    // Atmosphere glow — multiple layers for a richer effect
    const atmosVertexShader = `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const atmosFragmentShader = `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            gl_FragColor = vec4(0.16, 0.62, 0.56, 1.0) * intensity;
        }
    `;
    const atmosMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosVertexShader,
        fragmentShader: atmosFragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 64), atmosMaterial);
    scene.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x8899aa, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x2a9d8f, 0.4);
    rimLight.position.set(-5, -1, -3);
    scene.add(rimLight);

    // Mouse tracking for parallax
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.4;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.2;
    });

    // Pause globe rendering when off-screen
    let globeVisible = true;
    const globeObserver = new IntersectionObserver(
        ([entry]) => { globeVisible = entry.isIntersecting; },
        { threshold: 0 }
    );
    globeObserver.observe(container);

    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        if (!globeVisible) return;
        time += 0.016;

        // Steady rotation
        earthGroup.rotation.y += 0.003;

        // Mouse-driven tilt
        const targetX = mouseY * 0.3;
        const targetY = mouseX * 0.3;
        earthGroup.rotation.x += (targetX - earthGroup.rotation.x + 23.5 * Math.PI / 180) * 0.02;

        // Atmosphere follows camera but doesn't rotate with earth
        atmosphere.rotation.y = earthGroup.rotation.y * 0.1;

        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            container.style.display = 'none';
            return;
        }
        container.style.display = '';
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Initialize globe — wait for Three.js
if (document.readyState === 'complete') {
    initGlobe();
} else {
    window.addEventListener('load', initGlobe);
}

// Smooth scroll active state
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) {
            if (scrollPos >= top && scrollPos < top + height) {
                link.style.color = '#ffffff';
            } else {
                link.style.color = '';
            }
        }
    });
});
