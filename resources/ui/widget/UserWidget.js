OOJSPlus.ui.widget.UserWidget = function( cfg ) {
	this.user = cfg || {};

	OOJSPlus.ui.widget.UserWidget.parent.call( this, cfg );
	OO.ui.mixin.PendingElement.call( this, {} );

	this.showRawUsername = cfg.showRawUsername || false;
	this.showImage = cfg.showImage === undefined ? true : cfg.showImage;
	this.showLink = cfg.showLink === undefined ? true : cfg.showLink;
	this.showProfileOnHover = typeof cfg.showProfileOnHover === 'undefined' ? true : cfg.showProfileOnHover;

	this.$element.addClass( 'oojsplus-user-widget' );
	this.$nameBox = $( '<div>' ).addClass( 'user-name-cnt' );
	this.assertUserData().done( function() {
		this.render();
	}.bind( this ) );
};

OO.inheritClass( OOJSPlus.ui.widget.UserWidget, OO.ui.Widget );
OO.mixinClass( OOJSPlus.ui.widget.UserWidget, OO.ui.mixin.PendingElement );

OOJSPlus.ui.widget.UserWidget.static.tagName = 'div';

OOJSPlus.ui.widget.UserWidget.prototype.render = function() {
	this.$nameBox.append( $( '<span>' ).addClass( 'user-display' ).text( this.getDisplayName() ) );
	if ( this.showRawUsername && this.getDisplayName() !== this.user.user_name ) {
		this.$nameBox.append( $( '<span>' ).addClass( 'user-username' ).text( this.user.user_name ) );
	}
	let $link = null;
	if ( this.showImage ) {
		var $userImage = $( '<span>' ).addClass( 'user-image' );
		if ( this.user.hasOwnProperty( 'user_image' ) && this.user.user_image ) {
			$userImage.html( this.user.user_image );
			if ( this.showLink ) {
				$link = $userImage.find( 'a' ).first();
				$link.append( this.$nameBox );
				this.$element.append( $userImage );
			} else {
				this.$element.append( $userImage );
				this.$element.append( this.$nameBox );
			}
		} else {
			var $defaultImage = $( '<div>' ).addClass( 'user-image-default' );
			if ( this.showLink && this.user.hasOwnProperty( 'page_url' ) ) {
				$link = $( '<a>' ).attr( 'href', this.user.page_url ).append( this.$nameBox );
				$defaultImage.append( $link );
				$userImage.append( $defaultImage );
				this.$element.append( $userImage );
			} else {
				$userImage.append( $defaultImage );
				this.$element.append( $userImage );
				this.$element.append( this.$nameBox );
			}
		}
	} else if ( this.showLink && this.user.hasOwnProperty( 'page_url' ) ) {
		$link = $( '<a>' ).attr( 'href', this.user.page_url ).append( this.$nameBox );
		this.$element.html( $link );
	} else {
		this.$element.append( this.$nameBox );
	}

	if (
		$link &&
		this.showProfileOnHover &&
		ext.userProfile &&
		typeof ext.userProfile.openUserInfoPopup === 'function'
	) {
		$link.on( 'mouseover', function( event ) {
			ext.userProfile.openUserInfoPopup( this.user.user_name, $link );
		}.bind( this ) );
	} else if ( !this.showProfileOnHover && $link ) {
		// Prevent automatic profile popup if not requested
		$link.removeAttr( 'data-bs-username' );
	}
	this.emit( 'loaded' );
};

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
