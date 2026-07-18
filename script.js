document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.main-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!contactForm.reportValidity()) return;

            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('.btn-submit');
            const status = contactForm.querySelector('.form-status');
            const originalButtonText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = 'ENVIANDO...';
            status.className = 'form-status';
            status.textContent = '';

            try {
                const response = await fetch('https://formsubmit.co/ajax/contacto@yapcorporation.com', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json'
                    },
                    body: formData
                });
                const result = await response.json();

                if (!response.ok || result.success === 'false' || result.success === false) {
                    throw new Error(result.message || 'No se pudo enviar el mensaje.');
                }

                contactForm.reset();
                status.classList.add('success');
                status.textContent = 'Mensaje enviado correctamente. Nos comunicaremos contigo pronto.';
            } catch (error) {
                status.classList.add('error');
                status.textContent = 'No pudimos enviar el mensaje. Inténtalo nuevamente en unos minutos.';
                console.error('Error al enviar el formulario:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // ==========================================================
    // 1. NAVBAR — SCROLL (cambia color al bajar)
    // ==========================================================
    const navbar = document.querySelector('.navbar');
    let navbarTicking = false;

    function updateNavbarState() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        navbarTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!navbarTicking) {
            requestAnimationFrame(updateNavbarState);
            navbarTicking = true;
        }
    }, { passive: true });


    // ==========================================================
    // 2. NAVBAR — MENÚ HAMBURGUESA (mobile)
    // ==========================================================
    const hamburger = document.getElementById('navHamburger');
    const navContainer = document.getElementById('navContainer');
    const navOverlay = document.getElementById('navOverlay');

    function toggleMenu(open) {
        hamburger.classList.toggle('open', open);
        navContainer.classList.toggle('open', open);
        if (navOverlay) navOverlay.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => {
        toggleMenu(!navContainer.classList.contains('open'));
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', () => toggleMenu(false));
    }


    navContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });


    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) toggleMenu(false);
    });


    // ==========================================================
    // 3. SLIDER DE PROYECTOS (Múltiples instancias)
    // ==========================================================
    const allProjectSliders = document.querySelectorAll('.proyectos-slider');
    const sliderObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const api = entry.target.projectSliderApi;
                if (!api) return;

                if (entry.isIntersecting) {
                    api.loadBackgrounds();
                    api.start();
                } else {
                    api.stop();
                }
            });
        }, { rootMargin: '450px 0px', threshold: 0.01 })
        : null;

    allProjectSliders.forEach(slider => {
        const sliderTrack = slider.querySelector('.slider-track');
        const btnNext = slider.querySelector('.btn-next');
        const btnPrev = slider.querySelector('.btn-prev');
        const slides = slider.querySelectorAll('.slide');
        const totalSlides = slides.length;

        let slideIndex = 0;
        let sliderTimer;
        let backgroundsLoaded = false;

        function loadBackgrounds() {
            if (backgroundsLoaded) return;
            slides.forEach(slide => slide.classList.add('is-bg-loaded'));
            backgroundsLoaded = true;
        }

        function goToSlide(index) {
            if (sliderTrack) {
                sliderTrack.style.transform = `translateX(-${(index * 100) / totalSlides}%)`;
            }
        }

        function nextSlide() {
            slideIndex = (slideIndex + 1) % totalSlides;
            goToSlide(slideIndex);
        }

        function prevSlide() {
            slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
            goToSlide(slideIndex);
        }

        function startSliderTimer() {
            if (sliderTimer || totalSlides <= 1) return;
            sliderTimer = setInterval(nextSlide, 5000);
        }

        function stopSliderTimer() {
            clearInterval(sliderTimer);
            sliderTimer = null;
        }

        function resetSliderTimer() {
            stopSliderTimer();
            startSliderTimer();
        }

        if (sliderTrack && btnNext && btnPrev) {
            btnNext.addEventListener('click', () => { loadBackgrounds(); nextSlide(); resetSliderTimer(); });
            btnPrev.addEventListener('click', () => { loadBackgrounds(); prevSlide(); resetSliderTimer(); });

            slider.projectSliderApi = {
                loadBackgrounds,
                start: startSliderTimer,
                stop: stopSliderTimer
            };

            if (sliderObserver) {
                sliderObserver.observe(slider);
            } else {
                loadBackgrounds();
                startSliderTimer();
            }
        }
    });

    // ==========================================================
    // 3.1 CARRUSEL DE VALORES (mobile)
    // ==========================================================
    const valuesTrack = document.querySelector('.values-grid');
    const valueCards = valuesTrack ? Array.from(valuesTrack.querySelectorAll('.value-card')) : [];
    const valuesPrev = document.querySelector('.values-prev');
    const valuesNext = document.querySelector('.values-next');
    const valuesDots = document.querySelector('.values-carousel-dots');

    if (valuesTrack && valueCards.length && valuesPrev && valuesNext && valuesDots) {
        let valueIndex = 0;
        let valuesScrollTicking = false;

        const dotButtons = valueCards.map((card, index) => {
            card.setAttribute('role', 'group');
            card.setAttribute('aria-label', `${index + 1} de ${valueCards.length}`);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'values-carousel-dot';
            dot.setAttribute('aria-label', `Ir al valor ${index + 1}`);
            dot.addEventListener('click', () => goToValue(index));
            valuesDots.appendChild(dot);
            return dot;
        });

        function updateValuesDots() {
            dotButtons.forEach((dot, index) => {
                const isActive = index === valueIndex;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        }

        function goToValue(index) {
            valueIndex = (index + valueCards.length) % valueCards.length;
            const target = valueCards[valueIndex];
            valuesTrack.scrollTo({
                left: target.offsetLeft - valuesTrack.offsetLeft,
                behavior: 'smooth'
            });
            updateValuesDots();
        }

        valuesPrev.addEventListener('click', () => goToValue(valueIndex - 1));
        valuesNext.addEventListener('click', () => goToValue(valueIndex + 1));

        valuesTrack.addEventListener('scroll', () => {
            if (valuesScrollTicking || window.innerWidth > 768) return;
            valuesScrollTicking = true;
            requestAnimationFrame(() => {
                const trackLeft = valuesTrack.offsetLeft + valuesTrack.scrollLeft;
                let closestIndex = 0;
                let closestDistance = Infinity;

                valueCards.forEach((card, index) => {
                    const distance = Math.abs(card.offsetLeft - trackLeft);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });

                if (closestIndex !== valueIndex) {
                    valueIndex = closestIndex;
                    updateValuesDots();
                }
                valuesScrollTicking = false;
            });
        }, { passive: true });

        updateValuesDots();
    }

    // ==========================================================
    // 3.2 CARRUSEL DE LÍNEAS DE SERVICIO (mobile)
    // ==========================================================
    const servicesTrack = document.querySelector('.services-container');
    const serviceCards = servicesTrack ? Array.from(servicesTrack.querySelectorAll('.service-card')) : [];
    const servicesPrev = document.querySelector('.services-prev');
    const servicesNext = document.querySelector('.services-next');
    const servicesDots = document.querySelector('.services-carousel-dots');

    if (servicesTrack && serviceCards.length && servicesPrev && servicesNext && servicesDots) {
        let serviceIndex = 0;
        let servicesScrollTicking = false;

        const serviceDotButtons = serviceCards.map((card, index) => {
            card.setAttribute('role', 'group');
            card.setAttribute('aria-label', `${index + 1} de ${serviceCards.length}`);

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'services-carousel-dot';
            dot.setAttribute('aria-label', `Ir a la línea de servicio ${index + 1}`);
            dot.addEventListener('click', () => goToService(index));
            servicesDots.appendChild(dot);
            return dot;
        });

        function updateServicesDots() {
            serviceDotButtons.forEach((dot, index) => {
                const isActive = index === serviceIndex;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        }

        function goToService(index) {
            serviceIndex = (index + serviceCards.length) % serviceCards.length;
            servicesTrack.scrollTo({
                left: serviceCards[serviceIndex].offsetLeft - servicesTrack.offsetLeft,
                behavior: 'smooth'
            });
            updateServicesDots();
        }

        servicesPrev.addEventListener('click', () => goToService(serviceIndex - 1));
        servicesNext.addEventListener('click', () => goToService(serviceIndex + 1));

        servicesTrack.addEventListener('scroll', () => {
            if (servicesScrollTicking || window.innerWidth > 600) return;
            servicesScrollTicking = true;
            requestAnimationFrame(() => {
                const trackLeft = servicesTrack.offsetLeft + servicesTrack.scrollLeft;
                let closestIndex = 0;
                let closestDistance = Infinity;

                serviceCards.forEach((card, index) => {
                    const distance = Math.abs(card.offsetLeft - trackLeft);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = index;
                    }
                });

                if (closestIndex !== serviceIndex) {
                    serviceIndex = closestIndex;
                    updateServicesDots();
                }
                servicesScrollTicking = false;
            });
        }, { passive: true });

        updateServicesDots();
    }


    // ==========================================================
    // 4. CAROUSEL — QUIÉNES SOMOS
    // ==========================================================
    const carouselTrack = document.querySelector('.carousel-track');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    let carouselIndex = 0;

    if (carouselTrack && nextBtn && prevBtn) {
        let carouselTimer;

        function getVisibleSlides() {
            return Array.from(carouselTrack.children).filter(
                child => getComputedStyle(child).display !== 'none'
            );
        }

        function goToCarousel(visualIndex) {
            const visible = getVisibleSlides();
            const targetSlide = visible[visualIndex];
            if (!targetSlide) return;
            carouselTrack.style.transform = `translateX(-${visualIndex * 100}%)`;
        }

        function startCarouselTimer() {
            clearInterval(carouselTimer);
            carouselTimer = setInterval(() => {
                const total = getVisibleSlides().length;
                carouselIndex = (carouselIndex + 1) % total;
                goToCarousel(carouselIndex);
            }, 7000);
        }

        nextBtn.addEventListener('click', () => {
            const total = getVisibleSlides().length;
            carouselIndex = (carouselIndex + 1) % total;
            goToCarousel(carouselIndex);
            startCarouselTimer();
        });

        prevBtn.addEventListener('click', () => {
            const total = getVisibleSlides().length;
            carouselIndex = (carouselIndex - 1 + total) % total;
            goToCarousel(carouselIndex);
            startCarouselTimer();
        });

        startCarouselTimer();
    }


    // ==========================================================
    // 5. MÓDULOS — DRAG (mouse y touch)
    // ==========================================================
    const modulesTrack = document.getElementById('modulesTrack');
    const modulesContainer = document.querySelector('.modules-container');

    if (modulesTrack && modulesContainer) {
        let isDragging = false;
        let startX, originX;

        function getTranslateX() {
            const matrix = new WebKitCSSMatrix(window.getComputedStyle(modulesTrack).transform);
            return matrix.m41;
        }

        function onDragStart(e) {
            isDragging = true;
            startX = (e.pageX !== undefined ? e.pageX : e.touches[0].pageX) - modulesTrack.offsetLeft;
            originX = getTranslateX();
        }

        function onDragEnd() {
            isDragging = false;
        }

        function onDragMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            const x = (e.pageX !== undefined ? e.pageX : e.touches[0].pageX) - modulesTrack.offsetLeft;
            const maxScroll = -(modulesTrack.scrollWidth - modulesContainer.offsetWidth);
            const targetX = Math.min(0, Math.max(originX + (x - startX), maxScroll));
            modulesTrack.style.transform = `translateX(${targetX}px)`;
        }

        modulesContainer.addEventListener('mousedown', onDragStart);
        modulesContainer.addEventListener('mouseleave', onDragEnd);
        modulesContainer.addEventListener('mouseup', onDragEnd);
        modulesContainer.addEventListener('mousemove', onDragMove);

        modulesContainer.addEventListener('touchstart', onDragStart, { passive: true });
        modulesContainer.addEventListener('touchend', onDragEnd);
        modulesContainer.addEventListener('touchmove', onDragMove, { passive: false });
    }

    // ==========================================================
    // 6. ANIMACIONES REVEAL (Intersection Observer)
    // ==========================================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        let delayCounter = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;


            setTimeout(() => {
                entry.target.classList.add('active');
            }, delayCounter * 120);

            delayCounter++;
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    if (document.body.classList.contains('fixed-page')) {
        setTimeout(() => {
            revealElements.forEach(el => el.classList.add('active'));
        }, 100);
    } else {
        revealElements.forEach(el => {
            revealOnScroll.observe(el);
        });
    }

    // ==========================================================
    // 7. TRADUCCIÓN (ES / EN)
    // ==========================================================
    const langBtns = document.querySelectorAll('.lang-btn');

    function setLanguage(lang) {

        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });


        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                const text = translations[lang][key];

                if (text.includes('<')) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        });


        localStorage.setItem('preferredLang', lang);
        document.documentElement.lang = lang;
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            setLanguage(selectedLang);
        });
    });


    const savedLang = localStorage.getItem('preferredLang') || 'es';
    setLanguage(savedLang);

    // ==========================================================
    // 8. POP-UP PHOTO CAROUSEL FOR SUBPAGES
    // ==========================================================
    const splitBtn = document.querySelector('.split-btn');
    if (splitBtn) {
        const path = window.location.pathname.toLowerCase();
        let subpageKey = '';
        if (path.includes('motor.html')) subpageKey = 'motor';
        else if (path.includes('animal.html')) subpageKey = 'animal';
        else if (path.includes('organik.html')) subpageKey = 'organik';
        else if (path.includes('pacifik.html')) subpageKey = 'pacifik';
        else if (path.includes('liquik.html')) subpageKey = 'liquik';

        if (subpageKey) {

            const carouselsData = {
                motor: [
                    'imgs/motors-01.webp',
                    'imgs/motors-02.webp',
                    'imgs/motors-03.webp',
                    'imgs/motors-04.webp',
                ],
                animal: [
                    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80'
                ],
                organik: [
                    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80'
                ],
                pacifik: [
                    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
                ],
                liquik: [
                    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
                ]
            };

            const slides = carouselsData[subpageKey];
            let activeIndex = 0;


            const modal = document.createElement('div');
            modal.className = 'popup-carousel-modal';
            modal.innerHTML = `
                <button class="popup-carousel-close" aria-label="Cerrar">&times;</button>
                <div class="popup-carousel-container">
                    <div class="popup-carousel-viewport">
                        <img src="" alt="Popup Image" class="popup-carousel-main-img">
                        <button class="popup-carousel-arrow prev" aria-label="Anterior">&#10094;</button>
                        <button class="popup-carousel-arrow next" aria-label="Siguiente">&#10095;</button>
                    </div>
                    <div class="popup-carousel-thumbnails"></div>
                </div>
            `;
            document.body.appendChild(modal);

            const mainImg = modal.querySelector('.popup-carousel-main-img');
            const thumbnailsContainer = modal.querySelector('.popup-carousel-thumbnails');
            const closeBtn = modal.querySelector('.popup-carousel-close');
            const prevArrow = modal.querySelector('.popup-carousel-arrow.prev');
            const nextArrow = modal.querySelector('.popup-carousel-arrow.next');


            slides.forEach((slide, idx) => {
                const thumb = document.createElement('img');
                thumb.dataset.src = slide;
                thumb.className = 'popup-thumbnail-item';
                thumb.alt = `Thumbnail ${idx + 1}`;
                thumb.loading = 'lazy';
                thumb.decoding = 'async';
                thumb.addEventListener('click', () => {
                    setActiveSlide(idx);
                });
                thumbnailsContainer.appendChild(thumb);
            });

            const thumbs = modal.querySelectorAll('.popup-thumbnail-item');

            function loadThumbnails() {
                thumbs.forEach(thumb => {
                    if (!thumb.hasAttribute('src')) thumb.src = thumb.dataset.src;
                });
            }

            function setActiveSlide(index) {
                activeIndex = (index + slides.length) % slides.length;
                const slide = slides[activeIndex];


                mainImg.style.opacity = '0';

                setTimeout(() => {
                    mainImg.src = slide;


                    thumbs.forEach((t, i) => {
                        t.classList.toggle('active', i === activeIndex);
                    });

                    mainImg.style.opacity = '1';
                }, 200);
            }

            function openModal(e) {
                e.preventDefault();
                loadThumbnails();
                setActiveSlide(0);
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeModal() {
                modal.classList.remove('active');
                const navContainer = document.getElementById('navContainer');
                if (!navContainer || !navContainer.classList.contains('open')) {
                    document.body.style.overflow = '';
                }
            }


            splitBtn.addEventListener('click', openModal);
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            prevArrow.addEventListener('click', () => setActiveSlide(activeIndex - 1));
            nextArrow.addEventListener('click', () => setActiveSlide(activeIndex + 1));


            document.addEventListener('keydown', (e) => {
                if (!modal.classList.contains('active')) return;
                if (e.key === 'Escape') closeModal();
                else if (e.key === 'ArrowLeft') setActiveSlide(activeIndex - 1);
                else if (e.key === 'ArrowRight') setActiveSlide(activeIndex + 1);
            });
        }
    }

});
