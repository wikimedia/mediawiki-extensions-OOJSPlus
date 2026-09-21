/**
 * Native date input
 *
 * @param {Object} [cfg]
 * @param {string|boolean} [cfg.placeholder] Text shown while no date is set. Pass `true`
 *  to use the default "No date selected" message. Browsers ignore the placeholder attribute
 *  on date inputs, so it is rendered as an overlay instead of the native date format hint
 *
 * Note: Displayed date format and calendar language are determined by the browser/OS locale,
 * not by the user's wiki language. Value is always `YYYY-MM-DD`. See doc/DateInput.MD
 */
OOJSPlus.ui.widget.DateInputWidget = function ( cfg ) {
	cfg = cfg || {};
	let placeholder = cfg.placeholder || '';
	if ( placeholder === true ) {
		placeholder = mw.message( 'oojsplus-date-input-placeholder' ).text();
	}
	OOJSPlus.ui.widget.DateInputWidget.parent.call( this, Object.assign( {}, cfg, { placeholder: '' } ) );
	this.$element.addClass( 'oojsplus-date-widget' );
	this.$input.attr( 'type', 'date' );

	if ( placeholder ) {
		this.$placeholder = $( '<span>' )
			.addClass( 'oojsplus-date-widget-placeholder' )
			.attr( 'aria-hidden', 'true' )
			.text( placeholder );
		this.$element.addClass( 'oojsplus-date-widget-has-placeholder' ).append( this.$placeholder );
		this.$input.attr( 'aria-placeholder', placeholder );
		this.connect( this, { change: 'updatePlaceholder' } );
		this.$input.on( 'keydown', ( e ) => {
			if ( /^[0-9]$/.test( e.key ) || this.editKeys.includes( e.key ) ) {
				this.$element.addClass( 'oojsplus-date-widget-typing' );
			}
		} );
		this.$input.on( 'blur', () => {
			this.$element.removeClass( 'oojsplus-date-widget-typing' );
		} );
		this.updatePlaceholder();
	}
};

OO.inheritClass( OOJSPlus.ui.widget.DateInputWidget, OO.ui.TextInputWidget );

OOJSPlus.ui.widget.DateInputWidget.prototype.editKeys = [
	'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Delete'
];

OOJSPlus.ui.widget.DateInputWidget.prototype.updatePlaceholder = function () {
	this.$element.toggleClass( 'oojsplus-date-widget-empty', this.getValue() === '' );
};
