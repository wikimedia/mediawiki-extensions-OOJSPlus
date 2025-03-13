/**
 * Usage:
 * new OOJSPlus.ui.widget.TitleInputWidget( {
 *  namespaces: [ 0, 6 ], // Limit search to only NS_MAIN and NS_FILE
 *  contentPagesOnly: false, // Whether to only search in pages in ContentNamespaces (default: true)
 *  mustExist: false, // Whether to only allow existing pages (default: true): Use with `false` to allow creating new pages
 *  prefix: '', // Prefix to add to the query (default: ''). Can be used to limit the search to eg. subpages of particular page
 *  contentModels: [ 'wikitext', 'css' ] // Limit search to only pages with these content models
 * } );
 *
 * Limitations:
 * - If value is set manually, eg. picker.setValue( 'Main Page' ), method 'getSelectedTitle` cannot be called
 *
 * @param {Object} cfg
 * @constructor
 */
OOJSPlus.ui.widget.TitleInputWidget = function ( cfg ) {
	cfg = cfg || {};
	this.selectedTitle = null;
	this.ignoreChange = false;
	OOJSPlus.ui.mixin.TitleQuery.call( this, cfg );
	this.contentModels = cfg.contentModels || null;
	this.validationOverride = false;

	OOJSPlus.ui.widget.TitleInputWidget.parent.call( this, Object.assign( {}, cfg, {
		autocomplete: false
	} ) );

	this.lookupMenu.connect( this, {
		toggle: 'onLookupMenuToggle'
	} );

	this.$element.addClass( 'oojsplus-titlePicker' );

	this.connect( this, { change: 'deselectTitle' } );
};

OO.inheritClass( OOJSPlus.ui.widget.TitleInputWidget, mw.widgets.TitleInputWidget );
OO.mixinClass( OOJSPlus.ui.widget.TitleInputWidget, OOJSPlus.ui.mixin.TitleQuery );

OOJSPlus.ui.widget.TitleInputWidget.prototype.getTitleObject = function () {
	return this.selectedTitle;
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.deselectTitle = function () {
	if ( this.ignoreChange ) {
		return;
	}
	this.selectedTitle = null;
	if ( this.value !== '' && this.mustExist ) {
		this.setValidityFlag( false );
	}
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.abortRequest = function () {
	// DO NOTHING
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.getValidity = function () {
	const dfd = $.Deferred();

	if ( this.isRequired() && this.value === '' ) {
		dfd.reject();
		return dfd.promise();
	}

	if ( this.validationOverride || !this.mustExist || this.getTitleObject() !== null ) {
		dfd.resolve();
	} else {
		dfd.reject();
	}
	return dfd.promise();
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.onLookupMenuToggle = function ( visible ) { // eslint-disable-line no-unused-vars
	if ( this.lookupInputFocused ) {
		this.focus();
	}
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.onLookupInputFocus = function () {
	if ( this.lookupInputFocused ) {
		return;
	}
	// Return parent value
	return OOJSPlus.ui.widget.TitleInputWidget.parent.prototype.onLookupInputFocus.call( this );
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.focus = function () {
	this.$input.trigger( 'focus' );
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
	if ( !this.allowSuggestionsWhenEmpty && this.$input.val() === '' ) {
		// Seems that config alone does not prevent the menu from opening on empty input
		return [];
	}
	return response || [];
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.setValue = function ( item ) {
	if ( !( item instanceof OO.ui.MenuOptionWidget ) ) {
		if ( !item ) {
			this.$input.val( '' );
			this.value = '';
			this.deselectTitle();
			return;
		}
		// Cannot set Title from a string :(
		this.setDisabled( false );
		this.popPending();
		this.$input.val( item );
		this.onEdit();
		this.validationOverride = true;
	} else {
		OOJSPlus.ui.widget.TitleInputWidget.parent.prototype.setValue.call( this, item.getData().prefixed );
		this.selectedTitle = item.getData();
	}
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.onLookupMenuChoose = function ( item ) {
	this.closeLookupMenu();
	this.setLookupsDisabled( true );
	this.ignoreChange = true;
	this.setValue( item );
	this.emit( 'choose', item );
	this.ignoreChange = false;
	this.setLookupsDisabled( false );
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.onEdit = function () {
	const value = this.$input.val();
	if ( value !== this.value ) {
		this.validationOverride = false;
		this.value = value;
		this.emit( 'change', value );
	}
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.getValue = function () {
	if ( this.selectedTitle ) {
		return this.selectedTitle.prefixed;
	}
	return OOJSPlus.ui.widget.TitleInputWidget.parent.prototype.getValue.call( this );
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.getRawValue = function () {
	return this.value;
};

OOJSPlus.ui.widget.TitleInputWidget.prototype.getMWTitle = function () {
	if ( !this.selectedTitle ) {
		return null;
	}
	return new mw.Title( this.selectedTitle.dbkey, this.selectedTitle.namespace );
};
