OOJSPlus.ui.widget.ChipWidget = function ( config ) {
	config = config || {};
	config.title = config.title ||
		mw.message( 'oojsplus-chip-title-label', config.label || '' ).text();
	OOJSPlus.ui.widget.ChipWidget.parent.call( this, config );
	this.selected = config.selected || false;
	this.canUnselect = config.canUnselect || false;
	this.name = config.name || '';

	OO.ui.mixin.LabelElement.call( this, config );
	OO.ui.mixin.TabIndexedElement.call( this, config );
	OO.ui.mixin.TitledElement.call( this, config );

	this.$element
		.on( 'click', this.select.bind( this ) )
		.on( 'keyup', this.onKeyPress.bind( this ) );

	this.$element
		.addClass( 'oojsplus-chip-widget' )
		.append( this.$label );
	this.$element.attr( 'role', 'button' );
	this.$element.attr( 'aria-pressed', false );
	if ( this.selected ) {
		this.$element.addClass( 'oojsplus-chip-widget-selected' );
		this.$element.attr( 'aria-pressed', true );
	}
	if ( this.canUnselect ) {
		this.closeButton = new OO.ui.ButtonWidget( {
			framed: false,
			icon: 'close',
			tabIndex: -1,
			title: OO.ui.msg( 'ooui-item-remove' ),
			label: '',
			invisibleLabel: true,
			classes: [ 'oojsplus-chip-widget-remove-btn' ]
		} );
		this.closeButton.connect( this, {
			click: 'unselect'
		} );
		if ( !this.selected ) {
			this.closeButton.toggle( false );
		}
		this.$element.append( this.closeButton.$element );
	}
};

OO.inheritClass( OOJSPlus.ui.widget.ChipWidget, OO.ui.Widget );
OO.mixinClass( OOJSPlus.ui.widget.ChipWidget, OO.ui.mixin.LabelElement );
OO.mixinClass( OOJSPlus.ui.widget.ChipWidget, OO.ui.mixin.TabIndexedElement );
OO.mixinClass( OOJSPlus.ui.widget.ChipWidget, OO.ui.mixin.TitledElement );

OOJSPlus.ui.widget.ChipWidget.static.tagName = 'a';

OOJSPlus.ui.widget.ChipWidget.prototype.isSelected = function () {
	return this.selected;
};

OOJSPlus.ui.widget.ChipWidget.prototype.onKeyPress = function ( e ) {
	if ( e.which !== OO.ui.Keys.SPACE && e.which !== OO.ui.Keys.ENTER ) {
		return;
	}
	this.select();
};

OOJSPlus.ui.widget.ChipWidget.prototype.select = function () {
	if ( this.selected ) {
		return;
	}
	this.selected = true;
	this.$element.addClass( 'oojsplus-chip-widget-selected' );
	this.$element.attr( 'aria-pressed', true );
	if ( this.canUnselect ) {
		this.closeButton.toggle( true );
	}
	this.emit( 'select', this.label );
};

OOJSPlus.ui.widget.ChipWidget.prototype.unselect = function () {
	this.selected = false;
	this.$element.removeClass( 'oojsplus-chip-widget-selected' );
	this.$element.attr( 'aria-pressed', false );
	if ( this.canUnselect ) {
		this.closeButton.toggle( false );
		this.emit( 'unselect', this.label );
	}
};

OOJSPlus.ui.widget.ChipWidget.prototype.getName = function () {
	return this.name;
};
