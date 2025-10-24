// Robust DOM-ready script
function initCoursesToggle() {
    try {
        // menu button
        const btn = document.querySelector('.menu-btn');
        const nav = document.querySelector('.nav-links');
        if (btn && nav) {
            btn.addEventListener('click', () => {
                const isOpen = nav.classList.toggle('open');
                btn.setAttribute('aria-expanded', String(isOpen));
            });
        }

        // Courses show-more toggle
        const tags = document.getElementById('coursesTags');
        const toggle = document.getElementById('coursesToggle');
        if (!tags || !toggle) return;

        const childrenSelector = () => Array.from(tags.children).filter(c => c.classList && c.classList.contains('course-tag'));

            const computeCollapsedHeight = () => {
            try {
                // 1) Read N safely; default to 4 if missing
                const raw = tags.getAttribute('data-show') || '4';
                let n = parseInt(raw, 10);
                if (!Number.isFinite(n) || n < 1) n = 4;   // clamp to sane default

                const children = childrenSelector();
                if (children.length === 0) {
                toggle.style.display = 'none';
                return;
                }

                // If N or fewer tags total, no need to collapse
                if (children.length <= n) {
                toggle.style.display = 'none';
                tags.classList.remove('collapsed');
                tags.style.removeProperty('--collapsed-height');
                return;
                } else {
                toggle.style.display = '';
                }

                // 2) We want the bottom of the N-th tag (index n-1)
                const index = Math.min(children.length - 1, n - 1);
                const node = children[index];

                // offsetTop is relative to the tags container
                const top = node.offsetTop;
                const height = node.offsetHeight;

                // Include the CSS gap so the next row doesn't peek in
                const gap = parseInt(getComputedStyle(tags).gap, 10) || 0;

                // 3) Set collapsed height to bottom of N-th tag + gap, rounded up
                const heightNeeded = Math.ceil(top + height + gap + 1); // +1px safety buffer
                tags.style.setProperty('--collapsed-height', heightNeeded + 'px');

                // (Optional) Log for debugging
                // console.debug('collapsed height=', heightNeeded, 'for N=', n);
            } catch (err) {
                console.error('computeCollapsedHeight error', err);
            }
            };


        // initialize collapsed state
        computeCollapsedHeight();
        tags.classList.add('collapsed');
        toggle.textContent = 'Show more';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.style.display = '';
        console.debug('courses: initialized, tags count=', childrenSelector().length);

        // toggle behavior
            toggle.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const isCollapsed = tags.classList.toggle('collapsed');
                toggle.textContent = isCollapsed ? 'Show more' : 'Show less';
                toggle.setAttribute('aria-expanded', String(!isCollapsed));
                console.debug('courses: toggle clicked, collapsed=', isCollapsed);
            });

        // reflow on resize and when images/fonts load
        let raf;
        const schedule = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(computeCollapsedHeight);
        };
        window.addEventListener('resize', schedule);
        window.addEventListener('load', schedule);

    } catch (e) {
        console.error('init error', e);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoursesToggle);
} else {
    // DOM already ready
    initCoursesToggle();
}
