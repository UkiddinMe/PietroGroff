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
    const DESIGN_HEIGHT = 7020;  // native layout height (px)
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

    // Photos per folder for click-to-cycle navigation
    const folderPhotos = {
        'assets/photos/0_0nums': ['1.2.webp', '15.webp', '16.webp'],
        'assets/photos/0_1_nums2': ['4.webp', '8.webp'],
        'assets/photos/01_Go_See_Prima': ['PG_JS_GoSee13.webp', 'PG_JS_GoSee21.webp'],
        'assets/photos/1_Go_See_24_7': ['Go_See_10.24_7.webp', 'Go_See_10.24_12.webp', 'Go_See_10.24_24.webp'],
        'assets/photos/2_insta_fog': ['Insta_FOG_PG_028.webp', 'Insta_FOG_PG_038.webp', 'Insta_FOG_PG_042.webp', 'Insta_FOG_PG_052.webp'],
        'assets/photos/3_Go_See_street': ['PG_JS_GoSee6.webp', 'PG_JS_GoSee7.webp'],
        'assets/photos/4_Go_See_Comm': ['-9.webp', 'PietroGroff_GoSEEComm_063.webp'],
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

    function getFolder(src) {
        const lastSlash = src.lastIndexOf('/');
        return lastSlash >= 0 ? src.substring(0, lastSlash) : '';
    }

    function getFilename(src) {
        return src.substring(src.lastIndexOf('/') + 1);
    }

    // Track current photo index per image element
    const imageIndices = new Map();

    // Fade in images on load + click to cycle through group
    document.querySelectorAll(".image").forEach((img) => {
        if (img.complete) {
            img.classList.add("loaded");
        } else {
            img.addEventListener("load", () => img.classList.add("loaded"));
        }

        const src = img.getAttribute('src');
        const folder = getFolder(src);
        const photos = folderPhotos[folder] || [];
        const startIndex = photos.indexOf(getFilename(src));
        imageIndices.set(img, startIndex >= 0 ? startIndex : 0);

        if (photos.length <= 1) {
            img.style.cursor = 'default';
        }

        img.addEventListener("click", () => {
            if (photos.length <= 1) return;
            const nextIndex = (imageIndices.get(img) + 1) % photos.length;
            imageIndices.set(img, nextIndex);
            img.style.opacity = '0';
            setTimeout(() => {
                img.src = folder + '/' + photos[nextIndex];
                img.onload = () => { img.style.opacity = ''; };
            }, 150);
        });
    });
});
