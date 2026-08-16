<?php

namespace OOJSPlus\Special;

use MediaWiki\Html\Html;
use MediaWiki\Html\TemplateParser;
use MediaWiki\SpecialPage\SpecialPage;

abstract class OOJSSpecialPage extends SpecialPage {

	/** @var TemplateParser */
	protected $templateParser;

	public function __construct( string $name = '' ) {
		parent::__construct( $name );

		$this->templateParser = new TemplateParser(
			dirname( __DIR__, 2 ) . '/resources/templates'
		);
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $subPage ) {
		parent::execute( $subPage );
		$this->buildSkeleton();
		$this->doExecute( $subPage );
	}

	/**
	 * @return void
	 */
	protected function buildSkeleton() {
		$this->getOutput()->enableOOUI();
		$this->getOutput()->addModuleStyles( [ 'ext.oojsplus.special.skeleton.styles' ] );
		$skeleton = $this->templateParser->processTemplate(
			$this->getTemplateName(),
			[]
		);
		$this->getOutput()->addHTML(
			Html::rawElement( 'div', [ 'id' => 'oojsplus-skeleton-cnt' ],
				$skeleton
			)
		);
	}

	/**
	 * @return string
	 */
	public function getTemplateName() {
		return '';
	}

	/**
	 * @param string|null $subPage
	 * @return void
	 */
	protected function doExecute( $subPage ) {
		// Implement this in your subclass
	}
}
