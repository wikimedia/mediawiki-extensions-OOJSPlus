<?php

namespace OOJSPlus\Special;

use MediaWiki\Html\Html;
use MediaWiki\Html\TemplateParser;
use MediaWiki\SpecialPage\SpecialPage;

abstract class OOJSSpecialPage extends SpecialPage {

	/** @var TemplateParser */
	protected $templateParser;

	/**
	 * @param string $name
	 * @param string $restriction Deprecated since 1.46
	 * @param bool $listed Deprecated since 1.46
	 * @param bool $function Deprecated since 1.46
	 * @param string $file Deprecated since 1.46
	 * @param bool $includable Deprecated since 1.46
	 */
	public function __construct( $name = '', $restriction = '', $listed = true,
	$function = false, $file = '', $includable = false ) {
		parent::__construct( ...func_get_args() );

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
