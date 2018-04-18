import * as React from 'react';
import { SectionRenderStrategy } from './sectionRenderStrategy';
import { SectionGroupRenderStrategy } from './sectionGroupRenderStrategy';
import { ExpandableNodeRenderStrategy } from './treeView/expandableNodeRenderStrategy';
import { ExpandableNode } from './treeView/expandableNode';
import { LeafNode } from './treeView/leafNode';
import { Constants } from '../constants';
import { Notebook } from '../oneNoteDataStructures/notebook';
import { OneNoteItemUtils } from '../oneNoteDataStructures/oneNoteItemUtils';
import { InnerGlobals } from '../props/globalProps';
import { NotebookOpenedIconSvg } from './icons/notebookOpenedIcon.svg';
import { NotebookClosedIconSvg } from './icons/notebookClosedIcon.svg';
import { ChevronSvg } from './icons/chevron.svg';

export class NotebookRenderStrategy implements ExpandableNodeRenderStrategy {
	onClickBinded = this.onClick.bind(this);

	constructor(private notebook: Notebook, private globals: InnerGlobals) { }

	element(): JSX.Element {
		return (
			<div className={this.isSelected() ? 'picker-selectedItem notebook' : 'notebook'} title={this.notebook.name}>
				<div className={this.isExpanded() ? 'chevron-icon opened' : 'chevron-icon closed'}>
					<ChevronSvg />
				</div>
				<div className='picker-icon'>
					{this.isExpanded() ? <NotebookOpenedIconSvg /> : <NotebookClosedIconSvg />}
				</div>
				<div className='picker-label'>
					<label>{this.notebook.name}</label>
				</div>
			</div>);
	}

	getName(): string {
		return this.notebook.name;
	}

	getId(): string {
		return this.notebook.id;
	}

	getChildren(childrenLevel: number): JSX.Element[] {
		const sectionGroupRenderStrategies = this.notebook.sectionGroups.map(sectionGroup => new SectionGroupRenderStrategy(sectionGroup, this.globals));
		const sectionGroups = sectionGroupRenderStrategies.map(renderStrategy =>
			!!this.globals.callbacks.onSectionSelected || !!this.globals.callbacks.onPageSelected ?
				<ExpandableNode
					expanded={renderStrategy.isExpanded()} node={renderStrategy} globals={this.globals}
					treeViewId={Constants.TreeView.id} key={renderStrategy.getId()}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} /> :
				<LeafNode node={renderStrategy} treeViewId={Constants.TreeView.id} key={renderStrategy.getId()} globals={this.globals}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} />);

		const sectionRenderStrategies = this.notebook.sections.map(section => new SectionRenderStrategy(section, this.globals));
		const sections = sectionRenderStrategies.map(renderStrategy =>
			!!this.globals.callbacks.onPageSelected ?
				<ExpandableNode
					expanded={renderStrategy.isExpanded()} node={renderStrategy} globals={this.globals}
					treeViewId={Constants.TreeView.id} key={renderStrategy.getId()}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} /> :
				<LeafNode node={renderStrategy} treeViewId={Constants.TreeView.id} key={renderStrategy.getId()} globals={this.globals}
					id={renderStrategy.getId()} level={childrenLevel} ariaSelected={renderStrategy.isAriaSelected()} />);

		return sections.concat(sectionGroups);
	}

	isExpanded(): boolean {
		return this.notebook.expanded;
	}

	isSelected(): boolean {
		return this.globals.selectedId === this.notebook.id;
	}

	isAriaSelected(): boolean {
		return this.globals.ariaSelectedId ? this.globals.ariaSelectedId === this.getId() : false;
	}

	private onClick() {
		const onNotebookSelected = this.globals.callbacks.onNotebookSelected;
		if (!!onNotebookSelected) {
			onNotebookSelected(this.notebook, OneNoteItemUtils.getAncestry(this.notebook));
		}

		if (this.globals.callbacks.onSectionSelected || this.globals.callbacks.onPageSelected) {
			this.notebook.expanded = !this.notebook.expanded;
		}
	}
}
