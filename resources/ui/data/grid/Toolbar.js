( function ( mw ) {

	OOJSPlus.ui.data.grid.Toolbar = function ( cfg ) {
		OOJSPlus.ui.data.grid.Toolbar.parent.call( this, cfg );

		this.eventsDisabled = false;
		this.paginator = cfg.paginator || null;
		this.store = cfg.store;
		this.store.connect( this, {
			metadataChange: 'onStoreMetadataChange'
		} );

		this.staticControls = new OO.ui.HorizontalLayout();

		const reloadBtn = new OO.ui.ButtonWidget( {
			title: mw.message( 'oojsplus-data-grid-toolbar-reload-label' ).text(),
			icon: 'reload',
			framed: false,
			classes: [ 'reload-button' ]
		} );
		reloadBtn.connect( this, {
			click: function () {
				if ( this.store instanceof OOJSPlus.ui.data.store.RemoteStore ) {
					this.store.reloadNoCache();
				} else {
					this.store.reload();
				}
			}
		} );

		this.pageSizePicker = new OO.ui.DropdownInputWidget( {
			options: [
				{ data: 25, label: mw.message( 'oojsplus-data-grid-toolbar-page-size-25' ).text() },
				{ data: 50, label: mw.message( 'oojsplus-data-grid-toolbar-page-size-50' ).text() },
				{ data: 100, label: mw.message( 'oojsplus-data-grid-toolbar-page-size-100' ).text() }
			]
		} );
		this.pageSizePicker.connect( this, {
			change: function ( value ) {
				if ( this.eventsDisabled ) {
					return;
				}
				this.store.setLimit( parseInt( value ) );
				this.store.reload();
			}
		} );

		this.staticControls.$element.addClass( 'static-controls' );
		this.staticControls.addItems( [ this.pageSizePicker ] );
		this.addTools( cfg.tools || [] );
		this.staticControls.addItems( [ reloadBtn ] );

		this.$element.append( this.staticControls.$element );

		if ( this.paginator instanceof OOJSPlus.ui.data.grid.Paginator ) {
			this.$element.append( this.paginator.$element );
		}

		this.$element.addClass( 'oojsplus-data-toolbar' );
	};

	OO.inheritClass( OOJSPlus.ui.data.grid.Toolbar, OO.ui.Widget );

	OOJSPlus.ui.data.grid.Toolbar.static.tagName = 'div';

	OOJSPlus.ui.data.grid.Toolbar.prototype.addTools = function ( tools ) {
		const validTools = [];
		for ( let i = 0; i < tools.length; i++ ) {
			if ( tools[ i ] instanceof OO.ui.ButtonWidget ) {
				validTools.push( tools[ i ] );
			}
		}
		this.staticControls.addItems( validTools );
	};

	OOJSPlus.ui.data.grid.Toolbar.prototype.onStoreMetadataChange = function ( metadata ) {
		if ( metadata.pageSize !== this.pageSize ) {
			this.setEventsDisabled( true );
			this.pageSizePicker.setValue( metadata.pageSize );
			this.setEventsDisabled( false );
		}
	};

	OOJSPlus.ui.data.grid.Toolbar.prototype.setEventsDisabled = function ( disabled ) {
		this.eventsDisabled = disabled;
	};
}( mediaWiki ) );
