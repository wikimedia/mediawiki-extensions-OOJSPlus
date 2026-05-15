( function ( mw, $ ) {

	OOJSPlus.ui.data.grid.Paginator = function ( cfg ) {
		OOJSPlus.ui.data.grid.Paginator.parent.call( this, cfg );

		this.store = cfg.store;
		this.grid = cfg.grid;
		this.pageSize = this.store.getPageSize();
		this.total = 0;
		this.rows = {};
		this.hasPages = false;

		this.store.connect( this, {
			// Reload happens when dataset changes (filter conditions change, sorting, setting data...)
			// Here we need to re-init the pagination as the totals may have changed
			reload: 'init'
		} );

		this.navigation = new OO.ui.HorizontalLayout();
		this.$element.addClass( 'oojsplus-data-paginator' );
		this.$element.attr( 'aria-label',
			mw.message( 'oojsplus-data-paginator-aria-label' ).text() );
		this.$element.append( this.navigation.$element );
	};

	OO.inheritClass( OOJSPlus.ui.data.grid.Paginator, OO.ui.Widget );

	OOJSPlus.ui.data.grid.Paginator.static.tagName = 'nav';

	OOJSPlus.ui.data.grid.Paginator.prototype.init = function () {
		this.total = this.store.getTotal();
		this.numberOfPages = Math.ceil( this.total / this.pageSize );

		this.grid.setItems( [] );
		this.navigation.clearItems();

		const initialData = this.store.getData();
		// add first 25 rows (at most) in a non-async way
		this.storeLoadCursor = Math.min( this.pageSize, this.total );
		// record position where next load should start from

		if ( this.total > this.pageSize ) {
			// fill placeholders within rest of this.rows object
			this.rows = Object.assign(
				{},
				...Array.from(
					{ length: this.total },
					( _, index ) => ( { [ index ]: null } )
				)
			);

			for ( let i = 0; i < this.pageSize; i++ ) {
				this.rows[ i ] = initialData[ i ];
			}
			this.createControls();
		} else {
			this.rows = initialData;
		}
		this.currentPage = 0;
		this.createGridPage( 1 );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.createControls = function () {
		this.numberButtonSelectWidget = new OO.ui.ButtonSelectWidget();
		this.numberButtonSelectWidget.$element.css( 'margin-right', '0' );
		this.updateNumberButtonSelect();

		this.firstButton = new OO.ui.ButtonWidget( {
			icon: 'doubleChevronStart',
			title: mw.message( 'oojsplus-data-paginator-first' ).plain(),
			disabled: true
		} );
		this.firstButton.connect( this, {
			click: 'first'
		} );

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

		this.lastButton = new OO.ui.ButtonWidget( {
			icon: 'doubleChevronEnd',
			title: mw.message( 'oojsplus-data-paginator-last' ).plain(),
			disabled: true
		} );
		this.lastButton.connect( this, {
			click: 'last'
		} );

		this.currentEntriesShown = new OO.ui.LabelWidget( {
			classes: [ 'current-entries-visible' ]
		} );

		const groupOfAllButtons = new OO.ui.ButtonGroupWidget();
		groupOfAllButtons.addItems( [
			this.firstButton,
			this.previousButton,
			this.numberButtonSelectWidget,
			this.nextButton,
			this.lastButton
		] );
		this.navigation.addItems( [
			groupOfAllButtons,
			this.currentEntriesShown
		] );
		this.hasPages = true;
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.updateNumberButtonSelect = function () {
		// Dummy button eliminating left side round corners of the first number button
		const firstDummyButtonUnit = new OO.ui.ButtonOptionWidget( {
			data: 0
		} );
		this.numberButtonSelectWidget.addItems( [ firstDummyButtonUnit ] );

		for ( let i = 1; i <= this.numberOfPages; i++ ) {
			const buttonTitle = mw.message(
				'oojsplus-data-paginator-page-number-button-title',
				i.toString()
			).plain();
			const buttonUnit = new OO.ui.ButtonOptionWidget( {
				data: i,
				label: i.toString(),
				title: buttonTitle
			} );
			buttonUnit.$element.attr( 'aria-label', buttonTitle );
			this.numberButtonSelectWidget.addItems( [ buttonUnit ] );
		}

		// Dummy button eliminating right side round corners of the last number button
		const lastDummyButtonUnit = new OO.ui.ButtonOptionWidget( {
			data: this.numberOfPages + 1
		} );
		this.numberButtonSelectWidget.addItems( [ lastDummyButtonUnit ] );

		this.numberButtonSelectWidget.$element.attr(
			'aria-label',
			mw.message( 'oojsplus-data-paginator-page-number-switch-hint' ).text()
		);
		this.numberButtonSelectWidget.selectItem(
			this.numberButtonSelectWidget.findFirstSelectableItem()
		);
		this.numberButtonSelectWidget.connect( this, { select: 'createGridPage' } );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.createGridPage = function ( input ) {
		let pageNumber;

		if ( typeof input === 'object' ) {
			pageNumber = input.data;
		} else if ( typeof input === 'number' ) {
			pageNumber = input;
		} else {
			throw new Error( 'Invalid input type for createGridPage()' );
		}

		if ( this.currentPage === pageNumber ) {
			return;
		}
		const fallbackPage = this.currentPage;
		this.currentPage = pageNumber;
		if ( this.numberButtonSelectWidget ) {
			this.numberButtonSelectWidget.selectItemByData( this.currentPage );
		}

		const start = this.pageSize * ( this.currentPage - 1 ),
			end = ( start + this.pageSize > this.total ? this.total : start + this.pageSize ) - 1;

		this.assertLoaded( start, end ).done( () => {
			this.grid.clearItems();
			this.grid.setItems( this.subsetRows( start, end ) );
			this.updateControls();
		} ).fail( () => {
			this.currentPage = fallbackPage;
			this.grid.setItems( [] );
		} );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.assertLoaded = function ( start, end ) {
		const dfd = $.Deferred();

		if ( this.rows[ end ] === null ) {
			this.store.setOffset( start );
			this.store.load().done( ( data ) => {
				for ( let i = 0; i <= ( end - start ); i++ ) {
					this.rows[ start + i ] = data[ this.storeLoadCursor + i ];
				}
				this.storeLoadCursor = this.storeLoadCursor + end - start + 1;
				dfd.resolve( this.rows );
			} ).fail( ( e ) => {
				dfd.reject( e );
			} );
		} else {
			dfd.resolve( this.rows );
		}

		return dfd.promise();
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.subsetRows = function ( start, end ) {
		const subset = [];
		for ( const index in this.rows ) {
			if ( this.rows[ index ] === null ) {
				continue;
			}
			if ( index < start || index > end ) {
				continue;
			}
			subset.push( this.rows[ index ] );
		}

		return subset;
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.first = function () {
		if ( this.currentPage === 1 ) {
			return;
		}
		this.createGridPage( 1 );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.previous = function () {
		if ( this.currentPage === 1 ) {
			return;
		}
		this.createGridPage( this.currentPage - 1 );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.next = function () {
		if ( this.currentPage + 1 > this.numberOfPages ) {
			return;
		}
		this.createGridPage( this.currentPage + 1 );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.last = function () {
		if ( this.currentPage + 1 > this.numberOfPages ) {
			return;
		}
		this.createGridPage( this.numberOfPages );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.updateControls = function () {
		if ( !this.hasPages ) {
			return;
		}
		this.nextButton.setDisabled( this.currentPage === this.numberOfPages );
		this.lastButton.setDisabled( this.currentPage === this.numberOfPages );
		this.previousButton.setDisabled( this.currentPage === 1 );
		this.firstButton.setDisabled( this.currentPage === 1 );
		this.calculateShowedEntries();

		let minRange = 0;
		if ( this.currentPage === 1 ) {
			minRange = this.currentPage;
		} else if ( this.currentPage === 2 ) {
			minRange = this.currentPage - 1;
		} else if ( this.currentPage === this.numberOfPages - 1 ) {
			minRange = Math.max( this.currentPage - 3, 1 );
		} else if ( this.currentPage === this.numberOfPages ) {
			minRange = Math.max( this.currentPage - 4, 1 );
		} else {
			minRange = this.currentPage - 2;
		}
		const maxRange = Math.min( minRange + 4, this.numberOfPages );

		this.numberButtonSelectWidget.items.forEach( ( buttonUnit ) => {
			if ( minRange <= buttonUnit.data && buttonUnit.data <= maxRange ) {
				buttonUnit.toggle( true );
			} else {
				if ( buttonUnit.isVisible() ) {
					buttonUnit.toggle( false );
				}
			}
		} );
	};

	OOJSPlus.ui.data.grid.Paginator.prototype.calculateShowedEntries = function () {
		const start = 1 + this.pageSize * ( this.currentPage - 1 );
		let end = this.pageSize * this.currentPage;
		if ( end > this.total ) {
			end = this.total;
		}

		if ( end === start ) {
			this.currentEntriesShown.setLabel(
				mw.message( 'oojsplus-data-paginator-page-showed-single-entry', start ).plain()
			);
		} else {
			this.currentEntriesShown.setLabel(
				mw.message( 'oojsplus-data-paginator-page-showed-many-entries', start, end ).plain()
			);
		}
	};
}( mediaWiki, jQuery ) );
