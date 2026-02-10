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

        if (vw <= 768) {
            picsContainer.style.transform = '';
            picsContainer.style.marginLeft = '';
            pageEl.style.height = '';
            return;
        }

        const s = Math.min((vw * 0.84) / DESIGN_WIDTH, MAX_WIDTH / DESIGN_WIDTH);
        const scaledWidth = DESIGN_WIDTH * s;
        const ml = Math.max(0, (vw - scaledWidth) / 2);

        picsContainer.style.transform = `scale(${s})`;
        picsContainer.style.marginLeft = `${ml}px`;
        pageEl.style.height = `${DESIGN_HEIGHT * s + 50}px`;
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeTimer);
        resizeTimer = requestAnimationFrame(scalePicsContainer);
    });
    scalePicsContainer();

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    // Photos per folder for lightbox navigation
    const folderPhotos = {
        'assets/photos/0_0nums': ['1.2.webp', '15.webp', '16.webp'],
        'assets/photos/0_1_nums2': ['4.webp', '8.webp'],
        'assets/photos/01_Go_See_Prima': ['PG_JS_GoSee13.webp', 'PG_JS_GoSee21.webp'],
        'assets/photos/1_Go_See_24_7': ['Go_See_10.24_7.webp', 'Go_See_10.24_12.webp', 'Go_See_10.24_24.webp'],
        'assets/photos/2_insta_fog': ['Insta_FOG_PG_028.webp', 'Insta_FOG_PG_038.webp', 'Insta_FOG_PG_042.webp', 'Insta_FOG_PG_052.webp'],
        'assets/photos/3_Go_See_street': ['PG_JS_GoSee6.webp', 'PG_JS_GoSee7.webp'],
        'assets/photos/4_Go_See_Comm': ['PietroGroff_GoSEEComm_042_1.webp', '-9.webp', 'PietroGroff_GoSEEComm_063.webp'],
        'assets/photos/5_IB': ['PietroGroff_IB_Instagram_LT_004.webp', 'PietroGroff_IB_Instagram_LT_023.webp', 'PietroGroff_IB_Instagram_LT_048.webp'],
        'assets/photos/6_MAX&Co': ['PietroGroff_MAX&Co_LT_001.webp', 'PietroGroff_MAX&Co_LT_004.webp', 'PietroGroff_MAX&Co_LT_008.webp', 'PietroGroff_MAX&Co_LT_009.webp'],
        'assets/photos/7_Motivi': ['PietroGroff_MotiviPreFall_LT_004.webp'],
        'assets/photos/8_QuickProof': ['PietroGroff_QuickProof_0008_1.webp', 'PietroGroff_QuickProof_0012.webp', 'PietroGroff_QuickProof_0020.webp', 'PietroGroff_QuickProof_0022_1.webp'],
        'assets/photos/9_PLM': ['PLM_PietroGroff_Quickproof011.webp', 'PLM_PietroGroff_Quickproof013.webp', 'PLM_PietroGroff_Quickproof019.webp'],
        'assets/photos/10_Sicky': ['Sicky__1.webp'],
        'assets/photos/11_Webster': ['The_Webster_PietroGroff_06.webp', 'The_Webster_PietroGroff_12.webp', 'The_Webster_PietroGroff_31.webp', 'The_Webster_PietroGroff_33.webp'],
        'assets/photos/12_trial': ['trial_045.webp'],
        'assets/photos/13_highsnobiety': ['cK_PietroGroff_Highsnobiety4_1.webp', 'cK_PietroGroff_Highsnobiety10.webp', 'cK_PietroGroff_Highsnobiety11.webp'],
    };

    let currentFolder = null;
    let currentPhotos = [];
    let currentPhotoIndex = -1;

    function getFolder(src) {
        const lastSlash = src.lastIndexOf('/');
        return lastSlash >= 0 ? src.substring(0, lastSlash) : '';
    }

    function getFilename(src) {
        return src.substring(src.lastIndexOf('/') + 1);
    }

    function updateArrows() {
        const show = currentPhotos.length > 1;
        prevBtn.style.display = show ? '' : 'none';
        nextBtn.style.display = show ? '' : 'none';
    }

    function navigateLightbox(direction) {
        if (currentPhotos.length <= 1) return;
        currentPhotoIndex = (currentPhotoIndex + direction + currentPhotos.length) % currentPhotos.length;
        resetZoom();
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = currentFolder + '/' + currentPhotos[currentPhotoIndex];
            lightboxImg.onload = () => { lightboxImg.style.opacity = ''; };
        }, 150);
    }

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

    // Fade in images on load + open lightbox on click
    document.querySelectorAll(".image").forEach((img) => {
        if (img.complete) {
            img.classList.add("loaded");
        } else {
            img.addEventListener("load", () => img.classList.add("loaded"));
        }

        img.addEventListener("click", () => {
            const src = img.getAttribute('src');
            lightboxImg.src = src;
            lightboxImg.style.opacity = '';
            lightbox.classList.remove("hidden");
            resetZoom();
            document.body.style.overflow = "hidden";

            currentFolder = getFolder(src);
            currentPhotos = folderPhotos[currentFolder] || [];
            currentPhotoIndex = currentPhotos.indexOf(getFilename(src));
            if (currentPhotoIndex === -1 && currentPhotos.length > 0) currentPhotoIndex = 0;
            updateArrows();
        });
    });

    // Close lightbox
    lightbox.addEventListener("click", (e) => {
        if (e.target !== lightboxImg && e.target !== prevBtn && e.target !== nextBtn) {
            lightbox.classList.add("hidden");
            lightboxImg.src = "";
            resetZoom();
            document.body.style.overflow = "";
        }
    });

    // Arrow navigation
    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateLightbox(1);
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (lightbox.classList.contains("hidden")) return;
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        else if (e.key === "ArrowRight") navigateLightbox(1);
        else if (e.key === "Escape") {
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
