OOJSPlus.ui.widget.UserWidget = function( cfg ) {
	this.user = cfg || {};

	OOJSPlus.ui.widget.UserWidget.parent.call( this, cfg );
	OO.ui.mixin.PendingElement.call( this, {} );

	this.showRawUsername = cfg.showRawUsername === undefined ? true : cfg.showRawUsername;
	this.showImage = cfg.showImage === undefined ? true : cfg.showImage;
	this.showLink = cfg.showLink || false;

	this.$element.addClass( 'oojsplus-user-widget' );
	this.$nameBox = $( '<div>' ).addClass( 'user-name-cnt' );
	this.assertUserData().done( function() {

		this.$nameBox.append( $( '<span>' ).addClass( 'user-display' ).text( this.getDisplayName() ) );
		if ( this.showRawUsername && this.getDisplayName() !== this.user.user_name ) {
			this.$nameBox.append( $( '<span>' ).addClass( 'user-username' ).text( this.user.user_name ) );
		}

		if ( this.showLink && this.showImage ) {
			var $userImage = $( '<span>' ).addClass( 'user-image' );
			if ( this.user.hasOwnProperty( 'user_image' ) && this.user.user_image ) {
				$userImage.html( this.user.user_image );
				$anchor = $userImage.find( 'a' ).first();
				$( $anchor ).append( this.$nameBox );
			} else {
				var $defaultImage = $( '<div>' ).addClass( 'user-image-default' );
				var $link = $( '<a>' ).attr( 'href', this.user.page_url ).append( this.$nameBox );
				$defaultImage.append( $link );
				$userImage.append( $defaultImage );
			}
			this.$element.append( $userImage );
		} else if ( this.showLink ) {
			var $link = $( '<a>' ).attr( 'href', this.user.page_url ).append( this.$nameBox );
			this.$element.html( $link );
		} else if ( this.showImage ) {
			var $userImage = $( '<span>' ).addClass( 'user-image' );
			if ( this.user.hasOwnProperty( 'user_image' ) && this.user.user_image ) {
				$userImage.html( this.user.user_image );
			} else {
				$userImage.html( $( '<div>' ).addClass( 'user-image-default' ) );
			}
			this.$element.append( $userImage );
		} else {
			this.$element.append( this.$nameBox );
		}
		this.emit( 'loaded' );

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
