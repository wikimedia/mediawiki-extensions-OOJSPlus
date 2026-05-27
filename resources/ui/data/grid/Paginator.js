OOJSPlus.ui.data.grid.Paginator = function ( cfg ) {
	OOJSPlus.ui.data.grid.Paginator.parent.call( this, cfg );

	this.store = cfg.store;
	this.grid = cfg.grid || null;

	this.currentContinue = [];
	this.pages = [];
	this.data = {};
	this.currentPageIndex = 0;

	this.store.connect( this, {
		// Reload happens when dataset changes (filter conditions change, sorting, setting data...)
		// Here we need to re-init the pagination as the totals may have changed
		beforeReload: 'beforeInit',
		dataAppended: 'onDataAppended',
		metadataChange: 'onMetadataChange'
	} );

	this.navigation = new OO.ui.HorizontalLayout();
	this.$element.addClass( 'oojsplus-data-paginator' );
	this.$element.attr( 'aria-label',
		mw.message( 'oojsplus-data-paginator-aria-label' ).text() );
	this.$element.append( this.navigation.$element );

	this.previousButton = new OO.ui.ButtonWidget( {
		icon: 'previous',
		title: mw.message( 'oojsplus-data-paginator-previous' ).plain(),
		disabled: true
	} );
	this.previousButton.connect( this, {
		click: 'previous'
	} );

	this.nextButton = new OO.ui.ButtonWidget( {
		icon: 'next',
		title: mw.message( 'oojsplus-data-paginator-next' ).plain()
	} );
	this.nextButton.connect( this, {
		click: 'next'
	} );

	this.currentEntriesShown = new OO.ui.LabelWidget( {
		classes: [ 'current-entries-visible' ]
	} );

	this.totalWidget = new OO.ui.LabelWidget();
	this.totalWidget.$element.addClass( 'row-count' );

	this.navigation.addItems( [
		this.previousButton,
		this.nextButton,
		this.currentEntriesShown,
		this.totalWidget
	] );

	this.updateControls();
};

OO.inheritClass( OOJSPlus.ui.data.grid.Paginator, OO.ui.Widget );

OOJSPlus.ui.data.grid.Paginator.prototype.beforeInit = function () {
	this.currentContinue = [];
	this.pages = [];
	this.data = {};
	this.currentPageIndex = 0;
};

OOJSPlus.ui.data.grid.Paginator.prototype.previous = function () {
	if ( this.currentPageIndex === 0 ) {
		return;
	}
	this.emit( 'navigationStarted', 'prev' );
	this.currentPageIndex--;
	this.showRange( this.pages[ this.currentPageIndex ][ 0 ], this.pages[ this.currentPageIndex ][ 1 ] );
	this.emit( 'navigationDone', 'prev' );
};

OOJSPlus.ui.data.grid.Paginator.prototype.next = async function () {
	if (
		( !this.currentContinue || this.currentContinue.length === 0 ) &&
		( this.store.offset + this.store.limit ) >= this.store.getTotal()
	) {
		return;
	}
	this.emit( 'navigationStarted', 'next' );
	this.disableControls();
	this.store.continue = this.currentContinue;
	this.store.offset = this.store.offset + this.store.limit;
	await this.store.load();
	this.previousButton.setDisabled( false );
	this.currentPageIndex++;
	this.enableControls();
	this.emit( 'navigationDone', 'next' );
};

OOJSPlus.ui.data.grid.Paginator.prototype.onDataAppended = function ( data, startIndex, endIndex ) {
	this.pages.push( [ startIndex, endIndex ] );
	this.data = Object.assign( this.data, data );
	this.showRange( startIndex, endIndex );
};

OOJSPlus.ui.data.grid.Paginator.prototype.onMetadataChange = function ( metadata ) {
	this.currentContinue = metadata.continue;
	this.updateTotal( metadata.total, metadata.totalApproximated );
	this.updateControls();
};

OOJSPlus.ui.data.grid.Paginator.prototype.updateControls = function () {
	this.disableControls();
	this.enableControls();
};

OOJSPlus.ui.data.grid.Paginator.prototype.enableControls = function () {
	if (
		( this.currentContinue && this.currentContinue.length > 0 ) ||
		this.store.offset + this.store.limit < this.store.getTotal()
	) {
		this.nextButton.setDisabled( false );
	}
	if ( this.currentPageIndex > 0 ) {
		this.previousButton.setDisabled( false );
	}
};

OOJSPlus.ui.data.grid.Paginator.prototype.disableControls = function () {
	this.nextButton.setDisabled( true );
	this.previousButton.setDisabled( true );
};

OOJSPlus.ui.data.grid.Paginator.prototype.showRange = function ( start, end ) {
	// Get the subset of data to show
	const subset = [];
	for ( const rowIndex in this.data ) {
		const rowIndexInt = parseInt( rowIndex );
		if ( rowIndexInt < start || rowIndexInt > end ) {
			continue;
		}
		subset.push( this.data[ rowIndex ] );
	}
	if ( this.grid ) {
		this.grid.clearItems();
		this.grid.setItems( subset );
	}

	this.emit( 'datasetChange', subset );
	if ( start === end && start === 0 ) {
		this.$element.hide();
		return;
	}
	if ( end === start ) {
		this.currentEntriesShown.setLabel(
			mw.message( 'oojsplus-data-paginator-page-showed-single-entry', start + 1 ).text()
		);
	} else {
		this.currentEntriesShown.setLabel(
			mw.message( 'oojsplus-data-paginator-page-showed-many-entries', start + 1, end + 1).text()
		);
	}
	this.$element.show();
};

OOJSPlus.ui.data.grid.Paginator.prototype.updateTotal = function ( total, isApproximate ) {
	if ( !this.totalWidget ) {
		return;
	}
	if ( isApproximate ) {
		this.totalWidget.setLabel(
			mw.message( 'oojsplus-data-paginator-page-total-count-label-approximate', total ).text()
		);
	} else {
		this.totalWidget.setLabel(
			mw.message( 'oojsplus-data-paginator-page-total-count-label', total ).text()
		);
	}
};
