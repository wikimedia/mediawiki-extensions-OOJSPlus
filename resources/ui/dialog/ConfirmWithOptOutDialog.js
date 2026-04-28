/**
 * Constructor options:
 * - all for normal MessageDialog
 * - preferenceKey: the user option key to store the opt-out value in
 * - optOutOptions: {
 *     label: label for the opt-out checkbox,
 *     help: help text for the opt-out checkbox (displayed as a tooltip on the label by default)
 *     helpInline: if true, the help text will be displayed inline instead of as a tooltip
 *   }
 *
 * @param {Object} config
 * @constructor
 */
OOJSPlus.ui.dialog.ConfirmWithOptOutDialog = function ( config ) {
	OOJSPlus.ui.dialog.ConfirmWithOptOutDialog.parent.call( this, config );

	this.preferenceKey = config.preferenceKey;
	this.currentValue = mw.user.options.get( this.preferenceKey ) === '1';

	this.optOutCheckbox = new OO.ui.CheckboxInputWidget( {
		selected: this.currentValue
	} );
	this.optOutCheckbox.connect( this, { change: 'onOptOutChange' } );
	const layoutOptions = Object.assign( {
		label: mw.msg( 'oojsplus-ui-dialog-confirm-with-opt-out-opt-out-label' ),
		align: 'inline'
	}, config.optOutOptions || {} );

	this.optOutLayout = new OO.ui.FieldLayout( this.optOutCheckbox, layoutOptions );
};

OO.inheritClass( OOJSPlus.ui.dialog.ConfirmWithOptOutDialog, OO.ui.MessageDialog );

OOJSPlus.ui.dialog.ConfirmWithOptOutDialog.static.name = 'oojsplus.confirmWithOptOut';

OOJSPlus.ui.dialog.ConfirmWithOptOutDialog.prototype.initialize = function () {
	OOJSPlus.ui.dialog.ConfirmWithOptOutDialog.parent.prototype.initialize.call( this );

	this.container.$element.append(
		new OO.ui.PanelLayout( { expanded: false, padded: true } )
			.$element.append( this.optOutLayout.$element )
	);
};

OOJSPlus.ui.dialog.ConfirmWithOptOutDialog.prototype.onOptOutChange = function ( value ) {
	new mw.Api().saveOption( this.preferenceKey, value ? '1' : '0' ).catch( () => {
		// Revert the checkbox state if the API request fails
		this.optOutCheckbox.setValue( this.currentValue );
		mw.notify( mw.msg( 'oojsplus-ui-dialog-confirm-with-opt-out-save-error' ), { type: 'error' } );
	} );
};

OOJSPlus.ui.dialog.ConfirmWithOptOutDialog.prototype.getBodyHeight = function () {
	const baseHeight = OOJSPlus.ui.dialog.ConfirmWithOptOutDialog.parent.prototype.getBodyHeight.call( this );
	const optOutHeight = this.optOutLayout.$element.outerHeight( true );
	return baseHeight + optOutHeight + 30;
};

OOJSPlus.ui.confirmWithOptOut = function ( message, config ) {
	const wm = OO.ui.getWindowManager();
	if ( wm.hasWindow( 'oojsplus.confirmWithOptOut' ) ) {
		wm.removeWindows( [ 'oojsplus.confirmWithOptOut' ] );
	}
	const dialog = new OOJSPlus.ui.dialog.ConfirmWithOptOutDialog( config );
	wm.addWindows( [ dialog ] );
	return wm.openWindow( dialog, Object.assign( {
		message: message
	}, config ) ).closed.then( ( data ) => !!( data && data.action === 'accept' ) );
};
