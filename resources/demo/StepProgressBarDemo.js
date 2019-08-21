( function( mw, $ ) {
	var $el = $( '#oojsplus-data-demos-stepsProgress' );

	var data = {
		steps: {
			step1: {
				label: 'Step 1'
			},
			step2: {
				label: 'Step 2'
			},
			step3: {
				label: 'Step 3'
			},
			step4: {
				label: 'Step 4'
			},
			step5: {
				label: 'Step 5'
			},
			step6: {
				label: 'Step 6'
			},
			step7: {
				label: 'Step 7',
				isFinal: false
			},
			step8: {
				label: 'Step 8'
			},
			step9: {
				label: 'Step 9'
			},
			step10: {
				label: 'Step 10'
			}
		},
		currentStep: 'step6'
	};

	var sp = new OOJSPlus.ui.widget.StepProgressBar( data );
	$el.append( sp.$element );

} )( mediaWiki, jQuery );