document.addEventListener("DOMContentLoaded", () => {

    fetch('header.html')
      .then(res => res.text())
      .then(html => {
        document.getElementById('header').innerHTML = html;

        const burger = document.querySelector('.burger-menu');
        const overlay = document.querySelector('.mobile-nav-overlay');

        burger.addEventListener('click', () => {
          burger.classList.toggle('active');
          overlay.classList.toggle('active');
          document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
        });
      });

    // --- Scale pics-container to fit viewport width ---
    const DESIGN_WIDTH = 1300;   // native layout width (px)
    const DESIGN_HEIGHT = 7220;  // native layout height (px)
    const MAX_WIDTH = 1600;      // viewport width at which scaling stops (px)

    const picsContainer = document.querySelector('.pics-container');
    const pageEl = document.querySelector('.page');

    function scalePicsContainer() {
        if (!picsContainer || !pageEl) return;
        const vw = window.innerWidth;
        const s = Math.min((vw * 0.84) / DESIGN_WIDTH, MAX_WIDTH / DESIGN_WIDTH);
        const scaledWidth = DESIGN_WIDTH * s;
        const ml = Math.max(0, (vw - scaledWidth) / 2);

        picsContainer.style.transform = `scale(${s})`;
        picsContainer.style.marginLeft = `${ml}px`;
        pageEl.style.height = `${DESIGN_HEIGHT * s + 50}px`;
    }

    window.addEventListener('resize', scalePicsContainer);
    scalePicsContainer();

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startTranslateX = 0;
    let startTranslateY = 0;

    const MIN_SCALE = 1;
    const MAX_SCALE = 5;
    const ZOOM_SPEED = 0.1;

    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    function applyTransform() {
        if (scale <= 1) {
            lightboxImg.style.transform = `scale(${scale})`;
            lightboxImg.style.cursor = "default";
        } else {
            lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            lightboxImg.style.cursor = isDragging ? "grabbing" : "grab";
        }
    }

    function clampTranslation() {
        const imgWidth = lightboxImg.offsetWidth;
        const imgHeight = lightboxImg.offsetHeight;
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;

        const scaledW = imgWidth * scale;
        const scaledH = imgHeight * scale;

        // Allow panning in both directions, clamping so the image
        // stays within the viewport (if smaller) or covers it (if larger)
        const maxPanX = Math.abs(scaledW - viewW) / 2;
        translateX = Math.max(-maxPanX, Math.min(maxPanX, translateX));

        const maxPanY = Math.abs(scaledH - viewH) / 2;
        translateY = Math.max(-maxPanY, Math.min(maxPanY, translateY));
    }

    // Fade in images on load
    document.querySelectorAll(".image").forEach((img) => {
        if (img.complete) {
            img.classList.add("loaded");
        } else {
            img.addEventListener("load", () => img.classList.add("loaded"));
        }
    });

    // Open lightbox
    document.querySelectorAll(".image").forEach((img) => {
        img.addEventListener("click", () => {
            lightboxImg.src = img.src;
            lightbox.classList.remove("hidden");
            resetZoom();
            document.body.style.overflow = "hidden";
        });
    });

    // Close lightbox
    lightbox.addEventListener("click", (e) => {
        if (e.target !== lightboxImg) {
            lightbox.classList.add("hidden");
            lightboxImg.src = "";
            resetZoom();
            document.body.style.overflow = "";
        }
    });

    // Zoom with mouse wheel
    lightbox.addEventListener("wheel", (e) => {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));

        if (newScale !== scale) {
            // Zoom toward mouse position
            const rect = lightboxImg.getBoundingClientRect();
            const imgCenterX = rect.left + rect.width / 2;
            const imgCenterY = rect.top + rect.height / 2;

            // Mouse offset from image center
            const mouseOffsetX = e.clientX - imgCenterX;
            const mouseOffsetY = e.clientY - imgCenterY;

            const scaleRatio = newScale / scale;
            translateX = translateX - mouseOffsetX * (scaleRatio - 1);
            translateY = translateY - mouseOffsetY * (scaleRatio - 1);

            scale = newScale;

            if (scale <= MIN_SCALE) {
                translateX = 0;
                translateY = 0;
            } else {
                clampTranslation();
            }

            applyTransform();
        }
    }, { passive: false });

    // Drag to pan
    lightboxImg.addEventListener("mousedown", (e) => {
        if (scale <= 1) return;
        e.preventDefault();
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        startTranslateX = translateX;
        startTranslateY = translateY;
        lightboxImg.classList.add("dragging");
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        translateX = startTranslateX + dx;
        translateY = startTranslateY + dy;
        clampTranslation();
        applyTransform();
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        lightboxImg.classList.remove("dragging");
        applyTransform();
    });
});
