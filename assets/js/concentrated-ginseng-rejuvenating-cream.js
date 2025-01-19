(function () {
    /* AOS init */
    AOS.init();

    /* video Observer */
    function apVideoObserver(wrap, params = {}) {
        const elements = document.querySelectorAll(wrap);
        const defaults = {
            options: {
                threshold: 0.3, // 타겟 요소가 30% 가시성이 확인되었을 때
            },
        };

        const options = { ...defaults, ...params };

        if (elements.length === 0) return;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const videos = entry.target.querySelectorAll('video');

                videos.forEach((video) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        video.play();
                        video.dataset.paused = false;
                    } else {
                        entry.target.classList.remove('active');
                        video.pause();
                        video.muted = true;
                        video.dataset.paused = true;
                    }
                });
            });
        }, options.options);

        elements.forEach((element) => io.observe(element));
    }

    apVideoObserver('.ap-video');

    /* Swiper */
    let productLine = new Swiper('.product-line-swiper', {
        slidesPerView: 3,
        navigation: { nextEl: '.ap-section--sustainable .swiper-button-next', prevEl: '.ap-section--sustainable .swiper-button-prev' },
        breakpoints: {
            750: {
                slidesPerView: 1,
            },
        },
    });
})();

gsap.registerPlugin(ScrollTrigger);

// secret

const isSamsung = navigator.userAgent.toLowerCase().includes('samsung');
const apSecret = (function () {
    let animateIn = null;
    let yPos = 0;
    let prevWindowWidth = window.innerWidth;
    let prevWindowHeight = window.innerHeight;

    const secret = document.querySelector('.ap-section--secret');
    const secretHeader = secret.querySelector('.ap-section__header');
    const secretBody = secret.querySelector('.ap-section__body');
    const secretInner = secret.querySelector('.ap-section__inner');
    const secretItems = secretBody.querySelectorAll('.ap-secret__item');

    function animateKill() {
        if (animateIn) {
            animateIn.scrollTrigger.kill();

            secretItems.forEach((item) => (item.style = ''));

            animateIn = null;
        }
    }

    const bgAnimation = (e) => {
        gsap.set(e, { top: `${-yPos}px`, height: `calc(100vh + ${yPos}px)` });
    };

    const itemsAnimation = (item, index, previousItem) => {
        const bgImg = item.querySelector('.ap-image img');
        const text = item.querySelectorAll('.ap-text > *');

        // if (!isSamsung) {
        if (index > 0) {
            animateIn.to(previousItem, { duration: 1, delay: 0.5, opacity: 0, scale: 0.9 }, 'bg' + index);
        }
        if (index === 0) {
            animateIn.set(item, {
                top: '50%',
                transform: 'translate(-50%, -50%)',
                transformOrigin: '50% 50%',
            });
        }
        // } else {
        //     animateIn.to(previousItem, { duration: 1, delay: 0.5, opacity: 0, scale: 0.9 }, 'bg' + index);

        //     animateIn.set(item, {
        //         top: '0%',
        //         transform: 'translate(-50%, 0)',
        //         transformOrigin: '50% 50%',
        //     });
        // }

        animateIn
            .fromTo(
                item,
                { opacity: index === 0 ? 0.5 : 0, y: index === 0 ? 0 : 150 },
                {
                    delay: index === 0 ? 0 : 1,
                    duration: 2,
                    opacity: 1,
                    y: 0,
                    ease: 'none',
                },
                'bg' + index,
            )
            .fromTo(bgImg, { scale: 1.15 }, { scale: 1, duration: 1 }, 'bg' + index)
            .fromTo(
                text,
                { opacity: 0, y: 25 },
                {
                    duration: index === 0 ? 3 : 2,
                    opacity: 1,
                    y: 0,
                    stagger: { each: 1, ease: 'power3.inOut' },
                },
            );
    };

    function animateInit() {
        const boxEnd = gsap.getProperty(secretInner, 'height');

        animateIn = gsap.timeline({
            scrollTrigger: {
                trigger: secretBody,
                start: 'top top',
                end: `+=${boxEnd} 100%`,
                // end: `+=${boxEnd} 90%`,
                scrub: true,
                pin: secretBody,
                pinnedContainer: secretBody,
                pinSpacing: false,
                invalidateOnRefresh: true, // 리프레시 시 초기화
                fastScrollEnd: true, // 빠른 스크롤에서 트리거 안정화
                refreshPriority: 1, // 트리거 초기화 우선순위
                markers: true,
            },
        });

        yPos = secretHeader.offsetHeight;

        bgAnimation(secretBody);

        secretItems.forEach((item, index) => {
            itemsAnimation(item, index, secretItems[index - 1]);
        });

        animateIn.to({}, { duration: 4.5, ease: 'none' });
    }

    const setAppHeight = () => {
        const innerHeight = window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${innerHeight}px`);
    };

    const init = () => {
        setAppHeight();
        animateKill();
        animateInit();
    };

    window.addEventListener('load', init);

    window.addEventListener('resize', resizeThrottler, false);
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });

    let resizeTimeout;
    function resizeThrottler() {
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(function () {
                resizeTimeout = null;
                actualResizeHandler();
            }, 66);
        }
    }

    function actualResizeHandler() {
        // iOS와 삼성에서 resize 이벤트를 주소창 이동으로 감지
        if (isSamsung || /iPhone|iPad|iPod/.test(navigator.userAgent)) {
            setAppHeight(); // 높이 재조정
            ScrollTrigger.refresh(); // ScrollTrigger 동기화
        } else {
            init(); // 다른 환경은 기존 초기화 함수 사용
        }
    }

    // function actualResizeHandler() {
    //     init();
    // }

    ScrollTrigger.config({
        autoRefreshEvents: 'visibilitychange, DOMContentLoaded, load, resize',
    });

    return {
        init,
    };
})();

// count
const apCount = (function () {
    const count = document.querySelector('.ap-count');
    const numbers = document.querySelectorAll('.item-count');

    numbers.forEach((number) => {
        const target = parseFloat(number.dataset.target);
        const duration = parseFloat(number.dataset.speed);

        let startCount = { num: 0 };

        gsap.to(startCount, {
            num: target,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
                if (Number.isInteger(target)) {
                    number.innerHTML = Math.round(startCount.num);
                } else {
                    const decimals = target.toString().split('.')[1].length;
                    number.innerHTML = startCount.num.toFixed(decimals);
                }
            },
            scrollTrigger: {
                trigger: count,
                toggleActions: 'restart pause resume reset',
                start: 'top 90%',
                end: 'bottom top',
            },
        });
    });

    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });
})();
