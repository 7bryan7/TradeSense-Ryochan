/*
 * site.js — copied verbatim from the original `assets/js/index.js`.
 * The ONLY changes for the Next.js single-page port:
 *   1. Removed the two `barba.hooks.*` blocks (SPA scroll-restore for multi-page navigation).
 *   2. `initPageTransitions()` no longer calls `barba.init(...)`; it now runs the body of the
 *      original barba `once()` transition directly (initSmoothScroll → initScript → initLoader).
 * Every `init*` / animation function below is unchanged.
 */

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, ScrollToPlugin);

// Reset scroll on page next
history.scrollRestoration = "manual";
var scrollPosY = 0

initPageTransitions();

// Init Lottie
var initLottieHeaderGradientbars = lottie.loadAnimation({
  container: document.querySelector(".home-header .lottie-window"),
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: "/assets/json/" + $(".home-header .lottie-gradientbars").data('lottie-json') + ".json",
}); 

// Animation - First Page Load
function initLoader() { 

  var tl = gsap.timeline();

	tl.set(".loading-screen", { 
		y: "0vh",
	});	

  tl.set("html", { 
		cursor: "wait"
	});

  tl.call(function(){ 
    smoother.paused(true);
	});	

  tl.set(".loading-container h4 .single-char", {
    opacity: 0,
    delay: .75,
  });

  tl.set(".loading-container .h4-wrap", {
    opacity: 1
  });

  tl.to("header .visuals .single-visual", {
    y: "7vw",
  });

  tl.to(".loading-container h4 .single-char", {
    duration: 0.01,
    opacity: 1,
    ease: "none",
    stagger: .04
  });

  tl.to(".loading-container .progress", {
		duration: 3,
		scaleX: 1,
		ease: "Expo.easeInOut",
  },"0");

  tl.set("header h1 .single-line-inner", {
    yPercent: 110,
  });

  tl.set("header h4 .single-char", {
    opacity: 0,
  });

  tl.set("header .vertical-lines .vertical-line", {
    scaleY: 0
  });
  
	tl.to(".loading-screen", {
		duration: 1,
		y: "-125vh",
		ease: "Expo.easeInOut"
  });

  tl.to(".loading-container .top-bar", {
		duration: 1,
		y: "125vh",
		ease: "Expo.easeInOut",
  },"<");

  tl.to("header h1 .single-line-inner", {
    duration: 0.8,
    yPercent: 0,
    ease: "Power3.easeOut",
    stagger: .2
  },"< 0.6");

  tl.to("header .vertical-lines .vertical-line", {
    scaleY: 1,
    duration: 1.2,
    ease: "Expo.easeOut",
    stagger: .1
  },"<");

  tl.to("header h4 .single-char", {
    duration: 0.01,
    opacity: 1,
    ease: "none",
    stagger: .04,
  },"<");

  tl.to(".home-header .visuals .single-visual", {
    duration: 1.6,
    y: "0vw",
    ease: "Power3.easeOut",
    stagger: -.04
  },"< -0.3");

  tl.set("html", { 
		cursor: "auto",
	});

  tl.call(function(){ 
    smoother.paused(false);
	}, null, 3.35);	
  
  tl.call(function(){ 
    initLottieHeaderGradientbars.playSegments([0], true);
	}, null, 3.35);	

  tl.set(".loading-screen", { 
		y: "125vh",
	});	

}

// Animation - First Page Load
function initLoaderShort() { 

  var tl = gsap.timeline();

  tl.set(".loading-screen", { 
		y: "125vh",
	});	

}

// Animation - Page transition In
function pageTransitionIn() {
	var tl = gsap.timeline();

  var tl = gsap.timeline();

  tl.to(".loading-screen", {
		duration: 1,
		y: "0vh",
		ease: "Expo.easeInOut",
  });
  
	tl.to(".loading-screen", {
    delay: .25,
		duration: 1,
		y: "-125vh",
		ease: "Expo.easeInOut",
  });
}
  
// Animation - Page transition Out
function pageTransitionOut() {
	var tl = gsap.timeline();


  tl.set(".loading-container h4 .single-char", {
    opacity: 0,
  });

  tl.set(".loading-container .h4-wrap", {
    opacity: 1
  });

  tl.set("header h1 .single-line-inner", {
    yPercent: 110,
  });

  tl.set("header h4 .single-char", {
    opacity: 0,
  });
  
  tl.to("header h1 .single-line-inner", {
    duration: 0.8,
    yPercent: 0,
    ease: "Power3.easeOut",
    stagger: .2
  },"< 0.6");

  tl.to("header .vertical-lines .vertical-line", {
    scaleY: 1,
    duration: 1.2,
    ease: "Expo.easeOut",
    stagger: .1
  },"<");

  tl.to("header h4 .single-char", {
    duration: 0.01,
    opacity: 1,
    ease: "none",
    stagger: .04,
  },"<");

  tl.to(".home-header .visuals .single-visual", {
    duration: 1.6,
    y: "0vw",
    ease: "Power3.easeOut",
    stagger: -.04
  },"< -0.3");

  tl.set("html", { 
		cursor: "auto",
	});

  tl.call(function(){ 
    initLottieHeaderGradientbars.playSegments([0], true);
	}, null, 3.35);	
}

function initPageTransitions() {
  // [PORT] Barba.js removed for the single-page Next.js build.
  // This is the body of the original barba `once()` transition, run directly on first load.
  initSmoothScroll(document.querySelector('[data-barba="container"]'));
  initScript();
  initLoader();
}

function initSmoothScroll(container) {

  smoother = ScrollSmoother.create({
    smooth: 1,   
    effects: true,
    normalizeScroll: false
  });

}

function delay(n) {
	n = n || 2000;
	return new Promise((done) => {
		setTimeout(() => {
			done();
		}, n);
	});
}


/**
 * Fire all scripts on page load
 */
function initScript() {
  initSplitText();
  initWindowInnerheight();
  initScrollTo();
  initLazyLoad();
  initPlayVideoInview();
  initSwiperSlider();
  initScrolltriggerAnimations();
}

/**
* GSAP Split Text
*/
function initSplitText() {

  var splitTextLines = new SplitText(".split-lines", {type: "lines, chars", linesClass: "single-line"});
  $('.split-lines .single-line').wrapInner('<div class="single-line-inner">');

  var splitTextChars = new SplitText(".split-chars", {type: "chars", charsClass: "single-char"});

}

/**
* Window Inner Height Check
*/
function initWindowInnerheight() {
    
  // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  $(document).ready(function(){
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });

}

/**
 * ScrollTo Anchor Links
 */
 function initScrollTo() {
	$("[data-target]").click(function() {
		let target = $(this).data('target');
    gsap.to(window, {
      duration: 3, 
      scrollTo: {
        y: target,
        offsetY: 50,
        ease: "Power3.easeInOut",
      }
    });
	});

  const connectTarget = document.querySelector('#target-connect');
  if (window.location.href.indexOf("?target=connect") > -1) {

    smoother.paused(false);
    setTimeout(function() {
      smoother.paused(false);
      $('html, body').scrollTop( $("#target-connect").offset().top);
    }, 100);

  }
}

/**
* Lazy Load
*/
function initLazyLoad() {
    // https://github.com/locomotivemtl/locomotive-scroll/issues/225
    // https://github.com/verlok/vanilla-lazyload
    var lazyLoadInstance = new LazyLoad({ 
      elements_selector: ".lazy",
    });
}

/**
* Play Video Inview
*/
function initPlayVideoInview() {

  let allVideoDivs = gsap.utils.toArray('.playpauze');

  allVideoDivs.forEach((videoDiv, i) => {

    let videoElem = videoDiv.querySelector('video')

    ScrollTrigger.create({
      trigger: videoElem,
      start: '0% 250%',
      end: '100% -150%',
      onEnter: () => videoElem.play(),
      onEnterBack: () => videoElem.play(),
      onLeave: () => videoElem.play(),
      onLeaveBack: () => videoElem.play(),
    });

  });
}

/**
* Swiper Slider
*/
function initSwiperSlider() {

  // Custom slider tutorial
  // Tutorial: https://arnost.medium.com/creating-custom-slide-transitions-in-swiper-js-also-with-gsap-ac71f9badf53
  // Result: https://codepen.io/paralleluniv3rse/pen/yGQjMv
  
  $('.slider-cards').each(function(index){

    var sliderIndexID = 'slider-cards-id-' + index;
    $(this).attr('id', sliderIndexID);

    var sliderThis = $(this);

    // Init Slider 1: Primary
    var swiperSliderMain = document.querySelector('#' + sliderIndexID + ' .swiper-container-cards');
    var swiperMain = new Swiper(swiperSliderMain, {
      simulateTouch: false,
      loop: true,
      grabCursor: false,
      speed: 1200,
      navigation: {
        nextEl: '#' + sliderIndexID + ' .swiper-btn-next',
        prevEl: '#' + sliderIndexID + ' .swiper-btn-prev'
      },
      pagination: {
        el: '#' + sliderIndexID + ' .swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
            return '<span class="' + className + '"><div class="progress"></div> ' + '</span>';
        },
      }
    });

    // GSAP Animation Progress Bar (Will trigger slider to slide)
    var tl = gsap.timeline({paused: true});

    // Retrigger Animation on Slide Change
    function singleSwiperSliderEnd() {
      // swiperMain.slideNext();
      // tl.restart();
    }
    
    tl.to(sliderThis.find('.progress'), {
      duration: 10,
      scaleX: 1,
      ease: "Power1.easeInOut",
      onComplete: singleSwiperSliderEnd
    });

    // Reset Progress Bar On Slide Change
    swiperMain.on("slideChange", function () {
      // tl.restart();
      addSwipeVisibleClass();
    });

    // Pause Carousel/Progress Bar On Hover
    sliderThis.find('.swiper-pagination, .swiper-btn-big').on('mouseenter', function() {
      tl.pause();
    });

    sliderThis.find('.swiper-pagination, .swiper-btn-big').on('mouseleave', function() {
      tl.resume();
    });

    function addSwipeVisibleClass() {
      sliderThis.addClass('slider-is-transitioning');
      sliderThis.find('.swiper-slide').addClass('slide-is-transitioning');
      sliderThis.find('.swiper-slide-visible').removeClass('slide-is-transitioning');
      setTimeout(function() {
        sliderThis.removeClass('slider-is-transitioning');
        sliderThis.find('.swiper-slide').removeClass('slide-is-transitioning');
      }, 700);
    }

	});

  $('.slider-timeline').each(function(index){

    var sliderIndexID = 'slider-timeline-id-' + index;
    $(this).attr('id', sliderIndexID);

    var sliderThis = $(this);

    // Get Bullet Year/Label
    var bulletName = sliderThis.find('.swiper-slide').map(function() {
      return $(this).data('year');
    }).get();

    // Init Slider 1: Primary
    var swiperSliderMain = document.querySelector('#' + sliderIndexID + ' .swiper-container-timeline');
    var swiperMain = new Swiper(swiperSliderMain, {
      simulateTouch: false,
      autoHeight: true,
      direction: "vertical",
      loop: false,
      grabCursor: false,
      speed: 1200,
      pagination: {
        el: '#' + sliderIndexID + ' .swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '"><div class="progress"></div> ' + (bulletName[index]) + '</span>';
        },
      },
      scrollbar: {
        el: '#' + sliderIndexID + ' .swiper-scrollbar',
        draggable: true,
      },
    });

    // GSAP Animation Progress Bar (Will trigger slider to slide)
    var tl = gsap.timeline({paused: true});

    // Retrigger Animation on Slide Change
    function singleSwiperSliderEnd() {
      swiperMain.slideNext(); 
      tl.restart();
    }
    
    tl.to(sliderThis.find('.progress'), {
      duration: 5,
      scaleX: 1,
      ease: "Power1.easeInOut",
      onComplete: singleSwiperSliderEnd
    });

    // Reset Progress Bar On Slide Change
    swiperMain.on("slideChange", function () {
      tl.restart();
      addSwipeVisibleClass();
    });

    // Pause Carousel/Progress Bar On Hover
    sliderThis.find('.swiper-pagination, .swiper-scrollbar').on('mouseenter', function() {
      tl.pause();
    });

    sliderThis.find('.swiper-pagination, .swiper-scrollbar').on('mouseleave', function() {
      tl.resume();
    });

    // Play/Pause Slider in viewport
    sliderThis.each(function() {
      let triggerElement = $(this);
    
      ScrollTrigger.create({
        trigger: triggerElement,
        start: '0% 120%',
        end: '100% -20%',
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeave: () => tl.pause(),
        onLeaveBack: () => tl.pause(),
      });

    });

    function addSwipeVisibleClass() {
      sliderThis.addClass('slider-is-transitioning');
      sliderThis.find('.swiper-slide').addClass('slide-is-transitioning');
      sliderThis.find('.swiper-slide-visible').removeClass('slide-is-transitioning');
      setTimeout(function() {
        sliderThis.removeClass('slider-is-transitioning');
        sliderThis.find('.swiper-slide').removeClass('slide-is-transitioning');
      }, 700);
    }

	});

  $('.slider-future').each(function(index){

    var sliderIndexID = 'slider-future-id-' + index;
    $(this).attr('id', sliderIndexID);

    var sliderThis = $(this);


    // Init Slider 1: Primary
    var swiperSliderMain = document.querySelector('#' + sliderIndexID + ' .swiper-container-future');
    var swiperMain = new Swiper(swiperSliderMain, {
      simulateTouch: false,
      loop: false,
      grabCursor: false,
      speed: 1200,
      slidesPerView: 'auto',
      navigation: {
        nextEl: '#' + sliderIndexID + ' .swiper-btn-next',
        prevEl: '#' + sliderIndexID + ' .swiper-btn-prev'
      },
      scrollbar: {
        el: '#' + sliderIndexID + ' .swiper-scrollbar',
        draggable: true,
      },
      pagination: {
        el: '#' + sliderIndexID + ' .swiper-pagination',
        type: 'custom',
        renderCustom: function (swiper, current, total) {
            return '<div class="fractions">0' + current + '<span>/0' + total + '</span></div>'; 
        }
      },
    });

    // GSAP Animation Progress Bar (Will trigger slider to slide)
    var tl = gsap.timeline({paused: true});

    // Retrigger Animation on Slide Change
    function singleSwiperSliderEnd() {
      swiperMain.slideNext(); 
      tl.restart();
    }
    
    tl.to(sliderThis.find('.progress'), {
      duration: 5,
      scaleX: 1,
      ease: "Power1.easeInOut",
      onComplete: singleSwiperSliderEnd
    });

    // Reset Progress Bar On Slide Change
    swiperMain.on("slideChange", function () {
      tl.restart();
      addSwipeVisibleClass();
    });

    // Pause Carousel/Progress Bar On Hover
    sliderThis.find('.swiper-btn-big-wrapper, .swiper-scrollbar').on('mouseenter', function() {
      tl.pause();
    });

    sliderThis.find('.swiper-btn-big-wrapper, .swiper-scrollbar').on('mouseleave', function() {
      tl.resume();
    });

    // Play/Pause Slider in viewport
    sliderThis.each(function() {
      let triggerElement = $(this);
    
      ScrollTrigger.create({
        trigger: triggerElement,
        start: '0% 120%',
        end: '100% -20%',
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeave: () => tl.pause(),
        onLeaveBack: () => tl.pause(),
      });

    });

    function addSwipeVisibleClass() {
      sliderThis.addClass('slider-is-transitioning');
      sliderThis.find('.swiper-slide').addClass('slide-is-transitioning');
      sliderThis.find('.swiper-slide-visible').removeClass('slide-is-transitioning');
      setTimeout(function() {
        sliderThis.removeClass('slider-is-transitioning');
        sliderThis.find('.swiper-slide').removeClass('slide-is-transitioning');
      }, 700);
    }

	});
}

/**
* Scrolltrigger Animations Desktop + Mobile
*/
function initScrolltriggerAnimations() {

  // Script to work with Lottie & Scrolltrigger
  function LottieScrollTrigger(vars) {
    let playhead = {frame: 0},
      target = gsap.utils.toArray(vars.target)[0],
      speeds = {slow: "+=2000", medium: "+=1000", fast: "+=500"},
      st = {trigger: target, pin: true, start: "top top", end: speeds[vars.speed] || "+=1000"},
      animation = lottie.loadAnimation({
        container: target,
        renderer: vars.renderer || "svg",
        loop: false,
        autoplay: false,
        path: vars.path
      });
    for (let p in vars) { // let users override the ScrollTrigger defaults
      st[p] = vars[p];
    }
    animation.addEventListener("DOMLoaded", function() {
      gsap.to(playhead, {
        duration: vars.duration || 0.5,
        delay: vars.delay || 0,
        frame: animation.totalFrames - 1,
        ease: vars.ease || "none",
        onUpdate: () => animation.goToAndStop(playhead.frame, true),
        scrollTrigger: st
      });
      // in case there are any other ScrollTriggers on the page and the loading of this Lottie asset caused layout changes
      ScrollTrigger.sort();
      ScrollTrigger.refresh(); 
    });
    return animation;
  }

  // Scrolltrigger Animation : H1/H2 Title Slide In
  $(".animate-split-lines").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this).find(".single-line-inner");
  
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 80%",
        end: "100% 0%",
        toggleActions: "play none none none"
      }
    });
    tl.fromTo(targetElement, 0.8,{
      yPercent: 110
    }, {
      yPercent: 0,
      ease: "Power3.easeOut",
      stagger: .2
    });
  });

  // Scrolltrigger Animation : H4 Typewriter
  $(".animate-typewriter").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this).find(".single-char");
  
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 80%",
        end: "100% 0%",
        toggleActions: "play none none none",
        // scrub: .5,
      }
    });
    tl.fromTo(targetElement, 0.01,{
      opacity: 0
    }, {
      opacity: 1,
      ease: "none",
      stagger: .04,
    });
  });

  $('.btn-typewriter').on('mouseenter', function() {
    gsap.fromTo($(this).find(".single-char"), 0.01,{
      opacity: 0
    }, {
      opacity: 1,
      ease: "none",
      stagger: .04,
      clearProps: "opacity"
    });
  });

  // Scrolltrigger Animation : Vertical Lines
  $(".animate-vertical-lines").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this).find(".vertical-line");
  
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 80%",
        end: "100% 0%",
        toggleActions: "play none none none"
      }
    });
    tl.fromTo(targetElement, 1.5,{
      scaleY: 0
    }, {
      scaleY: 1,
      ease: "Expo.easeInOut",
      stagger: .05
    });
  });

  // Scrolltrigger Animation : Lottie's
  $(".animate-lottie-gradientbars").each(function (index) {

    var triggerElement = $(this);
    var targetElement = $(this).find(".lottie-window");
    var targetPath = $(this).data('lottie-json');
    
    LottieScrollTrigger({
      trigger: triggerElement,
      target: targetElement,
      path: "/assets/json/" + targetPath + ".json",
      start: "0% 90%",
      end: "100% 0%",
      toggleActions: "play none none none",
      pin: "false",
      duration: 2,
      autoplay: true,
    });
    
  });

    // Scrolltrigger Animation : Lottie's Reverse
  $(".animate-lottie-gradientbars-reverse").each(function (index) {

    var triggerElement = $(this);
    var targetElement = $(this).find(".lottie-window");
    var targetPath = $(this).data('lottie-json');
    
    LottieScrollTrigger({
      trigger: triggerElement,
      target: targetElement,
      path: "/assets/json/" + targetPath + ".json",
      start: "0% 80%",
      end: "100% 0%",
      toggleActions: "play none none reverse",
      pin: "false",
      duration: 2,
      autoplay: true,
    });
    
  });

  // Scrolltrigger Animation : P
  $(".animate-p").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this);
  
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 80%",
        end: "100% 0%",
        toggleActions: "play none none none"
      }
    });
    tl.fromTo(targetElement, .4,{
      opacity: 0,
    }, {
      opacity: 1,
      ease: "none",
      stagger: .1
    });
  });

  // Scrolltrigger Animation : Home Header Cubes
  $(".home-header").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this).find(".animate-visual");
    let targetElementMoon = $(this).find(".animate-visual-moon");
  
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: "0% 0%",
        end: "100% 0%",
        scrub: .5,
      }
    });
    tl.to(targetElement, 2,{
      yPercent: -35,
      ease: "none"
    });
    tl.to(targetElementMoon, 2,{
      yPercent: -150,
      ease: "none"
    }, "<");
  });
  
  setTimeout(function() {
    $(".lottie-gridroom svg").attr('preserveAspectRatio', 'none');
  }, 500); 

  $(".lottie-gridroom").each(function (index) {

    var triggerElement = $(this);
    var targetElement = $(this).find(".lottie-window");

    var containerHeight = $(targetElement).height();
    var documentHeight = $(window).height();
    var offsetHeight = (documentHeight - containerHeight) / 2;
    
    LottieScrollTrigger({
      trigger: triggerElement,
      target: targetElement,
      path: "/assets/json/grid-room.json",
      pin: false,
      end: "+=75%",
      scrub: 0.5
    });

    LottieScrollTrigger({
      trigger: triggerElement,
      target: $(".lottie-gradientbars-gridroom .lottie-window"),
      path: "/assets/json/underline-02.json",
      pin: false,
      start: "+=75%",
      end: "+=100%",
      scrub: 0.5
    });

  });

  // Scrolltrigger Animation : Gridroom
  $(".home-lottie-gridroom").each(function (index) {
    let triggerElement = $(this);
    let targetElementCoverOdd = $(this).find(".animate-cover.horizontal .cover-object");
    let targetElementCoverEven = $(this).find(".animate-cover.vertical .cover-object");

    var containerHeight = $(".lottie-gridroom").height();
    var documentHeight = $(window).height();
    var offsetHeight = (documentHeight - containerHeight) / 2;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.5,
        pin: true,
        start: "0% " + offsetHeight,
        end: "+=225%",
        onUpdate: self => {
          if(self.progress > 0.33) { h4Animation.play(); } else { h4Animation.reverse(); }
          if(self.progress > 0.33) { h2Animation.play(); } else { h2Animation.reverse(); }
        }
      }
    });

    // No Scrub H4 Animation
    tl.set($(this).find("h4 .single-char"), {
      opacity: 0,
    });

    tl.set($(this).find(".lottie-gradientbars-gridroom"), {
      opacity: 0
    });

    let h4Animation = gsap.timeline({paused: true})
    .fromTo($(this).find("h4 .single-char"), 0.01,{
      opacity: 0
    }, {
      opacity: 1,
      ease: "none",
      stagger: .04
    });

    // No Scrub H2 Animation
    tl.set($(this).find("h2 .single-line-inner"), {
      yPercent: 110
    });

    let h2Animation = gsap.timeline({paused: true})
    .fromTo($(this).find("h2 .single-line-inner"), 0.8,{
      yPercent: 110
    }, {
      yPercent: 0,
      ease: "Power3.easeOut",
      stagger: .2
    });

    // Scrub Animation

    tl.fromTo(targetElementCoverOdd, 0.75,{
      scaleY: 1
    }, {
      scaleY: 0,
      ease: "none"
    }, "<");

    tl.fromTo(targetElementCoverEven, 0.75,{
      scaleX: 1
    }, {
      scaleX: 0,
      ease: "none"
    }, "<");

    tl.fromTo($(this).find(".container .row"), 0.75,{
      scale: .82,
    }, {
      scale: 1,
      ease: "none"
    }, "<");

    tl.set($(this).find(".lottie-gradientbars-gridroom"), {
      opacity: 1
    }, "1");

    tl.fromTo($(this).find("h2 .single-line-inner div"), 0.01,{
      color: "#767270",
    }, {
      color: "#FFFFFF",
      ease: "none",
      stagger: 0.025,
    }, "0.75");

  });

// Scrolltrigger Animation : Timeline Text
$(".home-slider-history .lottie-timeline-text").each(function (index) {
  let triggerElement = $(this);

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      scrub: 0.5,
      pin: true,
      start: "0%",
      end: "+=100%",
    }
  });

  tl.fromTo($(this).find("h2 .single-line-inner div"), 0.01,{
    color: "#767270",
  }, {
    color: "#FFFFFF",
    ease: "none",
    stagger: 0.025,
  });

});

// Scrolltrigger Animation : Home Header Cubes
$(".home-hexagon-tiles").each(function (index) {
  let triggerElement = $(this);
  let targetElement = $(this).find(".animate-visual");

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: triggerElement,
      start: "-25% 100%",
      end: "0% 0%",
      scrub: .5,
    }
  });
  tl.from(targetElement, 2,{
    yPercent: 100,
    stagger: 0.1,
    ease: "Power3.easeOut"
  });
});

// Scrolltrigger Animation : Hexagon Tiles
$(".home-hexagon-tiles").each(function (index) {
  let triggerElement = $(this);
  
    var containerHeight = $(".home-hexagon-tiles .visuals").height();
    var documentHeight = $(window).height();
    var offsetHeight = (documentHeight - containerHeight) / 2;
  
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.5,
        pin: true,
        start: "0% " + offsetHeight,
        end: "+=150%",
      }
    });
  
    tl.set($(this).find(".single-visual .overlay-visual"), {
      opacity: 0
    });

    tl.to($(this), 2.1, {
      opacity: "transparent",
      ease: "none"
    });
  
    tl.fromTo($(this).find(".single-visual .overlay-visual"), 0.001,{
      opacity: 0,
    }, {
      opacity: 1,
      ease: "none",
      stagger: .15
    }, "< 0.15");
  
    tl.fromTo($(this).find(".single-visual .overlay-outline"), 0.001,{
      opacity: 1,
    }, {
      opacity: 0,
      ease: "none",
      stagger: .15
    }, "<");
  
  });


  // Scrolltrigger Animation : Timeline Text
  $(".home-future .lottie-timeline-text").each(function (index) {
    let triggerElement = $(this);

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.5,
        pin: true,
        start: "0%",
        end: "+=100%",
      }
    });

    tl.fromTo($(this).find("h2 .single-line-inner div"), 0.01,{
      color: "#A4A4A4",
    }, {
      color: "#272727",
      ease: "none",
      stagger: 0.025,
    });

  });

  // Scrolltrigger Animation : Partnerships Visuals
  $(".home-partnerships .visuals").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this).find('.single-visual');

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.5,
        start: "0% 25%",
        end: "75% 0%",
      }
    });

    tl.to(targetElement, {
      scale: 1.075,
      ease: "Power3.easeOut"
    });

  });

  // Scrolltrigger Animation : Home Online
  $(".home-online").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this).find('.overlay-visual');

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.5,
        start: "0% 70%",
        end: "100% 0%",
      }
    });

    tl.from(targetElement, {
      scale: .8,
      ease: "Power3.easeOut"
    });

    tl.from(targetElement.find("img"), {
      scale: 1.25,
      ease: "Power3.easeOut"
    }, "<");

  });

  // Scrolltrigger Animation : Footer
  $(".footer").each(function (index) {
    let triggerElement = $(this);
    let targetElement = $(this).find('.visuals .animate-visual');

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.2,
        start: "0% 100%",
        end: "+=90%"
      }
    });

    tl.from(targetElement, {
      yPercent: 50,
      ease: "none"
    });

  });

}
