// Transitions - GSAP animation helpers for smooth UI transitions

export class Transitions {
    constructor() {
        this.defaultDuration = 0.6;
        this.defaultEase = 'power3.out';
    }

    // Fade in element
    fadeIn(element, duration = this.defaultDuration, delay = 0) {
        return gsap.from(element, {
            opacity: 0,
            duration,
            delay,
            ease: this.defaultEase
        });
    }

    // Fade out element
    fadeOut(element, duration = this.defaultDuration, delay = 0) {
        return gsap.to(element, {
            opacity: 0,
            duration,
            delay,
            ease: this.defaultEase
        });
    }

    // Slide up animation
    slideUp(element, duration = this.defaultDuration, delay = 0) {
        return gsap.from(element, {
            y: 30,
            opacity: 0,
            duration,
            delay,
            ease: this.defaultEase
        });
    }

    // Slide down animation
    slideDown(element, duration = this.defaultDuration, delay = 0) {
        return gsap.from(element, {
            y: -30,
            opacity: 0,
            duration,
            delay,
            ease: this.defaultEase
        });
    }

    // Scale in animation
    scaleIn(element, duration = this.defaultDuration, delay = 0) {
        return gsap.from(element, {
            scale: 0.9,
            opacity: 0,
            duration,
            delay,
            ease: 'back.out(1.3)'
        });
    }

    // Scale out animation
    scaleOut(element, duration = this.defaultDuration, delay = 0) {
        return gsap.to(element, {
            scale: 0.9,
            opacity: 0,
            duration,
            delay,
            ease: 'back.in(1.3)'
        });
    }

    // Transition from gallery to immersive view
    transitionToImmersive(galleryView, immersiveView) {
        const tl = gsap.timeline();

        // Fade out gallery
        tl.to(galleryView, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                galleryView.classList.add('hidden');
            }
        });

        // Fade in immersive view
        tl.fromTo(immersiveView,
            {
                opacity: 0,
                scale: 1.05
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: 'power2.out',
                onStart: () => {
                    immersiveView.classList.remove('hidden');
                }
            },
            '-=0.2'
        );

        // Animate controls
        const controls = immersiveView.querySelector('.immersive-controls');
        const navArrows = immersiveView.querySelectorAll('.nav-arrow');
        const keyboardHint = immersiveView.querySelector('.keyboard-hint');

        tl.from([controls, ...navArrows, keyboardHint], {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.3');

        return tl;
    }

    // Transition from immersive to gallery view
    transitionToGallery(immersiveView, galleryView) {
        const tl = gsap.timeline();

        // Fade out immersive view
        tl.to(immersiveView, {
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                immersiveView.classList.add('hidden');
            }
        });

        // Fade in gallery
        tl.fromTo(galleryView,
            {
                opacity: 0,
                y: 20
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                onStart: () => {
                    galleryView.classList.remove('hidden');
                }
            },
            '-=0.2'
        );

        return tl;
    }

    // Animate scene card hover
    cardHoverIn(card) {
        gsap.to(card, {
            y: -8,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    // Animate scene card hover out
    cardHoverOut(card) {
        gsap.to(card, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    // Pulse animation for favorite button
    pulseFavorite(button) {
        return gsap.fromTo(button,
            {
                scale: 1
            },
            {
                scale: 1.2,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            }
        );
    }

    // Show modal animation
    showModal(modal) {
        const tl = gsap.timeline();

        tl.fromTo(modal,
            {
                opacity: 0
            },
            {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
                onStart: () => {
                    modal.classList.remove('hidden');
                }
            }
        );

        const modalContent = modal.querySelector('.modal-content');
        tl.from(modalContent, {
            scale: 0.9,
            y: 30,
            opacity: 0,
            duration: 0.4,
            ease: 'back.out(1.5)'
        }, '-=0.2');

        return tl;
    }

    // Hide modal animation
    hideModal(modal) {
        const tl = gsap.timeline();

        const modalContent = modal.querySelector('.modal-content');
        tl.to(modalContent, {
            scale: 0.9,
            y: 30,
            opacity: 0,
            duration: 0.3,
            ease: 'back.in(1.5)'
        });

        tl.to(modal, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                modal.classList.add('hidden');
            }
        }, '-=0.1');

        return tl;
    }

    // Stagger animation for scene cards
    staggerCards(cards, delay = 0.1) {
        return gsap.from(cards, {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: delay,
            ease: 'power2.out'
        });
    }

    // Loading progress bar animation
    animateLoadingProgress(progressBar, percent) {
        return gsap.to(progressBar, {
            width: `${percent}%`,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    // Hide loading screen
    hideLoadingScreen(loadingScreen, app) {
        const tl = gsap.timeline();

        tl.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                loadingScreen.style.display = 'none';
            }
        });

        tl.fromTo(app,
            {
                opacity: 0
            },
            {
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out',
                onStart: () => {
                    app.classList.remove('hidden');
                }
            },
            '-=0.3'
        );

        return tl;
    }

    // Button click feedback
    buttonClick(button) {
        return gsap.fromTo(button,
            {
                scale: 1
            },
            {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            }
        );
    }

    // Smooth camera transition (for scene switching)
    animateCameraTransition(camera, targetPosition, targetLookAt, duration = 1.5) {
        const tl = gsap.timeline();

        tl.to(camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration,
            ease: 'power2.inOut'
        });

        return tl;
    }

    // Create a timeline for complex animations
    createTimeline(options = {}) {
        return gsap.timeline(options);
    }
}
