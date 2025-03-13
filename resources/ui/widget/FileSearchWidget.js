/**
 * Usage:
 * new OOJSPlus.ui.widget.FileSearchWidget( {
 *  // Options from parent
 *  extensions: [ 'png', 'jpg' ], // limit to these extensions
 *  mimeMajor: 'image', // limit to this major mime type
 *  mimeMinor: 'jpeg', // limit to this minor mime type
 * } );
 *
 * Limitations:
 * - If value is set manually, eg. picker.setValue( 'Main Page' ), method 'getSelectedTitle` cannot be called
 *
 * @param  {Object} cfg
 * @constructor
 */
OOJSPlus.ui.widget.FileSearchWidget = function ( cfg ) {
	cfg.namespaces = [ 6 ];
	cfg.contentPagesOnly = false;
	OOJSPlus.ui.widget.FileSearchWidget.parent.call( this, cfg );

	this.extensions = cfg.extensions || null;
	this.mimeMajor = cfg.mimeMajor || null;
	this.mimeMinor = cfg.mimeMinor || null;

	this.$element.addClass( 'oojsplus-filePicker' );
};

OO.inheritClass( OOJSPlus.ui.widget.FileSearchWidget, OOJSPlus.ui.widget.TitleInputWidget );

OOJSPlus.ui.widget.FileSearchWidget.prototype.makeLookup = function ( query, data ) {
	return mws.commonwebapis.file.query( query, data );
};

OOJSPlus.ui.widget.FileSearchWidget.prototype.extendFilters = function ( filters ) {
	if ( this.extensions !== null ) {
		filters.push( {
			property: 'file_extension',
			operator: 'in',
			type: 'list',
			value: this.extensions
		} );
	}
	if ( this.mimeMajor !== null ) {
		filters.push( {
			property: 'mime_major',
			operator: 'eq',
			type: 'string',
			value: this.mimeMajor
		} );
	}
	if ( this.mimeMinor !== null ) {
		filters.push( {
			property: 'mime_minor',
			operator: 'eq',
			type: 'string',
			value: this.mimeMinor
		} );
	}
	return filters;
};
