OOJSPlus.ui.widget.ImageWidget = function ( cfg ) {
	this.width = cfg.width || 40;
	this.height = cfg.height || 40;
	this.fileName = cfg.fileName || '';
	this.fileUrl = cfg.fileUrl || '';

	OOJSPlus.ui.widget.ImageWidget.parent.call( this, cfg );
	OO.ui.mixin.PendingElement.call( this, {} );
	OO.EventEmitter.call( this );
	this.descriptionUrl = '';

	this.$element.addClass( 'oojsplus-image-widget' );

	if ( this.fileUrl.length > 0 ) {
		this.createWidget();
	} else {
		this.assertImageData().done( () => {
			this.createWidget();
		} );
	}
};

OO.inheritClass( OOJSPlus.ui.widget.ImageWidget, OO.ui.Widget );
OO.mixinClass( OOJSPlus.ui.widget.ImageWidget, OO.ui.mixin.PendingElement );
OO.mixinClass( OOJSPlus.ui.widget.ImageWidget, OO.EventEmitter );

OOJSPlus.ui.widget.ImageWidget.static.tagName = 'div';

OOJSPlus.ui.widget.ImageWidget.prototype.assertImageData = function () {
	const dfd = $.Deferred();
	const title = mw.Title.newFromText( 'File:' + this.fileName ),
		imageInfoApi = new mw.Api();
	const apiParams = {
		action: 'query',
		format: 'json',
		prop: 'imageinfo',
		iiprop: 'url',
		titles: title.getPrefixedText()
	};
	this.pushPending();
	imageInfoApi.get( apiParams ).done( ( data ) => {
		const pages = data.query.pages;
		let p;
		for ( p in pages ) {
			this.fileUrl = pages[ p ].imageinfo[ 0 ].url;
			this.descriptionUrl = pages[ p ].imageinfo[ 0 ].descriptionurl;
		}
		this.popPending();
		dfd.resolve();
	} ).fail( () => {
		this.popPending();
		dfd.resolve();
	} );

	return dfd.promise();
};

OOJSPlus.ui.widget.ImageWidget.prototype.createWidget = function () {
	const $imageBox = $( '<div>' ).addClass( 'image-cnt' );

	const $image = $( '<img>' ).addClass( 'oojsplus-image' )
		.attr( 'alt', this.fileName )
		.attr( 'src', this.fileUrl )
		.attr( 'width', this.width )
		.attr( 'height', this.height )
		.attr( 'tabindex', 0 );
	$( $image ).on( 'click keypress', ( event ) => {
		if ( event.type === 'keypress' && event.keyCode !== 13 ) {
			return;
		}
		this.emit( 'preview', this.fileName, this.fileUrl );
	} );

	$( $imageBox ).append( $image );
	this.$element.html( $imageBox );
};
