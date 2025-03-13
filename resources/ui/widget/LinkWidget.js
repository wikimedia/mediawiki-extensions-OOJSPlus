OOJSPlus.ui.widget.LinkWidget = function ( cfg ) {
	cfg = cfg || {};

	const text = cfg.label || '';
	const classes = cfg.classes || [];
	classes.push( 'oojsplus-ui-widget-linkwidget-label' );

	this.$link = $( '<a>' );

	if ( cfg.href ) {
		this.$link.attr( 'href', cfg.href );
	}
	if ( cfg.target ) {
		classes.push( 'external' );
		this.$link.attr( 'target', '_blank' );
	}

	const attrClasses = classes.join( ' ' );
	this.$link.attr( 'class', attrClasses );

	this.$link.append( $( '<span>' ).text( text ) );
	cfg.label = this.$link;

	OOJSPlus.ui.widget.LinkWidget.super.call( this, cfg );

	OO.ui.mixin.IconElement.call( this, cfg );

	OO.ui.mixin.TabIndexedElement.call( this, Object.assign( {
		$tabIndexed: this.$link
	}, cfg ) );
	OO.ui.mixin.AccessKeyedElement.call( this, Object.assign( {
		$accessKeyed: this.$link
	}, cfg ) );

	this.noFollow = false;
	this.rel = [];

	this.$icon.prependTo( this.$element );

	this.$element.addClass( 'oojsplus-ui-widget-linkwidget' );
	if ( cfg.rel !== undefined ) {
		this.setRel( cfg.rel );
	} else {
		this.setNoFollow( cfg.noFollow );
	}
};

OO.inheritClass( OOJSPlus.ui.widget.LinkWidget, OO.ui.LabelWidget );
OO.mixinClass( OOJSPlus.ui.widget.LinkWidget, OO.ui.mixin.TabIndexedElement );
OO.mixinClass( OOJSPlus.ui.widget.LinkWidget, OO.ui.mixin.AccessKeyedElement );
OO.mixinClass( OOJSPlus.ui.widget.LinkWidget, OO.ui.mixin.IconElement );

OOJSPlus.ui.widget.LinkWidget.static.tagName = 'span';

OOJSPlus.ui.widget.LinkWidget.prototype.setNoFollow = function ( noFollow ) {
	noFollow = typeof noFollow === 'boolean' ? noFollow : true;

	if ( noFollow !== this.noFollow ) {
		let rel;
		if ( noFollow ) {
			rel = this.rel.concat( [ 'nofollow' ] );
		} else {
			rel = this.rel.filter( ( value ) => value !== 'nofollow' );
		}
		this.setRel( rel );
	}

	return this;
};

OOJSPlus.ui.widget.LinkWidget.prototype.setRel = function ( rel ) {
	if ( !Array.isArray( rel ) ) {
		rel = rel ? [ rel ] : [];
	}

	this.rel = rel;

	this.noFollow = rel.indexOf( 'nofollow' ) !== -1;
	this.$link.attr( 'rel', rel.join( ' ' ) || null );

	return this;
};
