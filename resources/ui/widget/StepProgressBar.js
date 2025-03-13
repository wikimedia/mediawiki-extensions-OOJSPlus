( function ( mw, $ ) {
	OOJSPlus.ui.widget.StepProgressBar = function ( cfg ) {
		cfg = cfg || {};

		OOJSPlus.ui.widget.StepProgressBar.parent.call( this, cfg );

		this.steps = {};
		this.finalStep = {
			label: mw.message( 'oojsplus-stepprogressbar-default-final-label' ).text()
		};
		this.currentStep = cfg.currentStep || false;
		this.maxStep = cfg.maxStep || null;
		this.makeLayout();
		this.addSteps( cfg.steps || {} );
		if ( !this.currentStep ) {
			this.setStep( this.getDefaultNextStep() );
		} else {
			this.setStep( this.currentStep );
		}
	};

	OO.inheritClass( OOJSPlus.ui.widget.StepProgressBar, OO.ui.Widget );

	OOJSPlus.ui.widget.StepProgressBar.static.tagName = 'div';

	OOJSPlus.ui.widget.StepProgressBar.prototype.makeLayout = function () {
		this.$listContainer = $( '<ol>' ).addClass( 'oojsplus-widget-steps-progress' );
		this.$element.append( this.$listContainer );
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.addSteps = function ( steps ) {
		for ( const stepName in steps ) {
			const step = steps[ stepName ];
			if ( step.completionStep ) {
				this.finalStep = step;
				continue;
			}
			this.addStep( stepName, step );
		}
		this.finalStep.classes = this.finalStep.hasOwnProperty( 'classes' ) ?
			this.finalStep.classes.concat( [ 'final-step' ] ) :
			[ 'final-step' ];
		this.addStep( 'final', this.finalStep );
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.addStep = function ( name, config ) {
		const classes = [ 'steps-progress-step', 'todo', 'disabled' ].concat( config.classes || [] );
		const $stepItem = $( '<li>' ) // eslint-disable-line mediawiki/class-doc
			.addClass( classes )
			.attr( 'data-step-name', name )
			.html( config.label );
		$stepItem.on( 'click', this.onStepClick.bind( this ) );
		this.steps[ name ] = $stepItem;
		this.$listContainer.append( $stepItem );
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.setStep = function ( name ) {
		if ( !this.steps.hasOwnProperty( name ) ) {
			return;
		}
		let maxReached = false;

		this.checkSetNewMax( name );

		for ( const stepName in this.steps ) {
			const step = this.steps[ stepName ];
			if ( stepName === this.maxStep ) {
				maxReached = true;
			}
			if ( !maxReached ) {
				step.removeClass( 'disabled todo' ).addClass( 'done' );
			}

			if ( stepName === name ) {
				step.removeClass( 'disabled' ).addClass( 'current' );
				this.currentStep = stepName;
				this.emit( 'stepSet', stepName );
				if ( !maxReached ) {
					step.addClass( 'done' );
				}
			} else {
				step.removeClass( 'current' );
			}
		}
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.checkSetNewMax = function ( step ) {
		if ( !this.steps.hasOwnProperty( step ) ) {
			return;
		}
		if ( !this.isStepEnabled( step ) ) {
			// If step is not enabled, it means it has not been reached yet
			this.maxStep = step;
		}
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.getDefaultNextStep = function () {
		if ( this.maxStep ) {
			let idx = Object.keys( this.steps ).indexOf( this.maxStep );
			if ( Object.keys( this.steps ).length - 1 > idx ) {
				idx++;
			}
			return Object.keys( this.steps )[ idx ];
		}
		return Object.keys( this.steps )[ 0 ];
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.nextStep = function () {
		if ( this.currentStep ) {
			const idx = Object.keys( this.steps ).indexOf( this.currentStep );
			if ( Object.keys( this.steps ).length - 1 > idx ) {
				this.setStep( Object.keys( this.steps )[ idx + 1 ] );
			}
			return;
		}
		this.setStep( Object.keys( this.steps )[ 0 ] );
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.onStepClick = function ( e ) {
		const $item = $( e.target );
		const id = $item.data( 'step-name' );
		if ( this.isStepEnabled( id ) ) {
			this.setStep( id );
		}
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.isStepEnabled = function ( step ) {
		if ( !this.steps.hasOwnProperty( step ) ) {
			return false;
		}
		if ( !this.maxStep ) {
			return false;
		}
		const steps = Object.keys( this.steps );
		if ( steps.indexOf( step ) <= steps.indexOf( this.maxStep ) ) {
			return true;
		}

		return false;
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.getCurrent = function () {
		return this.currentStep;
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.getMax = function () {
		return this.maxStep;
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.hasMoreSteps = function ( ignoreFinal ) {
		ignoreFinal = ignoreFinal || false;
		if ( !ignoreFinal ) {
			return this.currentStep !== 'final';
		}

		if ( Object.keys( this.steps ).indexOf( this.currentStep ) < Object.keys( this.steps ).length - 1 ) {
			return true;
		}
		return false;
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.setMax = function ( max ) {
		if ( this.steps.hasOwnProperty( max ) ) {
			this.maxStep = max;
		}
	};

	OOJSPlus.ui.widget.StepProgressBar.prototype.hasStep = function ( step ) {
		if ( this.steps.hasOwnProperty( step ) ) {
			return true;
		}
		return false;
	};
}( mediaWiki, jQuery ) );
