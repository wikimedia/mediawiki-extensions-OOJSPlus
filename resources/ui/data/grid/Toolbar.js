( function ( mw ) {

	OOJSPlus.ui.data.grid.Toolbar = function ( cfg ) {
		OOJSPlus.ui.data.grid.Toolbar.parent.call( this, cfg );

		this.store = cfg.store;
		this.store.connect( this, {
			loaded: function () {
				this.total = this.store.getTotal();
				this.updateTotal();
			}
		} );
		this.total = 0;
		this.paginator = cfg.paginator || null;

		this.staticControls = new OO.ui.HorizontalLayout();
		this.totalWidget = new OO.ui.LabelWidget();
		this.totalWidget.$element.addClass( 'row-count' );

		const reloadBtn = new OO.ui.ButtonWidget( {
			title: mw.message( 'oojsplus-data-grid-toolbar-reload-label' ).text(),
			icon: 'reload',
			framed: false
		} );
		reloadBtn.connect( this, {
			click: function () {
				this.store.reload();
			}
		} );

		this.staticControls.$element.addClass( 'static-controls' );
		this.addTools( cfg.tools || [] );
		this.staticControls.addItems( [ reloadBtn, this.totalWidget ] );

		if ( this.paginator instanceof OOJSPlus.ui.data.grid.Paginator ) {
			this.$element.append( this.paginator.$element );
		}
		this.$element.append( this.staticControls.$element );
		this.$element.addClass( 'oojsplus-data-toolbar' );
	};

	OO.inheritClass( OOJSPlus.ui.data.grid.Toolbar, OO.ui.Widget );

	OOJSPlus.ui.data.grid.Toolbar.static.tagName = 'div';

	OOJSPlus.ui.data.grid.Toolbar.prototype.updateTotal = function () {
		if ( !this.totalWidget ) {
			return;
		}
		const labelMessage = mw.message( 'oojsplus-data-paginator-page-total-count-label', this.total ).parse();
		this.totalWidget.setLabel( labelMessage );
	};

	OOJSPlus.ui.data.grid.Toolbar.prototype.addTools = function ( tools ) {
		const validTools = [];
		for ( let i = 0; i < tools.length; i++ ) {
			if ( tools[ i ] instanceof OO.ui.ButtonWidget ) {
				validTools.push( tools[ i ] );
			}
		}
		this.staticControls.addItems( validTools );
	};
}( mediaWiki ) );
