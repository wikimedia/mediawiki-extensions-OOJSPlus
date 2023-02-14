OOJSPlus.ui.widget.UserWidget = function( cfg ) {
	this.user = cfg || {};

	OOJSPlus.ui.widget.UserWidget.parent.call( this, cfg );
	OO.ui.mixin.PendingElement.call( this, {} );

	this.showRawUsername = cfg.showRawUsername === undefined ? true : cfg.showRawUsername;
	this.showImage = cfg.showImage === undefined ? true : cfg.showImage;
	this.showLink = cfg.showLink || false;

	this.$element.addClass( 'oojsplus-user-widget' );

	this.assertUserData().done( function() {
		var $nameBox = $( '<div>' ).addClass( 'user-name-cnt' );

		$nameBox.append( $( '<span>' ).addClass( 'user-display' ).text( this.getDisplayName() ) );
		if ( this.showRawUsername && this.getDisplayName() !== this.user.user_name ) {
			$nameBox.append( $( '<span>' ).addClass( 'user-username' ).text( this.user.user_name ) );
		}
		if ( this.showImage ) {
			var $userImage = $( '<span>' ).addClass( 'user-image' );
			if ( this.user.hasOwnProperty( 'user_image' ) && this.user.user_image ) {
				$userImage.html(this.user.user_image );
			} else {
				$userImage.html( $( '<div>' ).addClass( 'user-image-default' ) );
			}
			this.$element.append( $userImage );
		}
		this.$element.append( $nameBox );

		if ( this.showLink && this.user.hasOwnProperty( 'page_url' ) ) {
			// Wrap content of this.$element in a link
			var $link = $( '<a>' ).attr( 'href', this.user.page_url ).append( this.$element.html() );
			this.$element.html( $link );
		}

	}.bind( this ) );
};

OO.inheritClass( OOJSPlus.ui.widget.UserWidget, OO.ui.Widget );
OO.mixinClass( OOJSPlus.ui.widget.UserWidget, OO.ui.mixin.PendingElement );

OOJSPlus.ui.widget.UserWidget.static.tagName = 'div';

OOJSPlus.ui.widget.UserWidget.prototype.getDisplayName = function () {
	return this.user.user_real_name || this.user.user_name;
};

OOJSPlus.ui.widget.UserWidget.prototype.assertUserData = function () {
	var dfd = $.Deferred(), required = [ 'user_name', 'user_real_name' ], misses = false;

	if ( this.showImage ) {
		required.push( 'user_image' );
	}
	if ( this.showLink ) {
		required.push( 'page_url' );
	}
	for ( var i = 0; i < required.length; i++ ) {
		if ( !this.user.hasOwnProperty( required[ i ] ) ) {
			misses = true;
		}
	}
	if ( misses ) {
		this.pushPending();
		mws.commonwebapis.user.getByUsername( this.user.user_name ).done( function ( data ) {
			if ( !$.isEmptyObject( data ) ) {
				this.user = data;
			}
			this.popPending();
			dfd.resolve();
		}.bind( this ) ).fail( function() {
			this.popPending();
			dfd.resolve();
		}.bind( this ) );
		return dfd.promise();
	}

	return dfd.resolve().promise();
};
