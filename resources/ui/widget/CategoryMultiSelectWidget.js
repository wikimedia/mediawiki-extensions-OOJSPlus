OOJSPlus.ui.widget.CategoryMultiSelectWidget = function ( config ) {
	config = config || {};
	config.namespaces = null;
	config.contentPagesOnly = false;
	config.mustExist = false;
	config.contentModels = null;
	config.prefix = '';
	OOJSPlus.ui.widget.CategoryMultiSelectWidget.parent.call( this, config );

	this.$element.addClass( 'oojsplus-widget-categoryMultiselectWidget' );
};

OO.inheritClass( OOJSPlus.ui.widget.CategoryMultiSelectWidget, OOJSPlus.ui.widget.TitleMultiselectWidget );

OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.makeLookup = function ( query, data ) {
	return mws.commonwebapis.category.query( query, data );
};

OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
	const items = [];
	let len, i;

	for ( i = 0, len = data.length; i < len; i++ ) {
		items.push( new OO.ui.MenuOptionWidget( { data: data[ i ], label: data[ i ].title } ) );
	}
	return items;
};

OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.getSelectedCategories = function () {
	return this.getValue();
};
