OOJSPlus.ui.widget.TitleWidgetMenuOption = function ( cfg, query ) {
	const data = cfg.data || {};
	let label = cfg.label || data.display_title || data.leaf_title || data.title;
	label = this.boldQueryMatch( label, query );
	OOJSPlus.ui.widget.TitleWidgetMenuOption.parent.call( this, {
		data: data,
		label: new OO.ui.HtmlSnippet( label )
	} );
	this.namespaceText = data.namespace_text || '';
	this.baseTitle = data.base_title || '';
	this.$element.addClass( 'oojsplus-title-widget-menu-option' );
	if ( data.missing || false ) {
		this.$element.addClass( 'oojsplus-title-widget-menu-option-missing' );
	}

	this.subLayout = new OO.ui.HorizontalLayout( {
		items: [
			new OO.ui.LabelWidget( {
				label: this.namespaceText,
				classes: [ 'oojsplus-title-widget-menu-option-namespace' ]
			} ),
			new OO.ui.LabelWidget( {
				label: new OO.ui.HtmlSnippet( this.boldQueryMatch( this.baseTitle, query ) ),
				classes: [ 'oojsplus-title-widget-menu-option-basetitle' ]
			} )
		]
	} );
	this.$element.append( this.subLayout.$element );
};

OO.inheritClass( OOJSPlus.ui.widget.TitleWidgetMenuOption, OO.ui.MenuOptionWidget );

OOJSPlus.ui.widget.TitleWidgetMenuOption.prototype.boldQueryMatch = function ( label, query ) {
	if ( !query ) {
		return label;
	}
	const escapedQuery = query.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
	const regex = new RegExp( `(${ escapedQuery })`, 'gi' );
	return label.replace( regex, '<strong>$1</strong>' );
};
