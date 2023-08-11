/********************************************
 **** Tourist Guide
 **** The jQuery Website Tour Creator
 **** Created by: wintercounter
 **** Version: 1.0
 **** Available at CodeCanyon
 ********************************************/

;(function($) {

	var 		documentWidth,
			documentHeight,
			i,
			activeId,
			totalSteps = 0,
			thisStep,
			nav,
			parsedAnimation = false,
			didFrame = 0,
			lastAnimTime = 0;

	// Init things
	$.touristGuide = function(settings) {
		params = null;
		params = $.extend({
			
			// Params
			steps : {},
			startStep : 1,
			autoPlay: false,
			autoPlaySpeed: 3000,
			autoPlayAutoEnd: false,
			tipContainer: '#tip_container',
			stepsClass: '.step',
			startOnLoad: true,
			tipHideSpeed : 400,
			tipShowSpeed : 1000,
			highliteShowSpeed: 1000,
			highliteHideSpeed: 400,
			overlayShowSpeed: 1000,
			overlayHideSpeed: 400,
			defaultTgWidth : 300,
			addNav : 'both',
			showEnd : 'everywhere',
			overlayOffset : "0",
			tipOffset : "0",
			defaultPosition : 'bottom',
			tipAnimation : false,
			tipAnimationReset : {},
			closeOnClick : true,
			askOnClickClose : true,
			
			// ScrollTo Configs
			scrollTo: {
				duration: 1000,
				easing: 'linear',
				offsetTop: 30
			},
			
			// Langs
			nextText : 'Next',
			prevText : 'Prev',
			endText : 'End Tour',
			sure : 'Are you sure you want to end this tour?',
			
			// Callbacks
			onBeforeLoad : false,
			onAfterLoad : false,
			onBeforeSwitch : false,
			onAfterSwitch : false,
			onNext : false,
			onPrev : false,
			onGo : false,
			onFinish : false,
			onInit: false
			
		}, settings);

		if (params.onBeforeLoad) {
			params.onBeforeLoad.call(this);
		}
		
		/***** Some Essential Things *****/
		
		documentWidth = $(document).trueWidth();
		documentHeight = $(document).trueHeight();
		
		/***** Generate Steps Object *****/
			
		i = 1;
		
		var obj, stepFor, stepPosition, stepWidth, stepHeight, offsetTop;
		
		$(params.tipContainer + ' ' + params.stepsClass).each(function(){
			thisObj = $(this);
			thatObj = $(thisObj.data('tgFor'));
			stepFor = thisObj.data('tgFor');
			stepTgWidth = (thisObj.data('tgWidth')) ? thisObj.data('tgWidth') : params.defaultTgWidth;
			stepWidth = thatObj.trueWidth();
			stepPosition = (thisObj.data('tgPosition')) ? thisObj.data('tgPosition') : params.defaultPosition;
			stepHeight = thatObj.trueHeight();
			offsetTop = thatObj.offset().top;
			offsetLeft = thatObj.offset().left;
			offsetRight = documentWidth - offsetLeft - stepWidth;
			offsetBottom = documentHeight - offsetTop - stepHeight;
			stepNav = (thisObj.data('tgNav')) ? thisObj.data('tgNav') : params.addNav;
			tipOffset = (thisObj.data('tgTipOffset')) ? thisObj.data('tgTipOffset') : params.tipOffset;
			overlayOffset = (thisObj.data('tgOverlayOffset')) ? thisObj.data('tgOverlayOffset') : params.overlayOffset;
			tipOffsetLeft = (tipOffset.indexOf(" ") > -1) ? tipOffset.split(" ")[1] : tipOffset;
			tipOffsetTop = (tipOffset.indexOf(" ") > -1) ? tipOffset.split(" ")[0] : tipOffset;
			scrollToObj = {};
			scrollToObj.offsetTop = (thisObj.data('tgScrollOffsetTop')) ? parseInt(thisObj.data('tgScrollOffsetTop')) : params.scrollTo.offsetTop;
			scrollToObj.duration = (thisObj.data('tgScrollDuration')) ? parseInt(thisObj.data('tgScrollDuration')) : params.scrollTo.duration;
			scrollToObj.easing = (thisObj.data('tgScrollEasing')) ? thisObj.data('tgScrollEasing') : params.scrollTo.easing;
			animReset = (thisObj.data('tgAnimationReset')) ? $.parseJSON(replaceAll(thisObj.data('tgAnimationReset'),'\'','"')) : params.tipAnimationReset;
			params.tipAnimation = (thisObj.data('tgAnimation')) ? thisObj.data('tgAnimation') : false;
			
			params.steps['step_' + i] = {
				dataThat : thatObj,
				dataFor : stepFor,
				dataPosition : stepPosition,
				dataWidth : stepWidth,
				dataHeight : stepHeight,
				dataOffsetTop : offsetTop,
				dataOffsetLeft : offsetLeft,
				dataOffsetRight : offsetRight,
				dataOffsetBottom : offsetBottom,
				dataTgWidth : stepTgWidth,
				dataNav : stepNav,
				dataTipOffset : parseInt(tipOffset),
				dataOverlayOffset : parseInt(overlayOffset),
				dataTipOffsetLeft : parseInt(tipOffsetLeft),
				dataTipOffsetTop : parseInt(tipOffsetTop),
				dataAnimation : $.touristGuide.animationParser(),
				dataAnimationReset: animReset,
				dataScrollToObj : scrollToObj
			}
			
			i++;
			totalSteps++;
			
		});
		
		if (params.onAfterLoad) {
			params.onAfterLoad.call(this);
		}
		
		$.touristGuide.init();

	}
	
	/************* Init Essentials ************/
	$.touristGuide.init = function() {
		
		if (params.onInit) {
			params.onInit.call(this);
		}
		
		$('body').append('<div id="tg_base"></div>');
		
		for(i=1;i<=4;i++){
			$('#tg_base').append('<div class="tg_step_bg" data-tg-id="' + i + '"></div>');
		}
		$('#tg_base').append('<div id="tg_styler"><div id="tg_wrapper"></div></div>').height($(document).trueHeight() + 'px');
		
		/************** Init Events ****************/
		
		$(document).delegate('#tg-nav-next','click', function(){
			$.touristGuide.next();
			return false;
		});
		
		$(document).delegate('#tg-nav-prev','click', function(){
			$.touristGuide.prev();
			return false;
		});
		
		$(document).delegate('#tg-nav-end','click', function(){
			$.touristGuide.finish();
			return false;
		});
		
		if(params.closeOnClick){
			$(document).delegate('.tg_step_bg','click', function(){
				$.touristGuide.finish('overlayClick');
				return false;
			});
		}
		
		if(params.startOnLoad){
			$.touristGuide.go(params.startStep);
			$.touristGuide.startAutoPlay();
		}
		
	}
	
	/************* GoTo Method ************/
	$.touristGuide.go = function(id) {
		
		if (params.onGo) {
			params.onGo.call(this);
		}
		
		if(!id){
			$.touristGuide.finish();
			return; // Finish
		}
		else if(id === true){
			return; // Stay
		}
		
		if (params.onBeforeSwitch) {
			params.onBeforeSwitch.call(this);
		}

		thisStep = params.steps['step_' + id];
		nav = '';
		
		activeId = id;
		
		/***************** ScrollTo *****************/
		if(params.scrollTo){
			$(thisStep.dataFor).ScrollTo(thisStep.dataScrollToObj);
		}
		
		$('#tg_styler').fadeOut(params.highliteHideSpeed,function(){
			
			var wrapper = $('#tg_wrapper');
		
			// Fill Tooltip Box
			wrapper.html('<div id="tg_wrapper_cell"><span class="arrow"></span>' + $(params.stepsClass + ':nth-child(' + id + ')').html() + '</div>').attr('class','').attr('style','');

			// Add navigation
			$.touristGuide.addNav();
			
			// Set CSS for ToolTip box based on it's position and add class by position	
			var tgCss = {}
			
			switch(thisStep.dataPosition){
					case 'top':
					default:
						tgCss = {
							'top' : ((thisStep.dataOverlayOffset * 2) + thisStep.dataTipOffsetTop) + 'px',
							'left' : '50%',
							'marginLeft' : (((thisStep.dataTgWidth / 2) - thisStep.dataTipOffsetLeft + thisStep.dataOverlayOffset) * -1) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
					case 'bottom':
						tgCss = {
							'top' : (thisStep.dataHeight + thisStep.dataTipOffsetTop + (thisStep.dataOverlayOffset * 2)) + 'px',
							'left' : '50%',
							'marginLeft' : (((thisStep.dataTgWidth / 2) - thisStep.dataTipOffsetLeft) * -1) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
					case 'left':
						tgCss = {
							'top' : '50%',
							'marginTop' : (($('#tg_wrapper').height() / 2) * -1) + 'px',
							'left' : ((thisStep.dataTgWidth - thisStep.dataTipOffsetLeft + thisStep.dataOverlayOffset) * -1) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
					case 'right':
						tgCss = {
							'top' : '50%',
							'marginTop' : (($('#tg_wrapper').height() / 2) * -1) + 'px',
							'left' : (thisStep.dataWidth + thisStep.dataTipOffsetLeft + (thisStep.dataOverlayOffset * 2)) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
					case 'topLeft':
						tgCss = {
							'top' :  (0 + thisStep.dataTipOffsetTop) + 'px',
							'left' : ((thisStep.dataTgWidth - thisStep.dataTipOffsetLeft + thisStep.dataOverlayOffset) * -1) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
					case 'topRight':
						tgCss = {
							'top' : (0 + thisStep.dataTipOffsetTop) + 'px',
							'left' : (thisStep.dataWidth + thisStep.dataTipOffsetLeft + (thisStep.dataOverlayOffset * 2)) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
					case 'bottomLeft':
						tgCss = {
							'bottom' : (0 - thisStep.dataTipOffsetTop) + 'px',
							'left' : ((thisStep.dataTgWidth - thisStep.dataTipOffsetLeft + thisStep.dataOverlayOffset) * -1) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
					case 'bottomRight':
						tgCss = {
							'bottom' : (0 - thisStep.dataTipOffsetTop) + 'px',
							'left' : (thisStep.dataWidth + thisStep.dataTipOffsetLeft + (thisStep.dataOverlayOffset * 2)) + 'px',
							'width' : thisStep.dataTgWidth + 'px'
						}
						break;
			}
			
			tgCss.transition = 'none';
			
			$('#tg_wrapper').css(tgCss);
			
			// Fix positions & Init showings
			var t = setTimeout(function(){
				
				$.touristGuide.createHighlite();
	
				$('#tg_base').show(0);
				
				if(thisStep.dataAnimation){
					
					$.touristGuide.doAnimation(tgCss);
					
				} else {
					
					var t = setTimeout(function(){
						var fixCss = {}
					
						switch(thisStep.dataPosition){
								case 'left':
								case 'right':
									fixCss.top = '50%';
									fixCss.marginTop = (($('#tg_wrapper').trueHeight() / 2) * -1) + 'px';
									break;
								case 'top': 
									fixCss.top = (( $('#tg_wrapper').trueHeight() * -1) + thisStep.dataTipOffsetTop - thisStep.dataOverlayOffset) + 'px';
									break;
						}
					
						$('#tg_wrapper').css(fixCss);
					},10);
					
					$('#tg_wrapper').css(tgCss).addClass(thisStep.dataPosition).fadeIn(params.tipShowSpeed);
				}
					
			}, 15);
			
		});
		
		/************* Create Overlays ************/		
		
		var tgId, css;
		
		$('.tg_step_bg').each(function(){
			
			tgId = parseInt($(this).data('tgId'));
			
			switch(tgId){
				case 1:
					css = {
						'width' : '100%',
						'height' : (thisStep.dataOffsetTop - thisStep.dataOverlayOffset) + 'px',
						'top' : 0,
						'left' : 0
					}
					break;
				case 2:
					css = {
						'width' : (thisStep.dataOffsetLeft - thisStep.dataOverlayOffset) + 'px',
						'height' : (thisStep.dataHeight + (thisStep.dataOverlayOffset * 2)) + 'px',
						'top' : (thisStep.dataOffsetTop - thisStep.dataOverlayOffset) + 'px',
						'left' : 0
					}
					break;
				case 3:
					css = {
						'width' : ((documentWidth - (thisStep.dataOffsetLeft + thisStep.dataWidth)) - thisStep.dataOverlayOffset) + 'px',
						'height' : (thisStep.dataHeight + (thisStep.dataOverlayOffset * 2)) + 'px',
						'top' : (thisStep.dataOffsetTop - thisStep.dataOverlayOffset) + 'px',
						'right' : 0
					}
					break;
				case 4:
					css = {
						'width' : '100%',
						'height' : ((documentHeight - (thisStep.dataOffsetTop + thisStep.dataHeight)) - thisStep.dataOverlayOffset) + 'px',
						'top' : ((thisStep.dataOffsetTop + thisStep.dataHeight) + thisStep.dataOverlayOffset) + 'px',
						'left' : 0
					}
					break;
			}
			$(this).css(css);
			
		});
		
		/************* Show Things ************/		
		
		if($('.tg_step_bg').not(':visible')){
			$('.tg_step_bg').fadeIn(params.overlayShowSpeed, function(){
				//$('#tg_wrapper').fadeIn(params.tipShowSpeed);
			});
		}
		else{
			//$('#tg_wrapper').fadeIn(params.tipShowSpeed);
		}
		$('#tg_styler').fadeIn(params.highliteShowSpeed);
		
		if (params.onAfterSwitch) {
			params.onAfterSwitch.call(this);
		}

	}

	/************* Next Method ************/
	$.touristGuide.next = function() {
		
		if (params.onNext) {
			params.onNext.call(this);
		}
		
		var nextId = ($(params.stepsClass + ':nth-child(' + (activeId + 1) + ')').length > 0) ? activeId + 1 : false;
		
		$.touristGuide.go(nextId);
		
	}
	
	/************* Prev Method ************/
	$.touristGuide.prev = function() {
		
		if (params.onPrev) {
			params.onPrev.call(this);
		}
		
		var nextId = ($(params.stepsClass + ':nth-child(' + (activeId - 1) + ')').length > 0) ? activeId - 1 : false;
		
		$.touristGuide.go(nextId);
		
	}
	
	/************* Finish Method ************/
	$.touristGuide.finish = function(from) {
			
			if (params.onFinish) {
				params.onFinish.call(this);
			}
			
			if(params.askOnClickClose && from == 'overlayClick'){
				var p = confirm(params.sure);
				if (!p){
					return;
				}
			}
			
			$('.tg_step_bg').fadeOut(params.overlayHideSpeed);
			$('#tg_wrapper').fadeOut(params.tipHideSpeed);
			$('#tg_styler').fadeOut(params.highliteHideSpeed);
			$('#tg_base').fadeOut(params.overlayHideSpeed);

	}
	
	/************* Start Autoplay ************/
	$.touristGuide.startAutoPlay = function() {
			
			if(params.autoPlay){
			
				var inter = setInterval(function(){
					
					if((activeId == totalSteps) && params.autoPlayAutoEnd){
						$.touristGuide.finish();
						clearInterval(inter);
					}
					else if((activeId == totalSteps) && !params.autoPlayAutoEnd){
						clearInterval(inter);
					}
					else{
						$.touristGuide.next();
					}

				},params.autoPlaySpeed);
				
				inter();
				
			}

	}
	
	/**************** PRIVATE METHODS!!! DON'T USE!!! *******************/
	
	$.touristGuide.addNav = function(){

		if(thisStep.dataNav){
			
			nav = '<div class="tg-nav">';
			
			if((thisStep.dataNav == 'prev' || thisStep.dataNav == 'both') && activeId != 1){
				nav = nav + '<a href="#nogo" id="tg-nav-prev">' + params.prevText + '</a>';
			}
			if((thisStep.dataNav == 'next' || thisStep.dataNav == 'both') && activeId != totalSteps){
				nav = nav + '<a id="tg-nav-next" href="#nogo">' + params.nextText + '</a>';
			}
			
			if((params.showEnd == 'everywhere') || (params.showEnd == 'end' && activeId == totalSteps)){
				nav = nav + '<a id="tg-nav-end" href="#nogo">' + params.endText + '</a>';
			}

			nav = nav + '</div>';
			
			$(nav).appendTo('#tg_wrapper_cell');
			
		}
		
	}
	
	$.touristGuide.createHighlite = function(){
		
		$('#tg_styler').css({
			'left' : thisStep.dataOffsetLeft - thisStep.dataOverlayOffset + 'px',
			'top' : thisStep.dataOffsetTop - thisStep.dataOverlayOffset + 'px',
			'height' : thisStep.dataHeight + (thisStep.dataOverlayOffset * 2) + 'px',
			'width' : thisStep.dataWidth + (thisStep.dataOverlayOffset * 2) + 'px'
		});
		
	}
	
	/**************** Animation parser method *****************/

	// tipAnimation: '1000,2000(top:2000px;left:-4000px;):linear|2000(top:2000px;left:-4000px;):linear',
	
	$.touristGuide.animationParser = function(){
		
		if(params.tipAnimation){
			
			var animationFrames = {},frames,frameCss,frameCssSplit;
			
			frames = params.tipAnimation.split("|");
			
			for (var i=0; i < frames.length; i++) {
				
				if(frames[i].split("(")[0].indexOf(",") == -1){
					animationFrames['frame' + i] = {'duration' : (frames[i].split("[")[0] != '') ? parseInt(frames[i].split("[")[0]) : 0}
					animationFrames['frame' + i].delay = 0;
				}
				else{
					animationFrames['frame' + i] = {'duration' : parseInt((frames[i].split("[")[0]).split(",")[0])}
					animationFrames['frame' + i].delay =  parseInt((frames[i].split("[")[0]).split(",")[1]);
				}
					
				animationFrames['frame' + i].timing = (frames[i].split(":").reverse()[0].indexOf("]") > -1) ? 'ease' : frames[i].split(":").reverse()[0] ;
				animationFrames['frame' + i].css = (frames[i].split("[")[1]).split("]")[0];
				frameCss = (animationFrames['frame' + i].css).split(";");
				animationFrames['frame' + i].css = {}
				for (var a=0; a < frameCss.length; a++) {
					if(frameCss[a] != ''){
						animationFrames['frame' + i].css[$.trim(frameCss[a].split(":")[0])] = $.trim(frameCss[a].split(":")[1]);
					}
				}
				
				animationFrames['frame' + i].css['transition'] = 'all ' + parseFloat(animationFrames['frame' + i].duration / 1000) + 's ' + animationFrames['frame' + i].timing + ' ' + parseFloat(animationFrames['frame' + i].delay / 1000) + 's';

			};
			
			return animationFrames;
	
		}
		else{
			return false;
		}
	}
	
	$.touristGuide.doAnimation = function(tgCss){
		
		var tg = $('#tg_wrapper');
		var styler = $('#tg_styler');
		var length = 0;
		var d, allD = 0;
		var e = "tg";
		
		styler.show(0);
		tg.show(0).addClass(thisStep.dataPosition).css(thisStep.dataAnimation.frame0.css);
		
		var timi = setTimeout(function(){
			$.touristGuide.doFrame(thisStep,tgCss);
		},thisStep.dataAnimation.frame0.duration + thisStep.dataAnimation.frame0.delay);
	}
	
	$.touristGuide.doFrame = function(frames,tgCss){
		
		var i = 'frame' + (didFrame + 1);
		
		if(typeof frames.dataAnimation[i] != 'undefined'){
			
			var d = parseInt(frames.dataAnimation[i].delay);
			var du = parseInt(frames.dataAnimation[i].duration);	
			
			var timer = setTimeout(function(){
				
				$('#tg_wrapper').css(frames.dataAnimation[i].css);
				
				var miniT = setTimeout(function(){
					$.touristGuide.doFrame(frames,tgCss);
				},10);
				
			}, d+du);
			
			lastAnimTime = d+du;
			
			didFrame++;
		
		}
		else{
			
			didFrame = 0;
			
			var fixAnim = setTimeout(function(){
				
			$('#tg_wrapper').css($.extend(true,tgCss,frames.dataAnimationReset));
				
				var innerTO = setTimeout(function(){
					
					var fixCss = {}
					
					switch(frames.dataPosition){
							case 'left':
							case 'right':
								fixCss.top = '50%';
								fixCss.marginTop = (($('#tg_wrapper').height() / 2) * -1) + 'px';
								break;
							case 'top': 
								fixCss.top = (( $('#tg_wrapper').trueHeight() * -1) + thisStep.dataTipOffsetTop - thisStep.dataOverlayOffset) + 'px';
								break;
					}
				
					$('#tg_wrapper').css(fixCss);
						
				},10)
				
		},lastAnimTime);
			
		}
		
	}
	
	$.touristGuide.calculateFullTime = function(obj){
		
		var full = 0;
		var length = 0;
		
		for(var i in obj.dataAnimation) length++;
		
		for (var i=0; i < length; i++) {
			
			full = parseInt(full) + parseInt(obj.dataAnimation['frame' + i].delay) + parseInt(obj.dataAnimation['frame' + i].duration);
			
		};
		
		return full;
		
	}
	
})(jQuery);



/*
 * Some Functions
 * 
 */

function transform_support(){
		var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
    el = document.createElement('div'),
    support=0;

		while( support !== true ){
		  support = document.createElement('div').style[prefixes[support++]] != undefined || support;
		}
		
		return support;
}

function transition_support(){
		var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition'.split(' '),
    el = document.createElement('div'),
    support=0;

		while( support !== true ){
		  support = document.createElement('div').style[prefixes[support++]] != undefined || support;
		}
		
		return support;
}

function replaceAll(txt, replace, with_this) {
  return txt.replace(new RegExp(replace, 'g'),with_this);
}



/**
 * @depends jquery
 * @name jquery.scrollto
 * @package jquery-scrollto {@link http://balupton.com/projects/jquery-scrollto}
 */

/**
 * jQuery Aliaser
 */
(function(window,undefined){
	// Prepare
	var jQuery, $, ScrollTo;
	jQuery = $ = window.jQuery;

	/**
	 * jQuery ScrollTo (balupton edition)
	 * @version 1.2.0
	 * @date July 9, 2012
	 * @since 0.1.0, August 27, 2010
	 * @package jquery-scrollto {@link http://balupton.com/projects/jquery-scrollto}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	ScrollTo = $.ScrollTo = $.ScrollTo || {
		/**
		 * The Default Configuration
		 */
		config: {
			duration: 400,
			easing: 'swing',
			callback: undefined,
			durationMode: 'each',
			offsetTop: 0,
			offsetLeft: 0
		},

		/**
		 * Configure ScrollTo
		 */
		configure: function(options){
			// Apply Options to Config
			$.extend(ScrollTo.config, options||{});

			// Chain
			return this;
		},

		/**
		 * Perform the Scroll Animation for the Collections
		 * We use $inline here, so we can determine the actual offset start for each overflow:scroll item
		 * Each collection is for each overflow:scroll item
		 */
		scroll: function(collections, config){
			// Prepare
			var collection, $container, container, $target, $inline, position,
				containerScrollTop, containerScrollLeft,
				containerScrollTopEnd, containerScrollLeftEnd,
				startOffsetTop, targetOffsetTop, targetOffsetTopAdjusted,
				startOffsetLeft, targetOffsetLeft, targetOffsetLeftAdjusted,
				scrollOptions,
				callback;

			// Determine the Scroll
			collection = collections.pop();
			$container = collection.$container;
			container = $container.get(0);
			$target = collection.$target;

			// Prepare the Inline Element of the Container
			$inline = $('<span/>').css({
				'position': 'absolute',
				'top': '0px',
				'left': '0px'
			});
			position = $container.css('position');

			// Insert the Inline Element of the Container
			$container.css('position','relative');
			$inline.appendTo($container);

			// Determine the top offset
			startOffsetTop = $inline.offset().top;
			targetOffsetTop = $target.offset().top;
			targetOffsetTopAdjusted = targetOffsetTop - startOffsetTop - parseInt(config.offsetTop,10);

			// Determine the left offset
			startOffsetLeft = $inline.offset().left;
			targetOffsetLeft = $target.offset().left;
			targetOffsetLeftAdjusted = targetOffsetLeft - startOffsetLeft - parseInt(config.offsetLeft,10);

			// Determine current scroll positions
			containerScrollTop = container.scrollTop;
			containerScrollLeft = container.scrollLeft;

			// Reset the Inline Element of the Container
			$inline.remove();
			$container.css('position',position);

			// Prepare the callback
			callback = function(event){
				// Check
				if ( collections.length === 0 ) {
					// Callback
					if ( typeof config.callback === 'function' ) {
						config.callback.apply(this,[event]);
					}
				}
				else {
					// Recurse
					ScrollTo.scroll(collections,config);
				}
				// Return true
				return true;
			};

			// Handle if we only want to scroll if we are outside the viewport
			if ( config.onlyIfOutside ) {
				// Determine current scroll positions
				containerScrollTopEnd = containerScrollTop + $container.height();
				containerScrollLeftEnd = containerScrollLeft + $container.width();

				// Check if we are in the range of the visible area of the container
				if ( containerScrollTop < targetOffsetTopAdjusted && targetOffsetTopAdjusted < containerScrollTopEnd ) {
					targetOffsetTopAdjusted = containerScrollTop;
				}
				if ( containerScrollLeft < targetOffsetLeftAdjusted && targetOffsetLeftAdjusted < containerScrollLeftEnd ) {
					targetOffsetLeftAdjusted = containerScrollLeft;
				}
			}

			// Determine the scroll options
			scrollOptions = {};
			if ( targetOffsetTopAdjusted !== containerScrollTop ) {
				scrollOptions.scrollTop = targetOffsetTopAdjusted+'px';
			}
			if ( targetOffsetLeftAdjusted !== containerScrollLeft ) {
				scrollOptions.scrollLeft = targetOffsetLeftAdjusted+'px';
			}

			// Perform the scroll
			if ( scrollOptions.scrollTop || scrollOptions.scrollLeft ) {
				$container.animate(scrollOptions, config.duration, config.easing, callback);
			}
			else {
				callback();
			}

			// Return true
			return true;
		},

		/**
		 * ScrollTo the Element using the Options
		 */
		fn: function(options){
			// Prepare
			var collections, config, $container, container;
			collections = [];

			// Prepare
			var	$target = $(this);
			if ( $target.length === 0 ) {
				// Chain
				return this;
			}

			// Handle Options
			config = $.extend({},ScrollTo.config,options);

			// Fetch
			$container = $target.parent();
			container = $container.get(0);

			// Cycle through the containers
			while ( ($container.length === 1) && (container !== document.body) && (container !== document) ) {
				// Check Container for scroll differences
				var scrollTop, scrollLeft;
				scrollTop = $container.css('overflow-y') !== 'visible' && container.scrollHeight !== container.clientHeight;
				scrollLeft =  $container.css('overflow-x') !== 'visible' && container.scrollWidth !== container.clientWidth;
				if ( scrollTop || scrollLeft ) {
					// Push the Collection
					collections.push({
						'$container': $container,
						'$target': $target
					});
					// Update the Target
					$target = $container;
				}
				// Update the Container
				$container = $container.parent();
				container = $container.get(0);
			}

			// Add the final collection
			collections.push({
				'$container': $(
					($.browser.msie || $.browser.mozilla) ? 'html' : 'body'
				),
				'$target': $target
			});

			// Adjust the Config
			if ( config.durationMode === 'all' ) {
				config.duration /= collections.length;
			}

			// Handle
			ScrollTo.scroll(collections,config);

			// Chain
			return this;
			
		}
	};

	// Apply our jQuery Prototype Function
	$.fn.ScrollTo = $.ScrollTo.fn;

})(window);

( function ( $ ) {
 
    var getPropIE = function ( name ) {
 
        return Math.max(
            document.documentElement["client" + name],
            document.documentElement["scroll" + name],
            document.body["scroll" + name]
        );
 
    }
 
    $.fn.trueWidth = function() {  
 
        return ( ( $.browser.msie && this.get()[0].nodeType === 9 ) ? getPropIE( 'Width' ) : this.width() );
 
    };
 
    $.fn.trueHeight = function() {  
 
        return ( ( $.browser.msie && this.get()[0].nodeType === 9 ) ? getPropIE( 'Height' ) : this.height() );
 
    };
 
} )( jQuery );
