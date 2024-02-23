OOJSPlus.ui.widget.ImageWidget = function( cfg ) {
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
		this.assertImageData().done( function() {
			this.createWidget();
		}.bind( this ) );
	}
};

OO.inheritClass( OOJSPlus.ui.widget.ImageWidget, OO.ui.Widget );
OO.mixinClass( OOJSPlus.ui.widget.ImageWidget, OO.ui.mixin.PendingElement );
OO.mixinClass( OOJSPlus.ui.widget.ImageWidget, OO.EventEmitter );

OOJSPlus.ui.widget.ImageWidget.static.tagName = 'div';

OOJSPlus.ui.widget.ImageWidget.prototype.assertImageData = function () {
	var dfd = $.Deferred();
	var title = mw.Title.newFromText( 'File:' + this.fileName ),
	imageInfoApi = new mw.Api();
	apiParams = {
		action: 'query',
		format: 'json',
		prop: 'imageinfo',
		iiprop: 'url',
		titles: title.getPrefixedText()
	};
	this.pushPending();
	imageInfoApi.get( apiParams ).done( function ( data ) {
		var pages = data.query.pages, p;
		for ( p in pages ) {
			this.fileUrl = pages[ p ].imageinfo[ 0 ].url;
			this.descriptionUrl = pages[ p ].imageinfo[ 0 ].descriptionurl;
		}
		this.popPending();
		dfd.resolve();
	}.bind( this ) ).fail( function() {
		this.popPending();
		dfd.resolve();
	}.bind( this ) );

	return dfd.promise();
};

OOJSPlus.ui.widget.ImageWidget.prototype.createWidget = function () {
	var $imageBox = $( '<div>' ).addClass( 'image-cnt' );

	$image = $( '<img>' ).addClass( 'oojsplus-image' )
				.attr( 'alt', this.fileName )
				.attr( 'src', this.fileUrl )
				.attr( 'width', this.width )
				.attr( 'height', this.height );
	$( $image ).on( 'click', function () {
		this.emit( "preview", this.fileName, this.fileUrl );
	}.bind( this ) );

	$( $imageBox ).append( $image );
	this.$element.html( $imageBox );
};
