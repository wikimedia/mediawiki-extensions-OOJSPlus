OOJSPlus.ui.widget.CategoryInputWidget = function ( config ) {
	config = config || {};
	config.namespaces = null;
	config.contentPagesOnly = false;
	config.mustExist = false;
	config.contentModels = null;
	config.prefix = '';
	OOJSPlus.ui.widget.CategoryInputWidget.parent.call( this, config );

	this.$element.addClass( 'oojsplus-widget-categoryInputWidget' );
	this.lookupMenu.$element.addClass( 'oojsplus-widget-categoryInputWidget-menu' );
};

OO.inheritClass( OOJSPlus.ui.widget.CategoryInputWidget, OOJSPlus.ui.widget.TitleInputWidget );

OOJSPlus.ui.widget.CategoryInputWidget.prototype.makeLookup = function ( query, data ) {
	return mws.commonwebapis.category.query( query, data );
};

OOJSPlus.ui.widget.CategoryInputWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
	const items = [];
	let len, i;

	for ( i = 0, len = data.length; i < len; i++ ) {
		items.push( new OO.ui.MenuOptionWidget( { data: data[ i ], label: data[ i ].title } ) );
	}
	return items;
};
