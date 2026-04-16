OOJSPlus.ui.widget.GroupWidget = function ( cfg ) {
	cfg = cfg || {};
	this.group = cfg || {};
	this.group._exists = false;

	OOJSPlus.ui.widget.GroupWidget.parent.call( this, cfg );
	OO.ui.mixin.PendingElement.call( this, {} );

	this.showRawGroupName = cfg.showRawGroupName || false;
	this.showTypeLabel = cfg.showTypeLabel === undefined ? true : cfg.showTypeLabel;
	this.groupTypeLabel = cfg.groupTypeLabel || mw.msg( 'oojsplus-group-widget-type-label' );

	this.$element.addClass( 'oojsplus-group-widget' );
	this.$nameBox = $( '<div>' ).addClass( 'group-name-cnt' );
	this.assertGroupData().done( () => {
		this.render();
	} );
};

OO.inheritClass( OOJSPlus.ui.widget.GroupWidget, OO.ui.Widget );
OO.mixinClass( OOJSPlus.ui.widget.GroupWidget, OO.ui.mixin.PendingElement );

OOJSPlus.ui.widget.GroupWidget.static.tagName = 'div';

OOJSPlus.ui.widget.GroupWidget.prototype.render = function () {
	if ( !this.group._exists ) {
		this.$element.addClass( 'group-not-found' );
	}
	if ( this.showTypeLabel ) {
		this.$nameBox.append(
			$( '<span>' ).addClass( 'group-type-label' ).text( this.groupTypeLabel )
		);
	}
	this.$nameBox.append(
		$( '<span>' ).addClass( 'group-display' ).text( this.getDisplayName() )
	);
	if ( this.showRawGroupName && this.getDisplayName() !== this.group.group_name ) {
		this.$nameBox.append(
			$( '<span>' ).addClass( 'group-name' ).text( this.group.group_name )
		);
	}
	this.$element.append( this.$nameBox );
	this.emit( 'loaded' );
};

OOJSPlus.ui.widget.GroupWidget.prototype.getDisplayName = function () {
	if ( !this.group._exists ) {
		return this.group.group_name;
	}
	return this.group.displayname || this.group.group_name;
};

OOJSPlus.ui.widget.GroupWidget.prototype.assertGroupData = function () {
	const dfd = $.Deferred();
	const required = [ 'group_name', 'displayname' ];
	let misses = false;

	for ( let i = 0; i < required.length; i++ ) {
		if ( !this.group.hasOwnProperty( required[ i ] ) ) {
			misses = true;
		}
	}
	if ( misses ) {
		if ( !this.group.group_name ) {
			return dfd.resolve().promise();
		}
		this.pushPending();
		mws.commonwebapis.group.getByGroupName( this.group.group_name ).done( ( data ) => {
			if ( !$.isEmptyObject( data ) ) {
				this.group = data;
				this.group._exists = true;
			} else {
				this.group.displayname = this.group.group_name;
			}
			this.popPending();
			dfd.resolve();
		} ).fail( () => {
			this.group.displayname = this.group.group_name;
			this.popPending();
			dfd.resolve();
		} );
		return dfd.promise();
	}

	this.group._exists = true;
	return dfd.resolve().promise();
};
